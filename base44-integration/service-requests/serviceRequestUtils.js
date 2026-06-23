export function parseVendorMatches(raw) {
  if (!raw) return [];
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : parsed?.matches || [];
  } catch {
    return [];
  }
}

export function vendorMatchScore(request, vendorId) {
  if (!vendorId) return null;
  const match = parseVendorMatches(request?.vendor_match_data).find(
    (m) => m.vendor_id === vendorId
  );
  return match ? Math.round(match.score) : null;
}

export function vendorCanViewServiceRequest(request, vendor) {
  if (!request || !vendor) return false;
  if (['cancelled', 'closed'].includes(request.status)) return false;

  if (request.vendor_id && request.vendor_id === vendor.id) return true;
  if (
    request.vendor_name &&
    vendor.company_name &&
    request.vendor_name.trim().toLowerCase() === vendor.company_name.trim().toLowerCase()
  ) {
    return true;
  }

  const matches = parseVendorMatches(request.vendor_match_data);
  if (matches.some((m) => m.vendor_id === vendor.id)) return true;

  const matchedIds = request.matched_vendor_ids || [];
  if (Array.isArray(matchedIds) && matchedIds.includes(vendor.id)) return true;

  return false;
}

export function filterServiceRequestsForVendor(requests, vendor) {
  return (requests || []).filter((r) => vendorCanViewServiceRequest(r, vendor));
}
