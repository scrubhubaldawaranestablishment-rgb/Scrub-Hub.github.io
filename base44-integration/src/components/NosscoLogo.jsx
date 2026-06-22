import { useTranslation } from "react-i18next";

export default function NosscoLogo({ className = "h-10 w-10" }) {
  const { t } = useTranslation();

  return (
    <img
      src="/nossco-logo.svg"
      alt={t("brand.logoAlt")}
      className={`${className} shrink-0`}
    />
  );
}
