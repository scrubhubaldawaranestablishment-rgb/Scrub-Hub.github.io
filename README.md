# VidEdge Personal Edition

A personal-use clone of [VidEdge](https://videdge.ai/) — the all-in-one tool for faceless YouTube creators. All 11 tools included, no pricing or subscription required.

## Features

| Tool | Description |
|------|-------------|
| 🧩 Chrome Extension | YouTube channel analytics, outlier scores, monetization checker |
| 🔍 Niche Finder | Browse 12+ high-performing faceless channel database |
| 🎨 Branding | AI chat to generate channel profile & banner concepts |
| 💡 Video Ideas | Scored video ideas with hooks, one-click to script |
| 🖼️ Thumbnail Studio | Canva-style canvas editor with AI generation |
| ✍️ AI Script Writer | Section-by-section script generation |
| 🎙️ AI Voiceover | Text-to-speech with Web Speech API |
| 🎬 AI Video Editor | Scene-based timeline editor with video generation |
| 📋 Production Board | Kanban drag-and-drop workflow |
| 💰 Monetize | Revenue calculator & monetization strategies |
| 🎓 AI Coach | Caleb AI chat for YouTube growth advice |

## Getting Started

```bash
cd apps/web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Production

```bash
cd apps/web
npm run build
npm start
```

## Tech Stack

- **Next.js 16** (App Router)
- **Tailwind CSS 4**
- **Zustand** (persisted local storage)
- **@dnd-kit** (Kanban drag-and-drop)
- **Web Speech API** (voiceover)

## API Keys (for full functionality)

Go to **Dashboard → Settings** or set environment variables:

| Key | Purpose | Required? |
|-----|---------|-----------|
| `YOUTUBE_API_KEY` | Channel analytics, video lists, outlier scores | Recommended (video URLs work without it) |
| `OPENAI_API_KEY` | AI Script Writer, Coach, Branding, Video Ideas | Optional (templates used without it) |

### YouTube API setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a project and enable **YouTube Data API v3**
3. Create an API key and paste it in Settings
4. Free tier: 10,000 units/day

### Supported YouTube URLs
- Video: `youtube.com/watch?v=...`, `youtu.be/...`
- Channel: `youtube.com/@handle`, `youtube.com/channel/ID`

## Personal Use

This is built for personal use — no authentication, no billing, no API keys required. All AI features use intelligent client-side generation. Data persists in browser localStorage.
