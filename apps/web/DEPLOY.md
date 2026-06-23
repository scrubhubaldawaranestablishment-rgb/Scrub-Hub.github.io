# Vercel Deployment (Frontend)

CreatorPilot uses **Vercel for the frontend** and **Railway for the API**.

See the full guide: **[DEPLOY.md](../../DEPLOY.md)** (repo root)

## Quick Vercel setup

1. Import repo at [vercel.com/new](https://vercel.com/new)
2. Set **Root Directory** → `apps/web`
3. Add environment variable:
   - `API_PROXY_TARGET` = `https://scrub-hubgithubio-production.up.railway.app` (no `/api` suffix)
4. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fscrubhubaldawaranestablishment-rgb%2FScrub-Hub.github.io&project-name=creatorpilot-ai&root-directory=apps%2Fweb&env=API_PROXY_TARGET&envDescription=Railway%20NestJS%20API%20URL%20(no%20%2Fapi%20suffix)&envLink=https%3A%2F%2Fscrub-hubgithubio-production.up.railway.app)

## After deploy

- Homepage: `https://your-app.vercel.app`
- Login: `https://your-app.vercel.app/login`
- Dashboard: `https://your-app.vercel.app/dashboard`
