import { ArrowLeft, ArrowRight, Lock, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocale } from "../context/LocaleContext";
import BrandHeader from "./BrandHeader";

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

const labelStyle = { color: "rgb(61, 106, 138)" };
const mutedStyle = { color: "rgb(74, 127, 168)" };
const linkStyle = { color: "rgb(96, 165, 250)" };
const footerStyle = { color: "rgb(45, 90, 122)" };
const copyrightStyle = { color: "rgb(26, 58, 82)" };

export default function LoginCard() {
  const { t } = useTranslation();
  const { isRtl } = useLocale();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
  const iconPosition = isRtl ? "right-3.5" : "left-3.5";
  const inputPadding = isRtl ? "pr-10 pl-4" : "pl-10 pr-4";

  return (
    <div
      className="w-full max-w-[420px] rounded-3xl p-8 xl:p-10"
      style={{
        background: "rgba(255, 255, 255, 0.04)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(24px)",
        boxShadow:
          "rgba(0, 0, 0, 0.5) 0px 32px 80px, rgba(96, 165, 250, 0.06) 0px 0px 0px 1px inset",
      }}
    >
      <div className="mb-6 flex items-center justify-center gap-3 lg:hidden">
        <BrandHeader portalLabel={t("brand.portalSubtitle")} compact />
      </div>

      <div className="mb-7">
        <h2 className="text-2xl font-bold text-white">{t("login.welcome")}</h2>
        <p className="mt-1.5 text-sm" style={mutedStyle}>
          {t("login.subtitle")}
        </p>
      </div>

      <button
        type="button"
        className="mb-6 flex h-12 w-full items-center justify-center gap-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.98]"
        style={{
          background: "rgba(255, 255, 255, 0.06)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
        }}
      >
        <GoogleIcon />
        <span>{t("login.google")}</span>
      </button>

      <div className="mb-6 flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
        <span className="text-xs" style={footerStyle}>
          {t("login.divider")}
        </span>
        <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
      </div>

      <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
        <div className="space-y-1.5">
          <label
            className="block text-xs font-semibold uppercase tracking-widest"
            style={labelStyle}
          >
            {t("login.emailLabel")}
          </label>
          <div className="relative">
            <Mail
              className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 ${iconPosition}`}
              style={{ color: "rgb(45, 90, 122)" }}
            />
            <input
              type="email"
              autoComplete="email"
              placeholder={t("login.emailPlaceholder")}
              className={`h-12 w-full rounded-xl text-sm text-white outline-none transition ${inputPadding}`}
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(96, 165, 250, 0.6)",
                boxShadow: "rgba(96, 165, 250, 0.1) 0px 0px 0px 3px",
              }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              className="block text-xs font-semibold uppercase tracking-widest"
              style={labelStyle}
            >
              {t("login.passwordLabel")}
            </label>
            <button
              type="button"
              className="text-xs transition-colors hover:underline"
              style={linkStyle}
            >
              {t("login.forgotPassword")}
            </button>
          </div>
          <div className="relative">
            <Lock
              className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 ${iconPosition}`}
              style={{ color: "rgb(45, 90, 122)" }}
            />
            <input
              type="password"
              autoComplete="current-password"
              placeholder={t("login.passwordPlaceholder")}
              className={`h-12 w-full rounded-xl text-sm text-white outline-none transition ${inputPadding}`}
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{
            background:
              "linear-gradient(135deg, rgb(29, 78, 216) 0%, rgb(37, 99, 235) 50%, rgb(30, 64, 175) 100%)",
            boxShadow:
              "rgba(37, 99, 235, 0.4) 0px 4px 24px, rgba(96, 165, 250, 0.2) 0px 0px 0px 1px inset",
          }}
        >
          <span>{t("login.signIn")}</span>
          <ArrowIcon className="h-4 w-4" />
        </button>
      </form>

      <p className="mt-6 text-center text-sm" style={footerStyle}>
        {t("login.noAccount")}{" "}
        <button
          type="button"
          className="font-semibold hover:underline"
          style={linkStyle}
        >
          {t("login.requestAccess")}
        </button>
      </p>

      <p
        className="mt-6 border-t pt-5 text-center text-xs"
        style={{
          ...copyrightStyle,
          borderColor: "rgba(255, 255, 255, 0.05)",
        }}
      >
        {t("copyright")}
      </p>
    </div>
  );
}
