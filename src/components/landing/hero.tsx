"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Building2, Target } from "lucide-react";
import { DemoReportLink } from "@/components/landing/demo-report-link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-28">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#F8F7F3_0%,#F3F1EB_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#0E3B2E06_0%,_transparent_55%)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0E3B2E]/15 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#0E3B2E]/12 bg-white/80 px-4 py-2 text-xs font-medium tracking-wide text-[#0E3B2E] shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C8A96B]" />
              منصة ذكاء نمو B2B — السوق السعودي
            </div>

            <div className="space-y-5">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-[#0F1115] leading-[1.12] tracking-tight">
                <span className="block text-[#0E3B2E]">
                  اعرف من سيتعاقد معك — قبل منافسيك
                </span>
                <span className="block text-[#0F1115]/35 text-2xl sm:text-3xl mt-3 font-medium">
                  Know who will buy from you — before your competitors do
                </span>
              </h1>
              <p className="text-lg text-[#0F1115]/65 max-w-xl leading-relaxed">
                صف خدماتك في دقيقتين. تراميز يُرجع لك قائمة جهات جاهزة للمتابعة — مع قيمة الصفقة المتوقعة وخطوتك التالية للبيع.
                <span className="block mt-3 text-base text-[#0F1115]/45 leading-relaxed">
                  Describe what you sell. Get a ranked list of buyers, estimated deal value, and your next sales move.
                </span>
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/signup">
                <Button size="lg" className="gap-2 px-8 shadow-lg shadow-[#0E3B2E]/15">
                  احصل على ٣ فرص مجاناً
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg" className="border-[#0E3B2E]/20">
                  كيف نحدد الفرص؟
                </Button>
              </a>
              <DemoReportLink size="lg" className="border-[#C8A96B]/40 text-[#0E3B2E] hover:bg-[#C8A96B]/10" />
            </div>

            <div className="grid grid-cols-3 gap-6 pt-2 border-t border-[#0E3B2E]/8">
              {[
                { value: "١.٠٥M ر.س", label: "متوسط pipeline لكل تحليل", sub: "Avg. pipeline per scan" },
                { value: "٣", label: "فرص مجانية فوراً", sub: "Free opportunities now" },
                { value: "١٣٠+", label: "جهة محتملة لكل مسح", sub: "Buyers per market scan" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-xl sm:text-2xl font-bold text-[#0E3B2E] tabular-nums">{stat.value}</div>
                  <div className="text-xs text-[#0F1115]/55 mt-1 leading-snug">{stat.label}</div>
                </div>
              ))}
            </div>

            <p className="text-xs text-[#0F1115]/35 tracking-wide">
              موثوق من منشآت B2B في الرياض · جدة · الدمام · الخبر
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-[#0E3B2E]/3 blur-2xl" />
            <div className="relative rounded-2xl border border-[#0E3B2E]/12 bg-white p-7 shadow-[0_24px_80px_-12px_rgba(14,59,46,0.12)]">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#0E3B2E]/8">
                <div>
                  <span className="text-[10px] font-semibold text-[#0F1115]/40 uppercase tracking-[0.15em]">
                    Taramiz Pipeline Preview
                  </span>
                  <p className="text-sm font-medium text-[#0F1115] mt-0.5">تقرير فرص — نشاط تجاري</p>
                </div>
                <span className="rounded-md bg-[#0E3B2E]/8 px-2.5 py-1 text-xs font-medium text-[#0E3B2E]">
                  ٣ فرص مفتوحة
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    icon: Target,
                    title: "عقود إدارة مرافق — قطاع corporates",
                    match: "91%",
                    revenue: "٤٥٠,٠٠٠ ر.س",
                    status: "جاهزة للمتابعة",
                  },
                  {
                    icon: Building2,
                    title: "توسع قطاع الضيافة — Vision 2030",
                    match: "88%",
                    revenue: "٣٢٠,٠٠٠ ر.س",
                    status: "أولوية عالية",
                  },
                  {
                    icon: TrendingUp,
                    title: "شراكات مرافق صحية خاصة",
                    match: "86%",
                    revenue: "٢٨٠,٠٠٠ ر.س",
                    status: "موصى بالتواصل",
                  },
                ].map((item, i) => (
                  <div
                    key={item.title}
                    className="flex items-center gap-4 rounded-xl border border-[#0E3B2E]/8 bg-[#FAFAF8] p-4"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0E3B2E] text-[#C8A96B] text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-[#0F1115] leading-snug line-clamp-2">
                        {item.title}
                      </div>
                      <div className="text-xs text-[#0E3B2E]/70 mt-0.5">{item.status}</div>
                    </div>
                    <div className="text-left shrink-0">
                      <div className="text-sm font-bold text-[#C8A96B] tabular-nums">{item.revenue}</div>
                      <div className="text-[10px] text-[#0F1115]/45">احتمال الإغلاق {item.match}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-lg border border-dashed border-[#C8A96B]/40 bg-[#C8A96B]/5 px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-[#0F1115]/60">
                  +127 فرصة إضافية في تقريرك
                </span>
                <span className="text-xs font-medium text-[#0E3B2E]">خطة النمو</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
