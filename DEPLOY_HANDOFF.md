# Deployment handoff — Athena (GMAT)

Deployed 2026-08-10. **Contains no secrets** — those are in `.env.production.cloud` (gitignored).

> The repo `hikmat12345/gmat-agentic-app` is **public**. Never commit real keys.

---

## What is already live

| Service | Vercel project | URL | State |
|---|---|---|---|
| Frontend (Next.js) | `gmat-agentic-app` | https://gmat-agentic-app.vercel.app | Landing page + Clerk sign-in render |
| Backend (FastAPI) | `athena-agents` | https://athena-agents.vercel.app | Running; `/` returns `{"detail":"Not Found"}` (no root route — correct) |
| Database | Supabase `oxgyjwcwxzdkmsupunkq` | ap-south-1 (Mumbai), Free | **Empty — 0 tables in `public`** |

Env vars are already set in both Vercel projects (19 on frontend, 7 on backend) and
cross-wired: `AGENT_SERVICE_URL` → backend, `ALLOWED_ORIGINS`/`APP_URL` → frontend.
Both auto-deploy on push to `main`.

---

## THE ONE BLOCKER: the database is empty

`/api/health` currently returns `{"status":"error","database":"disconnected"}`.
Nothing past the landing page works until the schema is pushed.

```bash
# 1. Put the DB password into .env.production.cloud (replace <DB_PASSWORD>)
#    Supabase dashboard -> Settings -> Database -> Database password
# 2. From the repo root, in Git Bash:
bash scripts/push-schema-to-cloud.sh
```

That script links the project, runs `supabase db push` (25 migrations), then seeds
in dependency order (topics → quiz questions → onboarding → hints) and verifies.

### Gotcha
`supabase/.temp/project-ref` holds a **stale ref** (`xyhkkzuomlzfqfkdyoor`) pointing at
a project that no longer exists. `supabase link` overwrites it — just don't trust that
file as the source of truth.

---

## Known issues, in priority order

### 1. Rotate the Supabase secret key — do this first
`SUPABASE_SERVICE_ROLE_KEY` was exposed in a chat transcript. It bypasses **all**
row-level security. Supabase → Settings → API Keys → create a new secret key, update
it in both Vercel projects and `.env.production.cloud`, then delete the old one.

### 2. Scheduled emails do not run
`main.py` `lifespan` spawns two infinite loops — `session_reminder_loop` (every 30 min)
and `weekly_summary_loop`. Vercel freezes functions between requests, so they never
fire. They're now guarded by `if os.environ.get("VERCEL")` so they don't slow cold starts.

- `weekly_summary_loop` → can move to a Vercel cron job (Hobby allows daily).
- `session_reminder_loop` → **cannot work on Hobby.** It needs 30-minute granularity to
  fire 1–2h before a session; Hobby cron is daily-only. Needs a container host
  (Render/Railway/Fly) or a Pro plan to work at all.

### 3. Clerk is on a development instance
Sign-in card says "Development mode" and is titled "My Application". The `pk_test_`
keys are rate-limited and not production-safe. Add the Vercel domain in the Clerk
dashboard and swap to production keys.

Note: there is **no `/api/webhooks/clerk` route in this codebase** — only
`app/api/stripe/webhooks`. `CLERK_WEBHOOK_SECRET` is referenced nowhere. User sync
runs through `/api/user/sync`. Skip any webhook step in older deploy notes.

### 4. ElevenLabs TTS is dead
`ELEVENLABS_API_KEY` is blank locally so it wasn't set in Vercel. Only
`ELEVENLABS_VOICE_ID` is configured. TTS endpoints will fail until a key is added.

### 5. `ADMIN_EMAILS` may lock you out
Set to `hikmatullahkust@gmail.com`. `/admin` only works if you sign into the app with
that exact address via Clerk — not `hikmatullahmcs@`. Add both if needed.

---

## Vercel account notes

- Vercel login is `hkyopko@gmail.com`; its GitHub identity was relinked from
  `hikmat-codebox` to `hikmat12345` so it can see this repo. Don't disconnect it again.
- Backend deploys from root `backend/agents` using `vercel.json` +
  `api/index.py` (ASGI shim) + `requirements.txt`.
- `maxDuration` is 300s via Fluid compute — enough for the SSE lesson streams.
- Installed deps are ~133 MB unzipped, against a 250 MB cap. Adding heavy packages
  could push it over; `uvicorn` is deliberately excluded (Vercel supplies the server).

## Render (abandoned)
A fully-configured `athena-agents` Docker service exists in the Render dashboard but was
never deployed — Render now demands card verification even for free instances. `render.yaml`
is still in the repo and is accurate, minus `APP_URL` which it omits. That's the fallback
if the cron emails in issue #2 turn out to matter.
