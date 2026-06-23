export const SA_PHONE_PREFIX = '+966 ';
export const CR_DIGIT_LENGTH = 10;
export const VAT_DIGIT_LENGTH = 15;

export function digitsOnly(value, maxLen) {
  return String(value || '').replace(/\D/g, '').slice(0, maxLen);
}

export function isDigitFieldValid(value, requiredLen) {
  const digits = digitsOnly(value, requiredLen);
  return digits.length === requiredLen;
}

export function digitFieldStyle(value, requiredLen) {
  const digits = digitsOnly(value, requiredLen);
  const invalid = digits.length > 0 && digits.length !== requiredLen;
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
