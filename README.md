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

## Tech Stack

- **Next.js 16** with App Router
- **TypeScript** + **Tailwind CSS 4**
- **OpenAI API** (optional) for vision analysis and image generation
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
