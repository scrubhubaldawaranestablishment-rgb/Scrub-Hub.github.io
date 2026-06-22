export const SA_PHONE_PREFIX = '+966 ';

export function digitsOnly(value, maxLen = 10) {
  return String(value || '').replace(/\D/g, '').slice(0, maxLen);
}

export function isTenDigitFieldValid(value) {
  const digits = digitsOnly(value, 10);
  return digits.length === 10;
}

export function tenDigitFieldStyle(value) {
  const digits = digitsOnly(value, 10);
  const invalid = digits.length > 0 && digits.length !== 10;
  return {
    background: 'rgba(255,255,255,0.05)',
    border: invalid ? '1px solid rgba(239,68,68,0.7)' : '1px solid rgba(6,182,212,0.2)',
    boxShadow: invalid ? '0 0 0 1px rgba(239,68,68,0.25)' : 'none',
  };
}

export function normalizeSaPhone(value) {
  if (!value) return SA_PHONE_PREFIX;
  const raw = String(value).trim();
  if (raw.startsWith(SA_PHONE_PREFIX)) return raw;
  if (raw.startsWith('+966')) {
    const rest = raw.replace(/^\+966\s?/, '');
    return SA_PHONE_PREFIX + rest.replace(/\D/g, '');
  }
  return SA_PHONE_PREFIX + raw.replace(/\D/g, '');
}

export function phoneLocalPart(value) {
  const normalized = normalizeSaPhone(value);
  return normalized.replace(SA_PHONE_PREFIX, '').replace(/\D/g, '');
}
