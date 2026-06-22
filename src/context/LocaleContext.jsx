import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  detectPreferredLocale,
  persistLocale,
  SUPPORTED_LOCALES,
} from "../i18n";

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const { i18n } = useTranslation();
  const [locale, setLocaleState] = useState(() => detectPreferredLocale());

  useEffect(() => {
    persistLocale(locale);
    void i18n.changeLanguage(locale);
  }, [i18n, locale]);

  const value = useMemo(
    () => ({
      locale,
      isRtl: locale === "ar",
      setLocale: (nextLocale) => {
        if (!SUPPORTED_LOCALES.includes(nextLocale)) return;
        setLocaleState(nextLocale);
      },
      toggleLocale: () => {
        setLocaleState((current) => (current === "ar" ? "en" : "ar"));
      },
    }),
    [locale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}
