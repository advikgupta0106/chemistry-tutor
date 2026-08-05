import json
import logging
import os
import re
import time
from collections import defaultdict

from dotenv import find_dotenv, load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field

# Walks up from this file to find the project's root .env (this app is
# meant to run from /api, but the .env lives one level up alongside the
# Next.js frontend).
load_dotenv(find_dotenv())

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("chemistry-tutor-api")

# --- Rate limiting -----------------------------------------------------
# Simple in-memory sliding-window limiter, no extra dependency. Applied per
# client IP across every AI-backed endpoint (not /health), since those are
# the ones that cost real Gemini API quota/money. Note: this state lives in
# a single process's memory — if this API is ever run with multiple worker
# processes, each worker enforces its own separate limit rather than a
# shared one. Fine for this app's current single-process deployment.
RATE_LIMIT_MAX_REQUESTS = 10
RATE_LIMIT_WINDOW_SECONDS = 60

_request_log: dict[str, list[float]] = defaultdict(list)


def _client_ip(request: Request) -> str:
    # Render (and most reverse proxies) set X-Forwarded-For to the real
    # client IP; request.client.host would otherwise just be the proxy.
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def rate_limit(request: Request) -> None:
    ip = _client_ip(request)
    now = time.monotonic()
    window_start = now - RATE_LIMIT_WINDOW_SECONDS

    timestamps = _request_log[ip]
    while timestamps and timestamps[0] < window_start:
        timestamps.pop(0)

    if len(timestamps) >= RATE_LIMIT_MAX_REQUESTS:
        raise HTTPException(
            status_code=429,
            detail="Too many requests, please wait a moment.",
        )

    timestamps.append(now)


# --- Input length limits -------------------------------------------------
# Caps the free-typed fields a student directly types into a box (the
# reaction, the doubt question, the search query) at 500 characters, to
# stop a single request from ballooning token cost. Applied to those
# fields specifically, not to app-supplied chapter content/context fields
# (chapter_content, chapter_summary, sections) — those legitimately run to
# several thousand characters for a real NCERT chapter, and capping them at
# 500 would break /doubt and /generate-questions outright rather than add
# any real security value, since that text never came from an open-ended
# user text box in the first place.
MAX_TEXT_FIELD_LENGTH = 500


def check_length(value: str) -> None:
    if len(value) > MAX_TEXT_FIELD_LENGTH:
        raise HTTPException(
            status_code=400,
            detail="Input too long. Please keep your query under 500 characters.",
        )


GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

SYSTEM_PROMPT = """You are a CBSE chemistry tutor helping a Class 11/12 student \
understand a chemical reaction they typed in plain text (e.g. "CH3COOH + NaOH"), \
which may be unbalanced and may not specify products.

Given the reaction, you must:
1. Work out the products (if not given) and balance the full chemical equation.
2. Identify and name the reaction type (e.g. acid-base neutralisation, redox, \
addition, substitution, precipitation, combustion, esterification).
3. Explain, in plain language a CBSE student would understand, what happens \
chemically in the reaction and why.
4. Rate your own confidence in this answer as exactly one of "Low", "Medium", \
or "High" — use "High" only when you are certain of both the products and the \
balancing, "Medium" if there is some ambiguity in the expected products, and \
"Low" if the input doesn't look like a clear, valid chemical reaction.

Respond with ONLY a single JSON object, no markdown code fences, no extra \
commentary, with exactly these keys:
{
  "answer": "the balanced chemical equation as plain text, e.g. CH3COOH + NaOH -> CH3COONa + H2O",
  "explanation": "a short, clear explanation of what happens in the reaction",
  "reaction_type": "the name of the reaction type",
  "confidence": "Low, Medium, or High"
}

Write chemical formulas in plain text (CH3COOH, not CH₃COOH or LaTeX) — \
subscript formatting is handled by the caller, not you. Do not include any \
commentary outside the JSON object."""

DOUBT_SYSTEM_PROMPT = """You are a strict CBSE Class 11 chemistry exam tutor. \
The student is asking about this chapter: {chapter_title} from {topic_title}.

Rules:
- Answer ONLY using concepts from this chapter
- Structure every answer as: Definition → Explanation → Example → Exam tip
- Use proper chemical notation with subscripts
- If it's a 'why' question, give the textbook reasoning that CBSE markers expect
- End every answer with 'Exam tip:' followed by one line on how this concept \
is typically asked in exams (MCQ pattern, common traps, or marks weightage)
- Keep answers under 150 words — students need concise, memorizable responses
- If the question is outside this chapter, say so and name the correct chapter

Write chemical formulas in plain text (CH3COOH, not CH₃COOH or LaTeX) — \
subscript formatting is handled by the caller, not you."""

