# Railway Deployment Fix

If Railway shows **"Config Error"** and suggests setting Root Directory to `apps/web` — **do not do that**.

## Correct Railway settings (API backend)

| Setting | Value |
|---------|-------|
| **Root Directory** | *(empty — repo root)* |
| **Builder** | `Dockerfile` |
| **Dockerfile path** | `Dockerfile` |
| **Start command** | *(leave empty — uses Dockerfile CMD)* |

## Wrong vs right

| Platform | Root Directory | What deploys |
|----------|----------------|--------------|
| **Railway** | `/` (repo root) | NestJS API via `Dockerfile` |
| **Vercel** | `apps/web` | Next.js frontend |

## Steps to fix a failed Railway build

1. Open your Railway **API service** (not Postgres/Redis)
2. Go to **Settings** → **Source**
3. Set **Root Directory** to empty / `/` (remove `apps/web` if set)
4. Go to **Settings** → **Build**
5. Set **Builder** to **Dockerfile**
6. Set **Dockerfile path** to `Dockerfile`
7. Ensure the service deploys from the **`main`** branch (merged 2026-06-23)
8. Click **Redeploy** on the latest deployment

> Railway should auto-redeploy from `main` after the merge. If the build still uses Railpack, manually switch Builder to **Dockerfile** in Settings → Build.

## Required databases

Add these in the same Railway project:

- **PostgreSQL** → link `DATABASE_URL` to API service
- **Redis** → link `REDIS_URL` to API service

## Required API variables

```
JWT_SECRET=<random-long-string>
CORS_ORIGIN=https://your-app.vercel.app
```

## Verify deployment

After deploy succeeds, open:

```
https://YOUR-RAILWAY-DOMAIN/api/health
```

You should see: `{"status":"ok","service":"creatorpilot-api"}`
