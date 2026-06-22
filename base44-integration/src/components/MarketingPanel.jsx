import { useTranslation } from "react-i18next";
import NosscoLogo from "./NosscoLogo";
import Vision2030Badge from "./Vision2030Badge";

function StatItem({ value, label }) {
  return (
    <div className="space-y-1">
      <div className="stat-value text-3xl font-bold sm:text-4xl">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}

function StatusBadge({ color, label }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}

export default function MarketingPanel() {
  const { t } = useTranslation();

  return (
    <section className="relative flex min-h-full flex-col justify-between px-6 py-8 sm:px-10 lg:px-14 lg:py-10">
      <div className="space-y-8">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <NosscoLogo className="h-11 w-11" />
            <div className="text-xs font-semibold tracking-[0.22em] text-slate-100 sm:text-sm">
              {t("brand.portal")}
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-medium tracking-wide text-blue-100 sm:text-sm">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            <span>{t("locationBadge")}</span>
          </div>
        </div>

        <div className="max-w-2xl space-y-5">
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            {t("hero.titlePrefix")}{" "}
            <span className="text-blue-300">{t("hero.titleHighlight")}</span>{" "}
            {t("hero.titleSuffix")}
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
            {t("hero.description")}
          </p>
        </div>

        <div className="grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3">
          <StatItem
            value={t("stats.uptime.value")}
            label={t("stats.uptime.label")}
          />
          <StatItem
            value={t("stats.tickets.value")}
            label={t("stats.tickets.label")}
          />
          <StatItem
            value={t("stats.response.value")}
            label={t("stats.response.label")}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <StatusBadge color="bg-emerald-400" label={t("badges.tickets")} />
          <StatusBadge color="bg-blue-400" label={t("badges.response")} />
        </div>
      </div>

      <div className="mt-10">
        <Vision2030Badge />
      </div>
    </section>
  );
}