QUESTIONS_SYSTEM_PROMPT = """You are a CBSE Class 11 chemistry question paper \
setter. Generate exactly {count} MCQ questions based ONLY on this chapter's \
content. Each question must have 4 options, one correct answer, and a \
one-line explanation. Vary difficulty: 2 easy, 2 medium, 1 hard (adjust this \
mix proportionally if {count} is not 5).

Respond with ONLY a JSON array, no markdown code fences, no extra commentary, \
where each element has exactly these keys:
{{
  "prompt": "the question text",
  "options": ["option A", "option B", "option C", "option D"],
  "answer_index": 0,
  "explanation": "a one-line explanation of why that option is correct",
  "difficulty": "easy, medium, or hard"
}}

"options" must always have exactly 4 entries, and "answer_index" must be the \
0-based index of the correct option within "options". Write chemical formulas \
in plain text (CH3COOH, not CH₃COOH or LaTeX) — subscript formatting is \
handled by the caller, not you."""

VALID_TOPIC_IDS = [
    "some-basic-concepts",
    "structure-of-atom",
    "periodic-table",
    "chemical-bonding",
    "thermodynamics",
    "equilibrium",
    "redox-reactions",
    "organic-chemistry-basics",
    "hydrocarbons",
]

SMART_SEARCH_SYSTEM_PROMPT = """You are a chemistry study assistant helping a \
CBSE Class 11 student search for topics. Given the student's query, return a \
JSON object with:
{{
  "answer": "a direct answer to the query, in 2-3 sentences",
  "related_topics": ["topic IDs, from this exact list, that are relevant: {topic_ids}"],
  "related_chapter_id": "the single most relevant chapter ID if you can confidently identify one, otherwise null"
}}

Only use topic IDs from this exact list — never invent one: {topic_ids}. If \
none are relevant, return an empty array for "related_topics". Only set \
"related_chapter_id" when you are confident of the specific chapter; \
otherwise use JSON null, not a guess.

Respond with ONLY the JSON object, no markdown code fences, no extra \
commentary. Write chemical formulas in plain text (CH3COOH, not CH₃COOH or \
LaTeX) — subscript formatting is handled by the caller, not you."""

IDENTIFY_SYSTEM_PROMPT = """Identify this molecule. Return JSON:
{
  "name": "common name",
  "formula": "molecular formula, plain text (C6H6, not C₆H₆ or LaTeX)",
  "iupac_name": "IUPAC name",
  "molar_mass": "molar mass with units, e.g. 180.16 g/mol",
  "type": "short category, e.g. Aromatic Hydrocarbon, Carboxylic Acid",
  "hybridization": "hybridization of the central/defining atom, e.g. sp2",
  "bond_angle": "characteristic bond angle, e.g. 120°",
  "about": "one or two sentences describing the molecule"
}

If the input is a description rather than a name (e.g. "the acid in lemons"),
figure out which specific molecule they mean and identify that one. If you
genuinely cannot identify a real molecule from the input, still return the
JSON object with your best guess rather than refusing, but keep "about"
honest about any uncertainty.

Respond with ONLY the JSON object, no markdown code fences, no extra
commentary."""

app = FastAPI(title="Chemistry Tutor API")

# Wildcard only for local dev (ENV=dev) — locked to the real deployed
# frontend otherwise, since this API has no auth of its own and a wildcard
# origin in production would let any site call it from a browser.
ALLOWED_ORIGINS = ["*"] if os.getenv("ENV") == "dev" else ["https://atomica-xi.vercel.app"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

_model: ChatGoogleGenerativeAI | None = None


def get_model() -> ChatGoogleGenerativeAI:
    global _model
    if _model is None:
        if not GOOGLE_API_KEY:
            raise RuntimeError(
                "GOOGLE_API_KEY is not configured. Add it to a .env file at the "
                "project root."
            )
        _model = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash", google_api_key=GOOGLE_API_KEY
        )
    return _model


class SolveRequest(BaseModel):
    # No max_length here — check_length() enforces the 500-char limit
    # explicitly in the endpoint body, so the response is our own 400 with
    # the required message instead of FastAPI's generic 422.
    reaction: str = Field(..., min_length=1)


class SolveResponse(BaseModel):
    answer: str
    explanation: str
    reaction_type: str
    confidence: str


def extract_json(text: str) -> dict:
    text = text.strip()
    fence_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if fence_match:
        text = fence_match.group(1)
    else:
        brace_match = re.search(r"\{.*\}", text, re.DOTALL)
        if brace_match:
            text = brace_match.group(0)
    return json.loads(text)


