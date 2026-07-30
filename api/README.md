# Chemistry Tutor API

FastAPI backend for the Reaction Solver. All chemistry logic lives here — the
Next.js frontend never talks to Gemini directly.

## Setup

Requires `GOOGLE_API_KEY` in a `.env` file at the project root (one level up
from this folder) — the same `.env` the old Streamlit app used.

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Endpoints

- `POST /solve` — body `{ "reaction": "CH3COOH + NaOH" }`, returns
  `{ answer, explanation, reaction_type, confidence }`.
- `GET /health` — returns `{ status, api_key_configured }`.
