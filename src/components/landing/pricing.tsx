import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { PRICING_PLANS } from "@/lib/data/constants";

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-[#C8A96B] uppercase tracking-wider">
            Pricing
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-[#0F1115]">
            خطط الأسعار
          </h2>
          <p className="mt-4 text-[#0F1115]/60">
            Start free. Scale as you grow. All prices in SAR.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-8 ${
                plan.popular
                  ? "border-[#0E3B2E] bg-[#0E3B2E] text-white shadow-2xl shadow-[#0E3B2E]/20 scale-105"
                  : "border-[#0E3B2E]/10 bg-[#F8F7F3]/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#C8A96B] px-4 py-1 text-xs font-semibold text-[#0F1115]">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className={`text-xl font-semibold ${plan.popular ? "text-white" : "text-[#0F1115]"}`}>
                  {plan.name_ar}
                </h3>
                <p className={`text-sm mt-1 ${plan.popular ? "text-white/60" : "text-[#0F1115]/40"}`}>
                  {plan.name_en}
                </p>
              </div>
              <div className="mb-6">
                <span className={`text-4xl font-bold ${plan.popular ? "text-[#C8A96B]" : "text-[#0E3B2E]"}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ${plan.popular ? "text-white/60" : "text-[#0F1115]/50"}`}>
                  {" "}SAR/month
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features_ar.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${plan.popular ? "text-[#C8A96B]" : "text-[#0E3B2E]"}`} />
                    <span className={plan.popular ? "text-white/80" : "text-[#0F1115]/70"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button
                  className="w-full"
                  variant={plan.popular ? "accent" : "default"}
                >
                  {plan.popular ? "ابدأ الآن" : "اختر الخطة"}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
