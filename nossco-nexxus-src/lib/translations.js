import { en } from './translations_en';
import { ar } from './translations_ar';

export const translations = { en, ar };

export function t(lang, key) {
  return translations[lang]?.[key] ?? key;
}