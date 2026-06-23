export const STATUS_PIPELINE = ['created', 'assigned', 'in_progress', 'review', 'completed'];

export const STATUS_COMPLETION = {
  created: 0,
  assigned: 25,
  in_progress: 50,
  review: 75,
  completed: 100,
  cancelled: 0,
};

export function completionForStatus(status) {
  return STATUS_COMPLETION[status] ?? 0;
}

export function isRfpWorkOrder(wo) {
  if (!wo) return false;
  if (wo.source === 'rfp' || wo.source === 'client_portal') return true;
  if (wo.rfp_ref || wo.rfp_file_url) return true;
  if (/RFP/i.test(wo.title || '')) return true;
  return /RFP Submitted/i.test(wo.notes || '');
}

export function parseRfpMeta(wo) {
  if (!wo) return { ref: null, fileUrl: null };
  if (wo.rfp_ref || wo.rfp_file_url) {
    return { ref: wo.rfp_ref || null, fileUrl: wo.rfp_file_url || null };
  }
  const notes = wo.notes || '';
  const refMatch = notes.match(/Ref:\s*([^\s.]+)/i);
  const fileMatch = notes.match(/File:\s*(\S+)/i);
  return {
    ref: refMatch?.[1] || null,
    fileUrl: fileMatch?.[1] || null,
  };
}

export function parseVendorMatches(raw) {
  if (!raw) return null;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : parsed?.matches || null;
  } catch {
    return null;
  }
}
