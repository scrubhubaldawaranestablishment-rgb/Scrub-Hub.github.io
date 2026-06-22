import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

export const LOCALE_STORAGE_KEY = "nossco-preferred-locale";
export const SUPPORTED_LOCALES = ["en", "ar"];

function normalizeLocale(value) {
  if (!value) return null;
  const short = value.toLowerCase().split("-")[0];
  return SUPPORTED_LOCALES.includes(short) ? short : null;
}

export function detectPreferredLocale() {
  const saved = normalizeLocale(localStorage.getItem(LOCALE_STORAGE_KEY));
  if (saved) return saved;

  const browserLocales = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  for (const locale of browserLocales) {
    const normalized = normalizeLocale(locale);
    if (normalized) return normalized;
  }

  return "en";
}

export function applyDocumentLocale(locale) {
  const isArabic = locale === "ar";
  document.documentElement.lang = locale;
  document.documentElement.dir = isArabic ? "rtl" : "ltr";
}

export function persistLocale(locale) {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  applyDocumentLocale(locale);
}

const initialLocale = detectPreferredLocale();
applyDocumentLocale(initialLocale);

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: initialLocale,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
