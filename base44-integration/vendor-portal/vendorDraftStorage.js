/**
 * Client-side draft backup for the vendor onboarding wizard.
 */

const DRAFT_PREFIX = 'nossco-vendor-draft-';
const TAB_PREFIX = 'nossco-vendor-tab-';
const STEP_PREFIX = 'nossco-vendor-step-';

function safeEmail(email) {
  return (email || 'anonymous').toLowerCase().trim();
}

function storageSet(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn('localStorage write failed:', err);
  }
}

function storageGet(key) {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function saveVendorDraft(email, formData, step) {
  if (!email) return;
  storageSet(
    `${DRAFT_PREFIX}${safeEmail(email)}`,
    JSON.stringify({ formData, step, savedAt: Date.now() })
  );
}

export function loadVendorDraft(email) {
  if (!email) return null;
  try {
    const raw = storageGet(`${DRAFT_PREFIX}${safeEmail(email)}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearVendorDraft(email) {
  if (!email) return;
  try {
    localStorage.removeItem(`${DRAFT_PREFIX}${safeEmail(email)}`);
  } catch {
    /* ignore */
  }
}

export function hasVendorDraft(email) {
  const draft = loadVendorDraft(email);
  if (!draft?.formData) return false;
  const d = draft.formData;
  return !!(d.company_name || d.cr_number || d.sectors?.length || d.onboarding_step > 1 || draft.step > 1);
}

export function saveVendorTab(email, tab) {
  if (!email) return;
  storageSet(`${TAB_PREFIX}${safeEmail(email)}`, tab);
}

export function loadVendorTab(email) {
  if (!email) return null;
  return storageGet(`${TAB_PREFIX}${safeEmail(email)}`);
}

export function saveVendorStep(email, step) {
  if (!email) return;
  storageSet(`${STEP_PREFIX}${safeEmail(email)}`, String(step));
}

export function loadVendorStep(email) {
  if (!email) return null;
  const val = storageGet(`${STEP_PREFIX}${safeEmail(email)}`);
  return val ? Number(val) : null;
}

export function mergeVendorData(serverVendor, draft, userEmail) {
  const base = serverVendor || (userEmail ? { contact_email: userEmail } : {});
  if (!draft?.formData) return base;

  if (serverVendor?.id) {
    // Server wins for saved fields, draft fills gaps
    return { ...draft.formData, ...serverVendor };
  }

  return { ...base, ...draft.formData };
}

export function getResumeStep(serverVendor, docs, draft, isInternalUser) {
  if (isInternalUser) return 5;

  const serverStep = serverVendor?.onboarding_step || 1;
  const draftStep = draft?.step || 1;
  const maxReachable = getMaxReachableStep(serverVendor, docs);

  return Math.min(maxReachable, Math.max(1, serverStep, draftStep));
}

export function getMaxReachableStep(vendor, docs) {
  if (!vendor) {
    return 6; // allow navigating saved steps from draft even before vendor record exists
  }

  let step = Math.max(1, vendor.onboarding_step || 1);

  if ((docs?.length > 0 || vendor.documents_submitted) && step < 4) {
    step = 4;
  }
  if ((vendor.onboarding_complete || vendor.review_status === 'pending_review') && step < 5) {
    step = 5;
  }

  return step;
}
