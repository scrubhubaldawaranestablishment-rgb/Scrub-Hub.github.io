# Base44 Arabic RTL Integration Guide

## Base44 login status

I attempted to sign in with the credentials you provided:

- **Email login:** `Invalid email or password`
- **Google login:** blocked in automated browsers (`This browser or app may not be secure`)

So I could not open your Base44 project directly yet.

## What you can do next (pick one)

### Option A — Fix credentials (fastest)
Send one of these:

1. Correct Base44 email/password (if the account uses Google sign-in, use that in your own browser and export the project)
2. Your published app URL (e.g. `https://your-app.base44.app`)
3. Base44 **app ID** from Dashboard → Overview

### Option B — CLI device login (recommended)
On your machine:

```bash
npx base44 login
```

Complete the browser device-code step, then run:

```bash
npx base44 eject --app-id YOUR_APP_ID --path ./nossco-base44 --yes
```

Push that exported project to GitHub and reconnect this agent.

### Option C — Manual paste in Base44 (no export needed)
Use the files in `base44-integration/` and the AI prompt below inside your Base44 app editor.

---

## Base44 AI prompt (paste into Base44 chat)

```
Add full Arabic RTL support to the landing/login page.

Requirements:
1. Use react-i18next with locales en and ar
2. Detect language from localStorage key "nossco-preferred-locale", then browser language, default en
3. Set document.documentElement.lang and document.documentElement.dir ("rtl" for ar)
4. Add a top-corner language toggle: English / العربية
5. Mirror split layout in Arabic: marketing panel and login card swap sides
6. Translate all landing/login strings to Arabic
7. Use IBM Plex Sans Arabic font for Arabic
8. Flip sign-in arrow and use logical CSS (ms/me/ps/pe) for RTL
9. Keep existing Base44 auth logic and Google sign-in working

Use the integration files from base44-integration/ in the repo as reference.
```

---

## Files to add in Base44 Code view

| File | Purpose |
|------|---------|
| `src/i18n/index.js` | Locale detection + i18n init |
| `src/i18n/locales/en.json` | English copy |
| `src/i18n/locales/ar.json` | Arabic copy |
| `src/context/LocaleContext.jsx` | Live locale state |
| `src/components/LanguageSwitcher.jsx` | EN / AR toggle |
| Update login/landing page | RTL layout + translations |

---

## Live preview (standalone build)

The working bilingual demo is already in this repo:

```bash
npm install
npm run dev
```

Open `http://localhost:5173` and click **العربية** / **English** in the corner.

PR: https://github.com/scrubhubaldawaranestablishment-rgb/Scrub-Hub.github.io/pull/5

---

## Security note

Do not share passwords in chat again if possible. Prefer:

- Base44 device login (`npx base44 login`)
- Exported ZIP from Code → Export
- GitHub sync from Base44 dashboard
