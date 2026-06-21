import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DemoReportLink } from "@/components/landing/demo-report-link";

export function CTASection() {
  return (
    <section className="py-28 bg-[#0F1115] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#0E3B2E50_0%,_transparent_55%)]" />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5 leading-tight">
          صفقة واحدة تغطي اشتراكك.
          <span className="block text-white/50 text-xl font-medium mt-2">
            One deal covers your subscription.
          </span>
        </h2>
        <p className="text-base text-white/55 mb-10 max-w-lg mx-auto leading-relaxed">
          ابدأ بـ ٣ فرص مجانية — شوف قيمة pipeline قبل ما تدفع ريال واحد.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/signup">
            <Button size="lg" variant="accent" className="gap-2 px-10 shadow-lg w-full sm:w-auto">
              احصل على تقريرك المجاني
            </Button>
          </Link>
          <DemoReportLink
            size="lg"
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
          />
        </div>
        <p className="text-xs text-white/30 mt-6">بدون بطاقة ائتمان · ٣ فرص كاملة · إلغاء في أي وقت</p>
      </div>
    </section>
  );
}
