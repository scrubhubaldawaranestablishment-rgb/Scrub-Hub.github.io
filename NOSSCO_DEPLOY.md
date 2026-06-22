# Nossco Nexxus — Arabic RTL Login Deployment

## Status: LIVE

Arabic RTL login support is **live** on `https://portal.nosscogroup.com/login` (bundle `index-CUy4oXd2.js`).

### What shipped

- `pages/Login.jsx` — uses `useT()` + `useAppSettings()`, RTL layout, language toggle
- `lib/AppSettingsContext.jsx` — detects Arabic from `localStorage` or browser language
- `lib/translations_en.js` / `lib/translations_ar.js` — login page strings
- **Logo unchanged:** `https://nosscogroup.com/assets/nossco_logo.png` and Vision 2030 image
- **NOSSCO brand text unchanged** — only descriptive copy is translated

### Verify

1. Visit `https://portal.nosscogroup.com/login`
2. Click **العربية** in the top corner — page flips to RTL with Arabic copy
3. Click **English** to switch back

```bash
curl -sL https://portal.nosscogroup.com/login | rg 'index-[^"]+\.js'
curl -sL https://portal.nosscogroup.com/assets/index-CUy4oXd2.js | rg 'login_headline_1'
```

## Base44 app

- App: **Nossco Nexxus** (`6a1ae5a11195cab07d9a51af`)
- Workspace: **Info's Workspace**
- Published via Base44 **Publish** button (Preview tab)
