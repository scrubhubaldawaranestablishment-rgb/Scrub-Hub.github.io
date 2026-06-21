import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { CTASection } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F8F7F3]">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <Features />
      <Pricing />
      <FAQ />
      <CTASection />
      <Footer />
    </main>
  );
}
