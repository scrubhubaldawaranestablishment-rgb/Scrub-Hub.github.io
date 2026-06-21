import { Search, Brain, Rocket } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title_en: "Describe Your Business",
    title_ar: "صف عملك",
    desc_en: "Tell us what you sell, your target market, and location. Takes 2 minutes.",
    desc_ar: "أخبرنا بما تبيعه، السوق المستهدف، والموقع. يستغرق دقيقتين.",
  },
  {
    icon: Brain,
    step: "02",
    title_en: "AI Intelligence Analysis",
    title_ar: "تحليل الذكاء الاصطناعي",
    desc_en: "Our proprietary engine scans market data, competitors, and buyer signals.",
    desc_ar: "محركنا الخاص يفحص بيانات السوق والمنافسين وإشارات المشترين.",
  },
  {
    icon: Rocket,
    step: "03",
    title_en: "Act on Opportunities",
    title_ar: "تنفيذ الفرص",
    desc_en: "Get ranked opportunities, prospects, and actionable growth recommendations.",
    desc_ar: "احصل على فرص مرتبة وعملاء محتملين وتوصيات نمو قابلة للتنفيذ.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-[#C8A96B] uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-[#0F1115]">
            كيف يعمل تراميز
          </h2>
          <p className="mt-4 text-[#0F1115]/60 max-w-2xl mx-auto">
            Three steps from business description to actionable intelligence
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={step.step} className="relative group">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-[#0E3B2E]/20 to-transparent" />
              )}
              <div className="rounded-2xl border border-[#0E3B2E]/8 bg-[#F8F7F3]/50 p-8 hover:border-[#0E3B2E]/20 transition-all hover:shadow-lg hover:shadow-[#0E3B2E]/5">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0E3B2E] text-white">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="text-3xl font-bold text-[#0E3B2E]/15">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-[#0F1115] mb-1">{step.title_ar}</h3>
                <p className="text-sm text-[#0F1115]/40 mb-3">{step.title_en}</p>
                <p className="text-[#0F1115]/60 leading-relaxed">{step.desc_ar}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
