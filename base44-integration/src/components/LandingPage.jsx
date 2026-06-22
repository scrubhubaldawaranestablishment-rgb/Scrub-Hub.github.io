import LanguageSwitcher from "./LanguageSwitcher";
import LoginCard from "./LoginCard";
import MarketingPanel from "./MarketingPanel";
import { useLocale } from "../context/LocaleContext";

export default function LandingPage() {
  const { isRtl } = useLocale();

  return (
    <div
      className="flex min-h-screen overflow-hidden"
      style={{
        fontFamily: 'Inter, "Segoe UI", sans-serif',
        background: "rgb(5, 13, 26)",
      }}
    >
      <div
        className={`relative hidden w-[52%] flex-col overflow-hidden lg:flex ${
          isRtl ? "order-2" : "order-1"
        }`}
        style={{
          background:
            "linear-gradient(135deg, rgb(5, 13, 26) 0%, rgb(10, 22, 40) 35%, rgb(13, 32, 64) 65%, rgb(7, 18, 32) 100%)",
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full opacity-25"
            style={{
              background:
                "radial-gradient(circle, rgb(30, 64, 175) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          <div
            className="absolute bottom-[10%] right-[-5%] h-[50%] w-[50%] rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(circle, rgb(29, 78, 216) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
        </div>
        <div className="network-lines absolute inset-0 opacity-40" />
        <div className="relative z-10 h-full">
          <MarketingPanel />
        </div>
      </div>

      <div
        className={`relative flex flex-1 items-center justify-center p-6 lg:p-10 ${
          isRtl ? "order-1" : "order-2"
        }`}
        style={{
          background:
            "linear-gradient(160deg, rgb(7, 17, 31) 0%, rgb(10, 22, 40) 50%, rgb(6, 15, 28) 100%)",
        }}
      >
        <div className="absolute end-4 top-4 z-20 sm:end-6 sm:top-6">
          <LanguageSwitcher />
        </div>
        <LoginCard />
      </div>
    </div>
  );
}
