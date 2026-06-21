import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-24 bg-[#0E3B2E] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#C8A96B15_0%,_transparent_60%)]" />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          ابدأ اكتشاف فرصك المخفية اليوم
        </h2>
        <p className="text-lg text-white/60 mb-8 max-w-2xl mx-auto">
          Start discovering your hidden opportunities today.
          Join 2,400+ Saudi businesses using Taramiz Intelligence.
        </p>
        <Link href="/signup">
          <Button size="lg" variant="accent" className="gap-2">
            ابدأ التحليل المجاني — Start Free Analysis
          </Button>
        </Link>
      </div>
    </section>
  );
}
