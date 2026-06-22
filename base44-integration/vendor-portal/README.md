# Vendor Portal — Form Persistence Fix

## Status: DEPLOYED

**Live on:** https://portal.nosscogroup.com/vendor-portal  
**Deployed:** June 22, 2026 via `base44 deploy`  
**Bundle:** `index-mKyO8WsS.js` (includes `nossco-vendor-draft` localStorage persistence)

---

## Problem

On the live NOSSCO Vendor Portal (`https://portal.nosscogroup.com/vendor-portal`), the 6-step onboarding wizard loses data when users:

1. **Refresh the page** mid-form
2. **Navigate away** and come back later
3. **Switch tabs** (Dashboard → Edit Application)

### Root causes (from live bundle analysis)

| Issue | Impact |
|-------|--------|
| Tab always resets to **Dashboard** on load | User must re-open "Edit Application" manually |
| Wizard step only initialized once on mount | If vendor loads async, step stays at 1 |
| Auto-save only **creates** Vendor when `company_name` exists | Early fields lost on refresh |
| Sectors/Capabilities steps keep local state that doesn't sync from server | Steps 2–3 appear empty after refresh |
| No `localStorage` backup | Data lost if refresh happens before 1.5s debounce |

## Solution

Files in this directory:

| File | Action in Base44 |
|------|------------------|
| `vendorDraftStorage.js` | **Create** at `lib/vendorDraftStorage.js` |
| `VendorOnboardingWizard.jsx` | **Replace** existing wizard component |
| `VendorPortal.jsx` | **Replace** `pages/VendorPortal.jsx` |
| `stepSyncPatches.js` | **Apply** `useEffect` sync patches to Sectors + Capabilities steps |

---

## Base44 AI Prompt (paste into Base44 chat)

```
Fix vendor onboarding form persistence so data survives page refresh and users resume where they left off.

PROBLEM: The 6-step vendor wizard (Company Info → Sectors → Capabilities → Documents → Review → Tier) loses data on page refresh. Users must start over instead of continuing from their saved step.

Apply these changes:

1. CREATE lib/vendorDraftStorage.js
   Copy from the GitHub repo: base44-integration/vendor-portal/vendorDraftStorage.js
   Functions: saveVendorDraft, loadVendorDraft, clearVendorDraft, saveVendorTab, loadVendorTab, saveVendorStep, loadVendorStep, mergeVendorData, getResumeStep, getMaxReachableStep

2. REPLACE the VendorOnboardingWizard component (the one with STEPS array and "Save & Continue →" button)
   Copy from: base44-integration/vendor-portal/VendorOnboardingWizard.jsx
   Key fixes:
   - Save draft to localStorage on every field change
   - Create Vendor record on first change (not only when company_name exists)
   - When vendor prop loads from server, hydrate formData and currentStep from vendor.onboarding_step
   - On "Save & Continue", always persist to base44.entities.Vendor.update/create BEFORE advancing step
   - Store onboarding_step on every save

3. REPLACE pages/VendorPortal.jsx
   Copy from: base44-integration/vendor-portal/VendorPortal.jsx
   Key fixes:
   - On load, if vendor exists and !vendor.onboarding_complete, open "Edit Application" tab automatically
   - Remember active tab in sessionStorage (saveVendorTab/loadVendorTab)
   - Re-fetch vendor by contact_email on mount

4. PATCH Sectors step component:
   Add useEffect to sync local sectors/subcategories state when data prop changes:
   useEffect(() => {
     setSectors(Array.isArray(data.sectors) ? data.sectors : []);
     setSubcategories(parseSubcategories(data.subcategories));
   }, [data.id, data.sectors, data.subcategories]);

5. PATCH Capabilities step component:
   Add similar useEffect for cities_served, districts_served, equipment_list when data.id changes.

6. VERIFY Vendor entity has these fields (add if missing):
   - onboarding_step (number)
   - onboarding_complete (boolean)
   - documents_submitted (boolean)
   - company_name, cr_number, vat_number, website, contact_person, contact_email
   - phone, whatsapp, cities_covered, years_in_operation
   - sectors (array), subcategories (text/json)
   - cities_served, districts_served, equipment_list, num_employees, terms_accepted

7. TEST:
   - Fill Company Info step, refresh → data and step 1 should remain
   - Click Save & Continue to step 2, fill sectors, refresh → should return to step 2 with sectors selected
   - Navigate to Dashboard tab, refresh → should return to Edit Application tab if onboarding incomplete

Do NOT change styling or translations. Only fix persistence logic.
```

---

## Deploy to Base44

Already deployed. To redeploy after future changes:

```bash
npx base44 login
cd nossco-base44   # eject with: npx base44 eject via API tar download
npm run build
npx base44 deploy --yes
```

Then click **Publish** in Base44 if using the editor.

## CLI eject (for local development)

```bash
npx base44 login
npx base44 eject --app-id 6a1ae5a11195cab07d9a51af --path ./nossco-base44 --yes
```

App ID: `6a1ae5a11195cab07d9a51af`  
Live URL: https://portal.nosscogroup.com/vendor-portal

---

## What could not be done automatically

Base44 CLI requires interactive device login (`https://app.base44.com/login/device`). The cloud agent cannot complete this step without you approving the device code. Once you run `npx base44 login` locally, the agent can eject, patch, and deploy directly.
