import json
import logging
import os
import re

from dotenv import find_dotenv, load_dotenv
from fastapi import FastAPI, HTTPException
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

app = FastAPI(title="Chemistry Tutor API")

# Wide open for now — this API has no auth/cookies, so a wildcard origin
# carries no credential-leak risk, and it lets the frontend be deployed
# separately (different domain) without needing to know its URL up front.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    reaction: str = Field(..., min_length=1, max_length=500)


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


@app.post("/solve", response_model=SolveResponse)
def solve(request: SolveRequest) -> SolveResponse:
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


@app.post("/doubt", response_model=DoubtResponse)
def doubt(request: DoubtRequest) -> DoubtResponse:
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


@app.post("/generate-questions", response_model=GenerateQuestionsResponse)
def generate_questions(request: GenerateQuestionsRequest) -> GenerateQuestionsResponse:
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
    query: str = Field(..., min_length=1, max_length=300)


class SmartSearchResponse(BaseModel):
    answer: str
    related_topics: list[str]
    related_chapter_id: str | None = None


@app.post("/smart-search", response_model=SmartSearchResponse)
def smart_search(request: SmartSearchRequest) -> SmartSearchResponse:
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


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "api_key_configured": bool(GOOGLE_API_KEY)}
