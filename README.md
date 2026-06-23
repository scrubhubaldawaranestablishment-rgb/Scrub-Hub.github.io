# CreatorPilot AI

AI-powered SaaS to automatically manage faceless YouTube Shorts and TikTok channels targeting United States viewers.

## Architecture

```
creatorpilot-ai/
├── apps/
│   ├── api/          # NestJS backend (auth, AI, scheduling, integrations)
│   └── web/          # Next.js 15 frontend (dashboard, admin)
├── packages/
│   └── database/     # Prisma schema & PostgreSQL client
└── docker-compose.yml
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, TailwindCSS, ShadCN UI |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Queue | Redis, BullMQ |
| AI | OpenAI API (gpt-4o-mini) |
| Integrations | YouTube Data API v3, TikTok Content Posting API |

## Features

1. **Authentication** — JWT-based auth with session management
2. **Channel Setup Wizard** — 5-step onboarding for niche, tone, platforms
3. **AI Trend Research Agent** — Viral topic discovery for US audiences
4. **30-Day Content Calendar** — Auto-generated posting schedule
5. **Hook Generator** — Scroll-stopping opening lines
6. **Script Generator** — 45-60 second Shorts/TikTok scripts
7. **CTA Generator** — Conversion-optimized calls to action
8. **Description Generator** — Platform-specific SEO descriptions
9. **Thumbnail Prompt Generator** — AI image generation prompts
10. **Video Prompt Generator** — Scene-by-scene video AI prompts
11. **Content Scheduling** — BullMQ-powered publish queue
12. **YouTube API Integration** — Shorts upload & analytics
13. **TikTok API Integration** — Video publishing & metrics
14. **Analytics Dashboard** — Cross-platform performance tracking
15. **AI Feedback Loop** — Continuous content quality improvement
16. **Admin Dashboard** — System overview, users, content status

## Quick Start

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL & Redis)

### 1. Start infrastructure

```bash
docker compose up -d
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your OPENAI_API_KEY and platform credentials
```

### 3. Install & setup database

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed --workspace=@creatorpilot/database
```

### 4. Run development servers

```bash
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:4000/api

### Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| demo@creatorpilot.ai | demo123 | User |
| admin@creatorpilot.ai | admin123 | Admin |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Sign in |
| GET | /api/channels | List user channels |
| POST | /api/ai/channels/:id/trends | Research trends |
| POST | /api/ai/channels/:id/calendar | Generate 30-day calendar |
| POST | /api/ai/content/:id/generate | Generate specific asset |
| POST | /api/ai/content/:id/generate-all | Full content pipeline |
| POST | /api/scheduling/channels/:id | Schedule a post |
| GET | /api/analytics/channels/:id | Analytics dashboard |
| GET | /api/admin/overview | Admin system overview |

## Environment Variables

See `.env.example` for the full list. Key variables:

- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection for BullMQ
- `OPENAI_API_KEY` — OpenAI API key for content generation
- `JWT_SECRET` — Secret for JWT token signing
- `YOUTUBE_API_KEY` / `YOUTUBE_CLIENT_ID` — YouTube integration
- `TIKTOK_CLIENT_KEY` — TikTok integration

## Production

```bash
npm run build
npm run start --workspace=@creatorpilot/api
npm run start --workspace=@creatorpilot/web
```

## License

Private — CreatorPilot AI
