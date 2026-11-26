# Chemistry Tutor API

FastAPI backend for the app's Gemini-backed features. All chemistry logic
lives here — the Next.js frontend never talks to Gemini directly.

## Setup

Requires `GOOGLE_API_KEY`. Locally, put it in a `.env` file at the project
root (one level up from this folder) — the same `.env` the old Streamlit app
used; `main.py` walks up to find it via `find_dotenv()`. When deployed, set
it directly in the hosting provider's environment/secrets config instead
(see Deployment below) — there is no `.env` file in production.

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Endpoints

- `POST /solve` — body `{ "reaction": "CH3COOH + NaOH" }`, returns
  `{ answer, explanation, reaction_type, confidence }`.
- `POST /doubt` — body `{ question, topic_title, chapter_title, chapter_content }`,
  returns `{ answer }`.
- `POST /generate-questions` — body `{ topic_title, chapter_title, chapter_content, count }`,
  returns `{ questions: [{ prompt, options, answer_index, explanation, difficulty }] }`.
- `POST /smart-search` — body `{ query }`, returns
  `{ answer, related_topics, related_chapter_id }`.
- `POST /mark-answer` — body `{ question_text, marks, marking_points, student_answer }`
  (`marking_points` exactly as stored in `content/questions/class10/*.json`,
  including `{ point: "OR", marks: null }` separators; `student_answer` up to
  2000 characters). Returns `{ points: [{ point, max_marks, awarded_marks,
  reason, branch }], total_awarded, max_marks, practice_bonus, practice_total,
  feedback, caution_notes }`. Per-point marks are capped at each point's
  maximum, only the best OR branch counts, and `total_awarded` never exceeds
  `marks`. `practice_bonus` is +1 for a partly right answer (never on a zero,
  never above full marks) and is kept separate from the honest total.
- `GET /health` — returns `{ status: "ok", api_key_configured }`.

## Deployment (Render)

`render.yaml` at the repo root defines this as a Python web service
(`rootDir: api`, health check `/health`). Deploy via Render's Blueprint
flow (New → Blueprint, point at this repo), then set `GOOGLE_API_KEY` in
the service's Environment tab — it's declared `sync: false` in
`render.yaml` so Render prompts for it rather than expecting it in the repo.

CORS is currently wide open (`allow_origins=["*"]`) so this can be deployed
on a different domain from the frontend without extra config; there's no
auth/cookies here, so that carries no credential-leak risk. Tighten it to
the frontend's real origin once that URL is final, if desired.
