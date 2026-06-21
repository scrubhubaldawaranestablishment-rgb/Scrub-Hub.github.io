import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-28 bg-[#0E3B2E] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#C8A96B12_0%,_transparent_55%)]" />
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
        <Link href="/signup">
          <Button size="lg" variant="accent" className="gap-2 px-10 shadow-lg">
            احصل على تقريرك المجاني
          </Button>
        </Link>
        <p className="text-xs text-white/30 mt-6">بدون بطاقة ائتمان · ٣ فرص كاملة · إلغاء في أي وقت</p>
      </div>
    </section>
  );
}
