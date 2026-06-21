import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { PRICING_PLANS } from "@/lib/data/constants";
import { DemoReportLink } from "@/components/landing/demo-report-link";

export function Pricing() {
  return (
    <section id="pricing" className="py-28 bg-[#0F1115] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0E3B2E40_0%,_transparent_50%)]" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="text-center mb-6">
          <span className="text-xs font-semibold text-[#C8A96B] uppercase tracking-[0.2em]">
            Pricing
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold">
            استثمار يُقاس بالصفقات — لا بالاشتراك
          </h2>
          <p className="mt-4 text-white/50 max-w-2xl mx-auto leading-relaxed">
            صفقة B2B واحدة في السعودية تغطي اشتراكك لأشهر. اختر الخطة حسب حجم pipeline الذي تحتاجه.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mb-14 text-sm text-white/40">
          <span>✓ بدون عقد سنوي</span>
          <span>✓ إلغاء في أي وقت</span>
          <span>✓ فاتورة ضريبية</span>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                plan.popular
                  ? "border-[#C8A96B] bg-[#0E3B2E] shadow-2xl shadow-black/30 md:-mt-2 md:mb-2"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#C8A96B] px-4 py-1 text-xs font-bold text-[#0F1115]">
                  الأكثر اختياراً — فرق المبيعات
                </div>
              )}
              <div className="mb-5">
                <h3 className={`text-xl font-semibold ${plan.popular ? "text-white" : "text-white/90"}`}>
                  {plan.name_ar}
                </h3>
                <p className={`text-sm mt-1 ${plan.popular ? "text-white/50" : "text-white/40"}`}>
                  {plan.description_ar}
                </p>
              </div>
              <div className="mb-2">
                <span className={`text-4xl font-bold tabular-nums ${plan.popular ? "text-[#C8A96B]" : "text-white"}`}>
                  {plan.price.toLocaleString("ar-SA")}
                </span>
                <span className={`text-sm ${plan.popular ? "text-white/50" : "text-white/40"}`}>
                  {" "}ر.س / شهرياً
                </span>
              </div>
              {"priceNote_ar" in plan && plan.priceNote_ar && (
                <p className={`text-xs mb-4 ${plan.popular ? "text-[#C8A96B]/80" : "text-white/35"}`}>
                  {plan.priceNote_ar}
                </p>
              )}
              {"roi_ar" in plan && plan.roi_ar && (
                <div className={`rounded-lg px-3 py-2 mb-6 text-xs leading-relaxed ${
                  plan.popular ? "bg-[#C8A96B]/15 text-[#C8A96B]" : "bg-white/5 text-white/50"
                }`}>
                  {plan.roi_ar}
                </div>
              )}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features_ar.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${plan.popular ? "text-[#C8A96B]" : "text-[#0E3B2E]"}`} />
                    <span className={plan.popular ? "text-white/85" : "text-white/65"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button
                  className="w-full"
                  variant={plan.popular ? "accent" : "outline"}
                >
                  {plan.popular ? "ابدأ بـ ٣ فرص مجاناً" : "اختر الخطة"}
                </Button>
              </Link>
              <div className="mt-3">
                <DemoReportLink
                  variant="ghost"
                  size="sm"
                  className={`w-full ${plan.popular ? "text-white/60 hover:text-white hover:bg-white/10" : "text-white/45 hover:text-white/70"}`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
          <DemoReportLink variant="outline" className="border-white/20 text-white/70 hover:bg-white/5" />
        </div>

        <p className="text-center text-xs text-white/30 mt-6 max-w-xl mx-auto">
          جميع الأسعار بالريال السعودي. التحليل المجاني يتضمن ٣ فرص كاملة — بدون بطاقة ائتمان.
        </p>
      </div>
    </section>
  );
}
