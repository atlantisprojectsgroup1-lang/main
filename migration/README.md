# ATLANTIS — Vercel Migration Guide

## 1. What is in this folder
- `atlantis_db.archive` — full gzip mongodump of the live database (projects, zones, units/inventory, leads, users, team, blog/updates, FAQs, company settings, chat history) from the Emergent preview environment.

## 2. Create MongoDB Atlas (free)
1. mongodb.com/atlas → Sign up → Create a **free M0** cluster (any region near India, e.g. Mumbai).
2. Database Access → Add Database User (username + strong password, avoid `@ : /` in password or URL-encode it).
3. Network Access → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`) — required because Vercel uses dynamic IPs.
4. Connect → Drivers → copy the connection string:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/`

## 3. Restore the data (one command)
On any machine with MongoDB Database Tools installed (or run it here in Emergent before you lose access):

```bash
mongorestore --uri="mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/" \
  --archive=atlantis_db.archive --gzip \
  --nsFrom="test_database.*" --nsTo="atlantis_db.*"
```

This restores everything into a clean database named `atlantis_db`.

Verify:
```bash
mongosh "mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/atlantis_db" \
  --eval 'db.projects.countDocuments({}); db.leads.countDocuments({})'
```
Expect 6 projects and your current lead count.

## 4. Vercel → Project → Settings → Environment Variables

| Key | Value |
|---|---|
| `MONGO_URL` | `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/` (or rely on `MONGODB_URI` — the Vercel↔Atlas integration injects it automatically; the backend reads both) |
| `DB_NAME` | `atlantis_db` |
| `JWT_SECRET` | `9f2c7b1a4e6d8f0a3b5c7d9e1f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b` |
| `ADMIN_EMAIL` | `atlantisprojectsgroup@gmail.com` |
| `ADMIN_PASSWORD` | `Atlantis@2026` |
| `CORS_ORIGINS` | `*` |
| `FRONTEND_URL` | `https://<your-app>.vercel.app` (update after first deploy; used for sitemap/canonical URLs) |
| `OPENAI_API_KEY` | Your own key from platform.openai.com → API keys (starts `sk-...`). Without it the chatbot/Content Studio show graceful fallbacks. |
| `LLM_MODEL` | *(optional)* e.g. `gpt-5.4-mini` to cut chatbot cost. Defaults to `gpt-5.4`. |

Do **NOT** set `EMERGENT_LLM_KEY` or `REACT_APP_BACKEND_URL` on Vercel — the frontend now falls back to same-domain relative `/api` calls automatically.

## 5. Deploy
Push this repo via "Save to Github" → Vercel auto-deploys using the included `vercel.json` (Vercel **Services** architecture):
- `/api/*` → FastAPI serverless function (`backend/server.py`, receives the original `/api/...` path — routes match as-is)
- everything else → React static build (`frontend/build`, SPA fallback handled by the CRA preset)

**One dashboard step**: in Vercel → Project → Settings → General, set the **Framework** setting to **Services** so the `services` block in `vercel.json` is honored (per Vercel's Services docs). No `REACT_APP_BACKEND_URL` needed — the frontend falls back to same-domain relative `/api` calls.

## 6. Known Vercel notes
- **Backend is Node/Express** (`backend/server.js`, deployed via the `express` service in vercel.json) — the Python runtime issues (JWT env KeyError, 500MB bundle, dnspython) are gone. Vercel installs only the 7 small deps in `backend/package.json`. `server.py` remains in the repo as an inactive backup — do not point Vercel at it.
- **Same env vars, same database**: no Vercel env changes needed for the Node switch.
- **Uploads are ephemeral**: files uploaded via Admin (project logos, PDFs) are written to `backend/uploads/` which is read-only/ephemeral on Vercel. The existing committed files (incl. marq-*.jpg and brochure PDFs) are served fine, but NEW uploads won't persist. When you need admin uploads on Vercel, ask me to wire object storage.
- **Cold starts**: the first API call after idle may take 2–5s (serverless warm-up). The DB indexes and admin seeding run on startup.
