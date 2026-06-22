/**
 * Client-side draft backup for the vendor onboarding wizard.
 * Server (Vendor entity) remains the source of truth; localStorage covers
 * refresh/navigation gaps before auto-save completes.
 */

const DRAFT_PREFIX = 'nossco-vendor-draft-';
const TAB_PREFIX = 'nossco-vendor-tab-';
const STEP_PREFIX = 'nossco-vendor-step-';

function safeEmail(email) {
  return (email || 'anonymous').toLowerCase().trim();
}

export function saveVendorDraft(email, formData, step) {
  if (!email || typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      `${DRAFT_PREFIX}${safeEmail(email)}`,
      JSON.stringify({
        formData,
        step,
        savedAt: Date.now(),
      })
    );
  } catch (err) {
    console.warn('Could not save vendor draft to localStorage:', err);
  }
}

export function loadVendorDraft(email) {
  if (!email || typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${DRAFT_PREFIX}${safeEmail(email)}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearVendorDraft(email) {
  if (!email || typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${DRAFT_PREFIX}${safeEmail(email)}`);
  } catch {
    /* ignore */
  }
}

export function saveVendorTab(email, tab) {
  if (!email || typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(`${TAB_PREFIX}${safeEmail(email)}`, tab);
  } catch {
    /* ignore */
  }
}

export function loadVendorTab(email) {
  if (!email || typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(`${TAB_PREFIX}${safeEmail(email)}`);
  } catch {
    return null;
  }
}

export function saveVendorStep(email, step) {
  if (!email || typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(`${STEP_PREFIX}${safeEmail(email)}`, String(step));
  } catch {
    /* ignore */
  }
}

export function loadVendorStep(email) {
  if (!email || typeof window === 'undefined') return null;
  try {
    const val = sessionStorage.getItem(`${STEP_PREFIX}${safeEmail(email)}`);
    return val ? Number(val) : null;
  } catch {
    return null;
  }
}

/**
 * Merge server vendor record with a local draft.
 * Server fields win when both exist and the server record has an id.
 */
export function mergeVendorData(serverVendor, draft, userEmail) {
  const base = serverVendor || (userEmail ? { contact_email: userEmail } : {});
  if (!draft?.formData) return base;

  if (serverVendor?.id) {
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
  if (!vendor) return 1;

  let step = Math.max(1, vendor.onboarding_step || 1);

  if ((docs?.length > 0 || vendor.documents_submitted) && step < 4) {
    step = 4;
  }
  if ((vendor.onboarding_complete || vendor.review_status === 'pending_review') && step < 5) {
    step = 5;
  }

  return step;
}
