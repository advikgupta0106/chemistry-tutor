import json
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

DOUBT_SYSTEM_PROMPT = """You are a CBSE Class 11 chemistry tutor. Answer the \
student's doubt using only the content from this specific chapter. If the \
question is outside this chapter's scope, say so and suggest which topic to \
look at. Keep answers concise, use proper chemical notation, and focus on \
exam-relevant understanding.

Write chemical formulas in plain text (CH3COOH, not CH₃COOH or LaTeX) — \
subscript formatting is handled by the caller, not you."""

app = FastAPI(title="Chemistry Tutor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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


class DoubtRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=1000)
    topic_title: str = Field(..., min_length=1, max_length=200)
    chapter_title: str = Field(..., min_length=1, max_length=200)
    chapter_content: str = Field(..., min_length=1, max_length=20000)


class DoubtResponse(BaseModel):
    answer: str


@app.post("/doubt", response_model=DoubtResponse)
def doubt(request: DoubtRequest) -> DoubtResponse:
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=422, detail="Question cannot be empty.")

    try:
        model = get_model()
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    human_content = (
        f"Topic: {request.topic_title}\n"
        f"Chapter: {request.chapter_title}\n\n"
        f"Chapter content:\n{request.chapter_content}\n\n"
        f"Student's question: {question}"
    )

    try:
        response = model.invoke(
            [SystemMessage(content=DOUBT_SYSTEM_PROMPT), HumanMessage(content=human_content)]
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


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "api_key_configured": bool(GOOGLE_API_KEY)}
