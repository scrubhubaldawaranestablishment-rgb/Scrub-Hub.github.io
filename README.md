# StyleMirror — AI Fashion Try-On

A mobile-friendly web app that lets users upload a full-body photo, select their country, and get AI-powered fashion brand recommendations with virtual try-on previews.

## Features

- **Full Body Photo Upload** — Camera capture or gallery upload with drag-and-drop support
- **Country Selection** — 20+ countries with region-grouped picker (Saudi Arabia, UAE, US, UK, and more)
- **AI Brand Scanner** — Scans curated fashion brands available in the selected country
- **Virtual Try-On** — Generates preview images showing you wearing each brand's outfit style
- **Fashion Guide** — Match scores, trend insights, and "why buy" recommendations per brand
- **Mobile-First PWA** — Optimized for phones with installable web app manifest

## How It Works

1. Upload a full-body photo (stand straight, good lighting)
2. Select your country (e.g., Saudi Arabia)
3. Tap **Generate Fashion Wear**
4. AI analyzes your body type and style, scans local brands, and generates personalized looks
5. Browse brand matches with match scores, trend insights, and shopping links

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone or browser.

## AI Mode (Optional)

For full AI vision analysis and DALL-E image generation, add your OpenAI API key:

```bash
cp .env.example .env.local
# Edit .env.local and set OPENAI_API_KEY
```

Without an API key, the app runs in **demo mode** with intelligent brand matching and styled preview overlays.

## Supabase (Optional)

StyleMirror can load brands and country trends from your Supabase project (`dilknptetrnicoilhfmb`) instead of the built-in static data.

### 1. Cursor MCP

The project includes `.cursor/mcp.json` scoped to this Supabase project. In Cursor, open **Settings → Tools & MCP**, enable the Supabase server, and sign in when prompted.

### 2. Apply the schema

Run the migration in `supabase/migrations/001_initial_schema.sql` via the Supabase SQL editor or Supabase MCP.

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Set:

- `NEXT_PUBLIC_SUPABASE_URL` — `https://dilknptetrnicoilhfmb.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase dashboard → Project Settings → API
- `SUPABASE_SERVICE_ROLE_KEY` — for server-side writes (generation history)

### 4. Seed brand data

```bash
# Set SUPABASE_SEED_SECRET in .env.local, then:
curl -X POST http://localhost:3000/api/seed \
  -H "Authorization: Bearer your-seed-secret"
```

When Supabase is not configured, the app automatically falls back to the static brand database in `src/data/brands.ts`.

## Tech Stack

- **Next.js 16** with App Router
- **TypeScript** + **Tailwind CSS 4**
- **OpenAI API** (optional) for vision analysis and image generation
- **Supabase** (optional) for brands, trends, and generation history
- Curated brand database for 20+ countries

## Countries & Brands

The app includes curated fashion brands for:

| Region | Countries |
|--------|-----------|
| Middle East | Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman, Egypt, Jordan |
| Americas | United States, Canada, Brazil |
| Europe | UK, France, Italy, Germany |
| Asia | Japan, South Korea, India |
| Africa | Nigeria |
| Oceania | Australia |

Saudi Arabia includes brands like Thobe House, Rubaiyat, Namshi, Abaya Mall, Femi9, Sacoor Brothers, and more.

## Deploy

```bash
npm run build
npm start
```

Deploy to Vercel, Netlify, or any Node.js hosting platform.

## License

MIT
