import { useTranslation } from "react-i18next";
import BrandHeader from "./BrandHeader";

const VISION_SRC = "/assets/saudi-vision.png";

function StatItem({ value, label }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-2xl font-bold text-white">{value}</span>
      <span className="text-xs" style={{ color: "rgb(74, 127, 168)" }}>
        {label}
      </span>
    </div>
  );
}

export default function MarketingPanel() {
  const { t } = useTranslation();

  return (
    <section className="relative flex h-full flex-col p-10 xl:p-14">
      <BrandHeader portalLabel={t("brand.portalSubtitle")} />

      <div className="flex flex-col gap-7 py-12">
        <div
          className="inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest"
          style={{
            background: "rgba(59, 130, 246, 0.12)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            color: "rgb(147, 197, 253)",
          }}
        >
          <span
            className="h-2 w-2 rounded-full bg-blue-400"
            style={{ boxShadow: "rgb(96, 165, 250) 0px 0px 8px" }}
          />
          <span>{t("locationBadge")}</span>
        </div>

        <h1 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
          {t("hero.titlePrefix")}{" "}
          <span style={{ color: "rgb(96, 165, 250)" }}>
            {t("hero.titleHighlight")}
          </span>
          <br />
          {t("hero.titleSuffix")}
        </h1>

        <p
          className="max-w-md text-base leading-relaxed"
          style={{ color: "rgb(123, 163, 204)" }}
        >
          {t("hero.description")}
        </p>

        <div className="flex items-center gap-8 pt-1">
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

        <div
          className="mt-1 flex items-center gap-6 self-start rounded-2xl px-5 py-4"
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(96, 165, 250, 0.15)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full bg-green-400"
              style={{ boxShadow: "rgb(74, 222, 128) 0px 0px 8px" }}
            />
            <span className="text-sm font-semibold text-white">
              {t("badges.tickets")}
            </span>
          </div>
          <div className="h-5 w-px" style={{ background: "rgba(255,255,255,0.12)" }} />
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full bg-blue-400"
              style={{ boxShadow: "rgb(96, 165, 250) 0px 0px 8px" }}
            />
            <span className="text-sm font-semibold text-white">
              {t("badges.response")}
            </span>
          </div>
        </div>
      </div>

      <div
        className="mt-auto flex items-center gap-4 pt-6"
        style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}
      >
        <img
          src={VISION_SRC}
          alt="Vision 2030"
          className="h-10 w-auto opacity-60"
        />
        <p className="text-xs" style={{ color: "rgb(45, 90, 122)" }}>
          {t("vision2030")}
        </p>
      </div>
    </section>
  );
}
