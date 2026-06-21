import { ClipboardList, ScanSearch, Handshake } from "lucide-react";
import { DemoReportLink } from "@/components/landing/demo-report-link";

const steps = [
  {
    icon: ClipboardList,
    step: "01",
    title_ar: "صف نشاطك التجاري",
    title_en: "Describe your business",
    desc_ar: "ماذا تبيع؟ لمن؟ وأين؟ — ٣ أسئلة في أقل من دقيقتين.",
  },
  {
    icon: ScanSearch,
    step: "02",
    title_ar: "مسح السوق والطلب",
    title_en: "Market & demand scan",
    desc_ar: "تراميز يحلل قطاعك في السعودية: مشترين محتملين، منافسين، وإشارات طلب حقيقية.",
  },
  {
    icon: Handshake,
    step: "03",
    title_ar: "تابع الصفقات",
    title_en: "Close the deals",
    desc_ar: "فرص مرتبة بقيمة الإيراد + قائمة مشترين + خطوتك التالية — جاهزة لفريق المبيعات.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 bg-[#F8F7F3]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-[#C8A96B] uppercase tracking-[0.2em]">
            How It Works
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#0F1115]">
            من الوصف إلى pipeline — في ٣ خطوات
          </h2>
          <p className="mt-4 text-[#0F1115]/50 max-w-xl mx-auto">
            بدون إعداد معقد. بدون تدريب. النتيجة: قائمة صفقات جاهزة للمتابعة.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div key={step.step} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-14 right-[55%] w-[90%] h-px bg-[#0E3B2E]/12" />
              )}
              <div className="rounded-xl border border-[#0E3B2E]/10 bg-white p-8 h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0E3B2E] text-white">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="text-4xl font-bold text-[#0E3B2E]/10 tabular-nums">{step.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-[#0F1115] mb-1">{step.title_ar}</h3>
                <p className="text-xs text-[#0F1115]/35 mb-3 uppercase tracking-wide">{step.title_en}</p>
                <p className="text-[#0F1115]/60 leading-relaxed text-sm">{step.desc_ar}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <DemoReportLink size="lg" />
        </div>
      </div>
    </section>
  );
}
