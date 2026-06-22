import { useTranslation } from "react-i18next";

export default function Vision2030Badge() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-4">
      <img
        src="/vision-2030-logo.svg"
        alt={t("vision2030Alt")}
        className="h-14 w-auto shrink-0"
      />
      <p className="text-sm text-slate-400">{t("vision2030")}</p>
    </div>
  );
}
