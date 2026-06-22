import { ArrowLeft, ArrowRight, Lock, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocale } from "../context/LocaleContext";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-1.6 3.6-5.1 3.6-3.1 0-5.6-2.5-5.6-5.6S8.9 6.2 12 6.2c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.8 3.8 14.6 3 12 3 7 3 3 7 3 12s4 9 9 9c5.2 0 8.6-3.7 8.6-8.9 0-.6-.1-1.1-.2-1.6H12z"
      />
      <path
        fill="#34A853"
        d="M5.3 14.7 4.2 15.7A8.9 8.9 0 0 0 12 21c2.4 0 4.4-.8 5.9-2.1l-2.7-2.2c-.7.5-1.7.9-3.2.9-2.4 0-4.5-1.6-5.2-3.8z"
      />
      <path
        fill="#4A90E2"
        d="M6.8 8.8 5.7 7.7A8.9 8.9 0 0 0 3 12c0 1.5.4 3 1.1 4.3l2.9-2.3c-.3-.8-.5-1.7-.5-2.7 0-1 .2-1.9.5-2.5z"
      />
      <path
        fill="#FBBC05"
        d="M12 6.8c1.3 0 2.2.6 2.7 1.1l2-2C15.9 4.6 14.1 4 12 4 9.4 4 7.1 5.3 5.7 7.3l2.9 2.3C9.3 8.1 10.5 6.8 12 6.8z"
      />
    </svg>
  );
}

export default function LoginCard() {
  const { t } = useTranslation();
  const { isRtl } = useLocale();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="glass-card w-full max-w-md rounded-3xl p-6 sm:p-8">
      <div className="space-y-2 text-center sm:text-start">
        <h2 className="text-3xl font-bold text-white">{t("login.welcome")}</h2>
        <p className="text-sm text-slate-400">{t("login.subtitle")}</p>
      </div>

      <div className="mt-8 space-y-5">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
        >
          <GoogleIcon />
          <span>{t("login.google")}</span>
        </button>

        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
          <div className="h-px flex-1 bg-white/10" />
          <span>{t("login.divider")}</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
          <label className="block space-y-2">
            <span className="text-xs font-semibold tracking-[0.18em] text-slate-400">
              {t("login.emailLabel")}
            </span>
            <div className="input-shell flex items-center gap-3 rounded-xl px-4 py-3">
              <Mail className="h-4 w-4 shrink-0 text-slate-500" />
              <input
                type="email"
                placeholder={t("login.emailPlaceholder")}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </label>

          <label className="block space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold tracking-[0.18em] text-slate-400">
                {t("login.passwordLabel")}
              </span>
              <button
                type="button"
                className="text-xs font-medium text-blue-300 transition hover:text-blue-200"
              >
                {t("login.forgotPassword")}
              </button>
            </div>
            <div className="input-shell flex items-center gap-3 rounded-xl px-4 py-3">
              <Lock className="h-4 w-4 shrink-0 text-slate-500" />
              <input
                type="password"
                placeholder={t("login.passwordPlaceholder")}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </label>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
          >
            <span>{t("login.signIn")}</span>
            <ArrowIcon className="h-4 w-4" />
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 sm:text-start">
          {t("login.noAccount")}{" "}
          <button
            type="button"
            className="font-medium text-blue-300 transition hover:text-blue-200"
          >
            {t("login.requestAccess")}
          </button>
        </p>
      </div>

      <p className="mt-8 text-center text-xs leading-5 text-slate-500 sm:text-start">
        {t("copyright")}
      </p>
    </div>
  );
}