@app.post("/solve", response_model=SolveResponse, dependencies=[Depends(rate_limit)])
def solve(request: SolveRequest) -> SolveResponse:
    check_length(request.reaction)
    reaction = request.reaction.strip()
    if not reaction:
        raise HTTPException(status_code=422, detail="Reaction text cannot be empty.")

    try:
        model = get_model()
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    try:
        response = model.invoke(
            [SystemMessage(content=SYSTEM_PROMPT), HumanMessage(content=reaction)]
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="Couldn't reach the chemistry model right now. Please try again in a moment.",
        ) from exc

    raw = response.content if isinstance(response.content, str) else str(response.content)

    try:
        data = extract_json(raw)
        return SolveResponse(
            answer=str(data["answer"]),
            explanation=str(data["explanation"]),
            reaction_type=str(data["reaction_type"]),
            confidence=str(data["confidence"]),
        )
    except (json.JSONDecodeError, KeyError, TypeError) as exc:
        raise HTTPException(
            status_code=502,
            detail="Got an unexpected response from the chemistry model. Please try rephrasing the reaction.",
        ) from exc


class DoubtSection(BaseModel):
    heading: str
    body: str
    key_point: str | None = None


class DoubtRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=1000)
    topic_title: str = Field(..., min_length=1, max_length=200)
    chapter_title: str = Field(..., min_length=1, max_length=200)
    chapter_summary: str = Field("", max_length=2000)
    sections: list[DoubtSection] = Field(..., min_length=1)


class DoubtResponse(BaseModel):
    answer: str


def format_chapter_context(chapter_summary: str, sections: list[DoubtSection]) -> str:
    # Lays out every section's heading, body and key point explicitly and in
    # order, rather than a single opaque blob — so the model gets the same
    # actual NCERT-derived content the student is reading, clearly
    # attributable section by section, not a lossy paraphrase of it.
    lines = []
    if chapter_summary:
        lines.append(f"Summary: {chapter_summary}")
    for i, section in enumerate(sections, start=1):
        lines.append(f"\nSection {i}: {section.heading}")
        lines.append(section.body)
        if section.key_point:
            lines.append(f"Key point: {section.key_point}")
    return "\n".join(lines)


@app.post("/doubt", response_model=DoubtResponse, dependencies=[Depends(rate_limit)])
def doubt(request: DoubtRequest) -> DoubtResponse:
    check_length(request.question)
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=422, detail="Question cannot be empty.")

    try:
        model = get_model()
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    system_prompt = DOUBT_SYSTEM_PROMPT.format(
        chapter_title=request.chapter_title, topic_title=request.topic_title
    )
    chapter_context = format_chapter_context(request.chapter_summary, request.sections)
    human_content = f"Chapter content:\n{chapter_context}\n\nStudent's question: {question}"

    logger.info(
        "/doubt chapter=%r sections=%d system_prompt_chars=%d human_content_chars=%d total_chars=%d",
        request.chapter_title,
        len(request.sections),
        len(system_prompt),
        len(human_content),
        len(system_prompt) + len(human_content),
    )

    try:
        response = model.invoke(
            [SystemMessage(content=system_prompt), HumanMessage(content=human_content)]
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="Couldn't reach the chemistry model right now. Please try again in a moment.",
        ) from exc

    raw = response.content if isinstance(response.content, str) else str(response.content)
    answer = raw.strip()
    if not answer:
        raise HTTPException(
            status_code=502,
            detail="Got an empty response from the chemistry model. Please try rephrasing your question.",
        )

    return DoubtResponse(answer=answer)


class GenerateQuestionsRequest(BaseModel):
    topic_title: str = Field(..., min_length=1, max_length=200)
    chapter_title: str = Field(..., min_length=1, max_length=200)
    chapter_content: str = Field(..., min_length=1, max_length=20000)
    count: int = Field(5, ge=1, le=10)


class GeneratedQuestion(BaseModel):
    prompt: str
    options: list[str]
    answer_index: int
    explanation: str
    difficulty: str = "medium"


class GenerateQuestionsResponse(BaseModel):
    questions: list[GeneratedQuestion]


def extract_json_array(text: str) -> list:
    text = text.strip()
    fence_match = re.search(r"```(?:json)?\s*(\[.*?\])\s*```", text, re.DOTALL)
    if fence_match:
        text = fence_match.group(1)
    else:
        bracket_match = re.search(r"\[.*\]", text, re.DOTALL)
        if bracket_match:
            text = bracket_match.group(0)
    return json.loads(text)


