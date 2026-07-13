# Chemistry Tutor

Streamlit app answering chemistry questions (Class 9–12, undergrad) with class-appropriate depth, animated visualizations, molecule rendering, and reference videos. Powered by Gemini via LangChain.

## Features

- Class/grade-tuned chat Q&A (concept, calculation, experiment)
- Animated beaker / atom / particle visualizations
- SMILES molecule rendering (RDKit) + reference YouTube videos
- Multi-chat sidebar with chat export
- Optional Google sign-in + persistent chat history

## Setup

```
pip install -r requirements.txt
cp .env.example .env   # add your GOOGLE_API_KEY
streamlit run app.py
```

That's it — chats work session-only by default (lost on refresh/restart).

## Optional: persistent chats (Google sign-in + Supabase)

Copy `.streamlit/secrets.toml.example` → `.streamlit/secrets.toml` and fill in:

- **Google OAuth client** (Google Cloud Console → Credentials → OAuth client ID → Web app, redirect URI `http://localhost:8501/oauth2callback`) → `[auth]` section
- **Supabase project** (supabase.com, free tier) → run this SQL, then grab the URL + service_role key:
  ```sql
  create table chats (
    id uuid primary key, user_email text not null, title text not null,
    display jsonb not null default '[]', updated_at timestamptz not null default now()
  );
  create index on chats (user_email);
  ```

Once both are set, the app gates behind "Sign in with Google" and persists each user's chats automatically.

## Deploying (Streamlit Community Cloud)

Push to GitHub → [share.streamlit.io](https://share.streamlit.io) → New app → point at `app.py` → paste your secrets into **Settings → Secrets** → Deploy.

## Notes

- Per-session rate limit (8 questions/min) protects the shared API key.
- Never commit `.env` or `.streamlit/secrets.toml` — both are gitignored.
