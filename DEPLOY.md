# Deploy CreatorPilot AI to Production

CreatorPilot is a **two-service** app:

| Service | Host | What it runs |
|---------|------|--------------|
| **Frontend** | [Vercel](https://vercel.com) | Next.js dashboard |
| **Backend** | [Railway](https://railway.app) | NestJS API + PostgreSQL + Redis |

Vercel cannot run the NestJS API or background job workers — those go on Railway (free tier available).

---

## Step 1 — Deploy the API on Railway (~5 min)

### 1. Create a Railway project

1. Go to **[railway.app](https://railway.app)** and sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select this repository
4. **Important — Railway dashboard settings for the API service:**
   - **Root Directory:** leave **empty** (repo root `/`) — **NOT** `apps/web`
   - **Builder:** `Dockerfile` (not Railpack/Nixpacks)
   - **Dockerfile path:** `Dockerfile`
5. Railway will use `railway.toml` / `railway.json` at the repo root automatically

> **If you see "Config Error" suggesting `apps/web`:** ignore that — `apps/web` is the Next.js frontend for **Vercel only**. The API builds from the root `Dockerfile`.

### 2. Add PostgreSQL

1. In your Railway project, click **+ New** → **Database** → **PostgreSQL**
2. Railway auto-sets `DATABASE_URL` on your API service — link it:
   - Open the API service → **Variables** → **Add Reference** → select Postgres `DATABASE_URL`

### 3. Add Redis

1. Click **+ New** → **Database** → **Redis**
2. Link `REDIS_URL` to your API service the same way

### 4. Set API environment variables

In the **API service** → **Variables**, add:

| Variable | Value |
|----------|-------|
| `JWT_SECRET` | Long random string (e.g. `openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | `7d` |
| `CORS_ORIGIN` | Your Vercel URL (set after Step 2), e.g. `https://creatorpilot.vercel.app` |
| `OPENAI_API_KEY` | Your OpenAI key *(add later when ready)* |
| `OPENAI_MODEL` | `gpt-4o-mini` |

`DATABASE_URL` and `REDIS_URL` come from the Railway database plugins.

### 5. Deploy and copy your API URL

1. Railway deploys automatically. Wait for **Active** status.
2. Open **Settings** → **Networking** → **Generate Domain**
3. Copy the URL, e.g. `https://creatorpilot-api-production.up.railway.app`

### 6. Seed demo data (optional)

In Railway → API service → **Settings** → run a one-off command or use the shell:

```bash
npm run seed --workspace=@creatorpilot/database
```

---

## Step 2 — Deploy the frontend on Vercel (~3 min)

### Option A: One-click (recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fscrubhubaldawaranestablishment-rgb%2FScrub-Hub.github.io&project-name=creatorpilot-ai&root-directory=apps%2Fweb)

After import, add this environment variable:

| Variable | Value |
|----------|-------|
| `API_PROXY_TARGET` | Your Railway API URL **without** `/api`, e.g. `https://creatorpilot-api-production.up.railway.app` |

Click **Deploy**.

### Option B: Vercel CLI

```bash
npm install -g vercel
cd apps/web
vercel login
vercel --prod
```

When prompted, set **Root Directory** to `apps/web`.

In the Vercel dashboard → **Settings** → **Environment Variables**:

| Variable | Environments | Example |
|----------|--------------|---------|
| `API_PROXY_TARGET` | Production, Preview | `https://creatorpilot-api-production.up.railway.app` |

### 3. Update Railway CORS

Go back to Railway → API **Variables** and set:

```
CORS_ORIGIN=https://your-app.vercel.app
```

Redeploy the API service.

---

## Step 3 — Verify it works

1. Open `https://your-app.vercel.app`
2. Go to **Sign in**
3. Register a new account, or use seeded demo credentials if you ran the seed script
4. Complete the channel setup wizard
5. Try **Trend Research** or **Generate Calendar**

---

## Adding API integrations later

When you have credentials, add them in **Railway** (API service variables):

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | AI content generation |
| `YOUTUBE_API_KEY` | YouTube analytics |
| `YOUTUBE_CLIENT_ID` | YouTube OAuth upload |
| `YOUTUBE_CLIENT_SECRET` | YouTube OAuth upload |
| `YOUTUBE_REDIRECT_URI` | `https://YOUR-RAILWAY-URL/api/integrations/youtube/callback` |
| `TIKTOK_CLIENT_KEY` | TikTok publishing |
| `TIKTOK_CLIENT_SECRET` | TikTok publishing |
| `TIKTOK_REDIRECT_URI` | `https://YOUR-RAILWAY-URL/api/integrations/tiktok/callback` |

Redeploy the API after adding variables. No Vercel changes needed for these.

---

## Architecture diagram

```
User Browser
    │
    ▼
Vercel (your-app.vercel.app)
    │  /api/* proxied to Railway
    ▼
Railway API (NestJS)
    ├── PostgreSQL (content, users, assets)
    └── Redis (BullMQ job queue)
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| **Failed to fetch** on login | Set `API_PROXY_TARGET` in Vercel to your Railway URL (no trailing slash, no `/api`) |
| CORS errors | Set `CORS_ORIGIN` in Railway to your exact Vercel URL |
| AI returns templates only | Add `OPENAI_API_KEY` in Railway |
| Build fails on Vercel | Confirm **Root Directory** is `apps/web` |
| API won't start | Check `DATABASE_URL` and `REDIS_URL` are linked in Railway |

---

## Costs (free tier)

- **Vercel**: Free hobby plan
- **Railway**: $5/month free credit (enough for light usage)
- **OpenAI**: Pay per use when you add your key
