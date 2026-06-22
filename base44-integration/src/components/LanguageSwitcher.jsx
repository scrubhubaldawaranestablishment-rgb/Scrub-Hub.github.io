import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocale } from "../context/LocaleContext";

export default function LanguageSwitcher() {
  const { locale, toggleLocale } = useLocale();
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-white"
      aria-label={
        locale === "ar"
          ? t("language.switchToEnglish")
          : t("language.switchToArabic")
      }
    >
      <Languages className="h-4 w-4" />
      <span>{locale === "ar" ? "English" : "العربية"}</span>
    </button>
  );
}
