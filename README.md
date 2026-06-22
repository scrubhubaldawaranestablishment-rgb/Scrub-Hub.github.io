# NOSSCO Operations Portal

Bilingual landing and login page with English and Arabic RTL support.

## Features

- Automatic locale detection from saved preference or browser language
- Live language toggle (`English` / `العربية`)
- Full RTL mirroring for Arabic, including layout, icons, and typography
- Dark NOSSCO-branded operations portal UI

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Locale behavior

1. Uses `localStorage` key `nossco-preferred-locale` when set
2. Falls back to browser language (`ar` or `en`)
3. Defaults to English
