# Vercel Deployment

## One-click deploy (recommended)

1. Go to **[vercel.com/new](https://vercel.com/new)**
2. Import repo: `scrubhubaldawaranestablishment-rgb/Scrub-Hub.github.io`
3. Set **Root Directory** → `apps/web`
4. Add **Environment Variables**:
   - `YOUTUBE_API_KEY` = your YouTube Data API key
   - `OPENAI_API_KEY` = your OpenAI API key
5. Click **Deploy**

## CLI deploy

```bash
cd apps/web
npm install -g vercel
vercel login
vercel --prod
```

When prompted, add the same environment variables in the Vercel dashboard under **Settings → Environment Variables**.

## After deploy

Your app will be live at `https://your-project.vercel.app`

- Homepage: `/`
- Dashboard: `/dashboard/extension`
- Settings: `/dashboard/settings`
