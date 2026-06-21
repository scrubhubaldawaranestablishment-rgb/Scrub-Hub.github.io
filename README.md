# Taramiz | تراميز

**Decode Growth** — AI Opportunity Intelligence Platform for Saudi Arabia.

Taramiz helps businesses discover hidden sales opportunities, potential customers, competitors, and growth opportunities using AI. This is NOT a CRM. This is NOT a Lead Database. This is an AI Opportunity Intelligence Platform.

## Tech Stack

- **Next.js 15** — App Router, Server Components, API Routes
- **TypeScript** — Full type safety
- **Tailwind CSS 4** — Premium enterprise styling
- **shadcn/ui** — Accessible UI components
- **Supabase** — Auth, PostgreSQL, Row Level Security
- **OpenAI API** — Intelligence engine (with mock fallback)
- **Vercel** — Deployment ready

## Brand

| Token | Value |
|-------|-------|
| Primary | `#0E3B2E` |
| Secondary | `#0F1115` |
| Accent | `#C8A96B` |
| Background | `#F8F7F3` |

## Getting Started

### 1. Clone and Install

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `OPENAI_API_KEY` | OpenAI API key (optional — mock data used if missing) |
| `OPENAI_MODEL` | Model name (default: `gpt-4o-mini`) |
| `NEXT_PUBLIC_APP_URL` | App URL for redirects |

### 3. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in SQL Editor:

```bash
# Or via Supabase CLI:
supabase db push
```

Migration file: `supabase/migrations/001_initial_schema.sql`

This creates:
- `profiles`, `companies`, `analyses`, `opportunities`, `prospects`, `competitors`, `insights`, `subscriptions`, `usage_logs`
- Row Level Security policies
- Auto-profile creation on signup

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page (Arabic-first) |
| `/login` | Supabase authentication |
| `/signup` | Account creation |
| `/onboarding` | Company profile setup |
| `/dashboard` | Overview with metrics |
| `/dashboard/opportunities` | AI-discovered opportunities (3 free, 127 locked) |
| `/dashboard/prospects` | Prospect discovery |
| `/dashboard/competitors` | Competitor intelligence |
| `/dashboard/insights` | Market insights |
| `/dashboard/reports` | Analysis reports |
| `/dashboard/settings` | Account & pricing |

## AI Engine

The intelligence engine lives in `src/lib/ai/`:

- `prompts.ts` — Reusable prompt architecture for all analysis types
- `engine.ts` — OpenAI integration with mock fallback

Analysis types:
- **Opportunity Discovery** — 10 opportunities per analysis (3 free)
- **Prospect Discovery** — 8 ideal customer matches
- **Competitor Analysis** — 5 competitive profiles
- **Growth Recommendations** — 5 market insights

Without `OPENAI_API_KEY`, the app uses realistic Saudi market mock data.

## Pricing

| Plan | Price | Features |
|------|-------|----------|
| Starter | 299 SAR/mo | 3 analyses, basic discovery |
| Growth | 999 SAR/mo | Unlimited analyses, full intelligence |
| Scale | 2,999 SAR/mo | Enterprise features, API access |

## Deployment

### Vercel

1. Push to GitHub
2. Import in Vercel
3. Add environment variables from `.env.example`
4. Deploy

### Supabase

1. Apply migration via SQL Editor or CLI
2. Configure Auth redirect URLs: `https://your-domain.vercel.app/**`
3. Copy project URL and anon key to Vercel env vars

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/ai/analyze/     # AI analysis endpoint
│   ├── dashboard/          # Protected dashboard pages
│   ├── login/              # Auth pages
│   └── onboarding/         # Onboarding flow
├── components/
│   ├── dashboard/          # Dashboard components
│   ├── landing/            # Landing page sections
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── ai/                 # AI prompts & engine
│   ├── data/               # Constants, mock data, seed
│   ├── i18n/               # Translations
│   └── supabase/           # Supabase clients
└── types/                  # TypeScript types
supabase/
├── migrations/             # Database schema
└── config.toml             # Supabase CLI config
```

## License

Proprietary — Taramiz © 2026
