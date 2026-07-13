# Chemistry Tutor

A Streamlit app that answers chemistry questions for Class 9–12 and undergraduate students, with class-appropriate depth, animated visualizations (beaker reactions, atomic structure, particle motion), molecule rendering, and reference video suggestions. Powered by Google Gemini via LangChain.

## Features

- Chat-based Q&A tuned to a selected class/grade level
- Auto-detects concept / calculation / experiment questions and adapts the response format
- Animated visualizations for reactions, atomic structure, and gas particle behavior
- Molecule structure rendering from SMILES (RDKit)
- Reference YouTube videos per answer
- Multiple chat sessions, with a "download this chat" export
- Chemistry term highlighting in explanations
- Optional: Google sign-in + persistent chat history across visits (see below)

## Local setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
2. Copy `.env.example` to `.env` and add your own Google Generative AI API key:
   ```
   cp .env.example .env
   ```
3. Run the app:
   ```
   streamlit run app.py
   ```

Without any further setup, the app works fully — chats just won't survive a page refresh or restart (they live only in that browser session). The two optional setups below make chat history persistent per signed-in student.

## Optional: persistent chat history (Google sign-in + Supabase)

Skip this section if session-only chats are fine for your use case. To make chats survive refreshes, restarts, and return visits (e.g. 30+ days later):

### 1. Create a Google OAuth client (for sign-in)

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials**.
2. Click **Create Credentials → OAuth client ID**, application type **Web application**.
3. Add an authorized redirect URI:
   - Local dev: `http://localhost:8501/oauth2callback`
   - Deployed: `https://<your-app>.streamlit.app/oauth2callback`
4. Note the generated **Client ID** and **Client Secret**.

This is a separate credential from your Gemini `GOOGLE_API_KEY` — don't mix them up.

### 2. Create a Supabase project (for storage)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL editor, run:
   ```sql
   create table chats (
     id uuid primary key,
     user_email text not null,
     title text not null,
     display jsonb not null default '[]',
     updated_at timestamptz not null default now()
   );
   create index on chats (user_email);
   ```
3. From **Project Settings → API**, note the **Project URL** and the **service_role key** (not the anon key — the service role key is only ever used server-side by this app, never sent to the browser).

### 3. Configure secrets

Copy `.streamlit/secrets.toml.example` to `.streamlit/secrets.toml` (gitignored) and fill in:
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
- the `[auth]` section with your Google OAuth `client_id`/`client_secret`, plus a random `cookie_secret` (generate one with `python -c "import secrets; print(secrets.token_hex(32))"`)

Once these are present, the app will show a "Sign in with Google" screen and persist each signed-in user's chats to Supabase automatically.

## Deploying to Streamlit Community Cloud

1. Push this repo to GitHub (do **not** commit `.env` or `.streamlit/secrets.toml`).
2. Create a new app on [share.streamlit.io](https://share.streamlit.io) pointing at `app.py`.
3. In the app's **Settings → Secrets**, paste the same contents you'd put in `.streamlit/secrets.toml` (at minimum `GOOGLE_API_KEY`; add the Supabase/`[auth]` values too if you want persistence).
4. Deploy.

## Notes

- A per-session rate limit caps how many questions one browser session can ask per minute, to protect the shared API key from being exhausted by a single user.
- If Supabase/auth secrets aren't configured, chat history is session-only by design — use the download button to save a copy of a chat.