@app.post(
    "/generate-questions",
    response_model=GenerateQuestionsResponse,
    dependencies=[Depends(rate_limit)],
)
def generate_questions(request: GenerateQuestionsRequest) -> GenerateQuestionsResponse:
    # topic_title/chapter_title are the only fields here that resemble
    # free-typed text (both already capped at 200 chars anyway); chapter_content
    # is real NCERT chapter text, legitimately several thousand characters,
    # and deliberately not subject to this check — see MAX_TEXT_FIELD_LENGTH.
    check_length(request.topic_title)
    check_length(request.chapter_title)

    try:
        model = get_model()
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    human_content = (
        f"Topic: {request.topic_title}\n"
        f"Chapter: {request.chapter_title}\n\n"
        f"Chapter content:\n{request.chapter_content}"
    )
    system_prompt = QUESTIONS_SYSTEM_PROMPT.format(count=request.count)

    try:
        response = model.invoke(
            [SystemMessage(content=system_prompt), HumanMessage(content=human_content)]
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="Couldn't reach the chemistry model right now. Please try again in a moment.",
        ) from exc

    raw = response.content if isinstance(response.content, str) else str(response.content)

    try:
        items = extract_json_array(raw)
        questions = [GeneratedQuestion(**item) for item in items]
    except (json.JSONDecodeError, TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=502,
            detail="Got an unexpected response from the chemistry model. Please try again.",
        ) from exc

    for q in questions:
        if len(q.options) != 4 or not (0 <= q.answer_index < len(q.options)):
            raise HTTPException(
                status_code=502,
                detail="Got malformed questions from the chemistry model. Please try again.",
            )

    if not questions:
        raise HTTPException(
            status_code=502,
            detail="Didn't get any questions back from the chemistry model. Please try again.",
        )

    return GenerateQuestionsResponse(questions=questions)


class SmartSearchRequest(BaseModel):
    query: str = Field(..., min_length=1)


class SmartSearchResponse(BaseModel):
    answer: str
    related_topics: list[str]
    related_chapter_id: str | None = None


@app.post("/smart-search", response_model=SmartSearchResponse, dependencies=[Depends(rate_limit)])
def smart_search(request: SmartSearchRequest) -> SmartSearchResponse:
    check_length(request.query)
    query = request.query.strip()
    if not query:
        raise HTTPException(status_code=422, detail="Query cannot be empty.")

    try:
        model = get_model()
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    system_prompt = SMART_SEARCH_SYSTEM_PROMPT.format(topic_ids=", ".join(VALID_TOPIC_IDS))

    try:
        response = model.invoke([SystemMessage(content=system_prompt), HumanMessage(content=query)])
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="Couldn't reach the chemistry model right now. Please try again in a moment.",
        ) from exc

    raw = response.content if isinstance(response.content, str) else str(response.content)

    try:
        data = extract_json(raw)
        related_topics = [t for t in data.get("related_topics", []) if t in VALID_TOPIC_IDS]
        related_chapter_id = data.get("related_chapter_id") or None
        return SmartSearchResponse(
            answer=str(data["answer"]),
            related_topics=related_topics,
            related_chapter_id=str(related_chapter_id) if related_chapter_id else None,
        )
    except (json.JSONDecodeError, KeyError, TypeError) as exc:
        raise HTTPException(
            status_code=502,
            detail="Got an unexpected response from the chemistry model. Please try a different search.",
        ) from exc


class IdentifyMoleculeRequest(BaseModel):
    query: str = Field(..., min_length=1)


class IdentifyMoleculeResponse(BaseModel):
    name: str
    formula: str
    iupac_name: str
    molar_mass: str
    type: str
    hybridization: str
    bond_angle: str
    about: str


@app.post(
    "/identify-molecule",
    response_model=IdentifyMoleculeResponse,
    dependencies=[Depends(rate_limit)],
)
def identify_molecule(request: IdentifyMoleculeRequest) -> IdentifyMoleculeResponse:
    check_length(request.query)
    query = request.query.strip()
    if not query:
        raise HTTPException(status_code=422, detail="Query cannot be empty.")

    try:
        model = get_model()
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    try:
        response = model.invoke(
            [SystemMessage(content=IDENTIFY_SYSTEM_PROMPT), HumanMessage(content=query)]
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="Couldn't reach the chemistry model right now. Please try again in a moment.",
        ) from exc

    raw = response.content if isinstance(response.content, str) else str(response.content)

    try:
        data = extract_json(raw)
        return IdentifyMoleculeResponse(
            name=str(data["name"]),
            formula=str(data["formula"]),
            iupac_name=str(data["iupac_name"]),
            molar_mass=str(data["molar_mass"]),
            type=str(data["type"]),
            hybridization=str(data["hybridization"]),
            bond_angle=str(data["bond_angle"]),
            about=str(data["about"]),
        )
    except (json.JSONDecodeError, KeyError, TypeError) as exc:
        raise HTTPException(
            status_code=502,
            detail="Couldn't identify that molecule. Try rephrasing your search.",
        ) from exc


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "api_key_configured": bool(GOOGLE_API_KEY)}
