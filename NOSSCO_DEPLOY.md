# Nossco Nexxus — Arabic RTL Login Deployment

## Status

Arabic RTL login support has been applied in the **Nossco Nexxus** Base44 app (`6a1ae5a11195cab07d9a51af`).

### Completed in Base44 editor

- `pages/Login.jsx` — uses `useT()` + `useAppSettings()`, RTL layout, language toggle
- `lib/AppSettingsContext.jsx` — detects Arabic from `localStorage` or browser language
- `lib/translations_en.js` / `lib/translations_ar.js` — login page strings added
- **Logo unchanged:** `https://nosscogroup.com/assets/nossco_logo.png` and Vision 2030 image

### Pending: production publish

`https://portal.nosscogroup.com` is still serving bundle `index-CruyXS-h.js` (old login page).

The editor account `scrubhubaldawaranestablishment@gmail.com` can edit code but **Publish** appears to require the workspace owner:

**info@nosscogroup.com**

## To go live

1. Sign in to [Base44](https://app.base44.com) as workspace owner (`info@nosscogroup.com`)
2. Open **Nossco Nexxus** app
3. Click **Build**, then **Publish**
4. Visit `https://portal.nosscogroup.com/login`
5. Click **العربية** in the top corner to verify Arabic RTL

## Verify after publish

```bash
curl -sL https://portal.nosscogroup.com/login | rg 'index-[^"]+\.js'
curl -sL https://portal.nosscogroup.com/assets/<bundle>.js | rg 'login_headline_1'
```

The second command should return `login_headline_1` when the new login is live.
