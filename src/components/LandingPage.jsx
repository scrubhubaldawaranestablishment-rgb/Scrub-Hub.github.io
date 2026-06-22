import LanguageSwitcher from "./LanguageSwitcher";
import LoginCard from "./LoginCard";
import MarketingPanel from "./MarketingPanel";
import { useLocale } from "../context/LocaleContext";

export default function LandingPage() {
  const { isRtl } = useLocale();

  return (
    <div className="network-bg relative min-h-screen overflow-hidden">
      <div className="network-lines" />

      <div className="absolute end-4 top-4 z-20 sm:end-6 sm:top-6">
        <LanguageSwitcher />
      </div>

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.2fr_0.8fr]">
        <div className={isRtl ? "order-2" : "order-1"}>
          <MarketingPanel />
        </div>

        <div
          className={`flex items-center justify-center px-6 py-10 sm:px-10 ${
            isRtl ? "order-1" : "order-2"
          }`}
        >
          <LoginCard />
        </div>
      </div>
    </div>
  );
}
