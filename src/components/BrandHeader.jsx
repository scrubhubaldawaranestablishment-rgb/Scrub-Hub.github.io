const LOGO_SRC = "/assets/nossco_logo.png";

export default function BrandHeader({ portalLabel, compact = false }) {
  return (
    <div className={`flex items-center gap-3 ${compact ? "" : "mb-auto"}`}>
      <img
        src={LOGO_SRC}
        alt="NOSSCO"
        className={`${compact ? "h-8" : "h-10"} w-auto drop-shadow-lg`}
      />
      <div>
        <p
          className={`font-bold uppercase tracking-widest text-white ${
            compact ? "text-base" : "text-xl"
          }`}
        >
          NOSSCO
        </p>
        <p
          className="text-xs uppercase tracking-[0.18em]"
          style={{ color: "rgb(96, 165, 250)" }}
        >
          {portalLabel}
        </p>
      </div>
    </div>
  );
}
