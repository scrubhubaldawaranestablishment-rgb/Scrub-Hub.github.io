import {
  Target,
  Users,
  Shield,
  BarChart3,
  Lock,
  FileCheck,
} from "lucide-react";

const features = [
  {
    icon: Target,
    title_en: "Revenue-Ranked Opportunities",
    title_ar: "فرص مرتبة حسب قيمة الإيراد",
    desc_ar: "قائمة صفقات محتملة مع قيمة تقديرية وخطوة بيع واضحة — جاهزة لفريقك.",
  },
  {
    icon: Users,
    title_en: "Buyer Discovery",
    title_ar: "تحديد المشتري المناسب",
    desc_ar: "جهات B2B في السعودية مع سبب واضح لِمَ تشتري منك — لا قوائم contacts عشوائية.",
  },
  {
    icon: Shield,
    title_en: "Competitive Positioning",
    title_ar: "تموضع تنافسي",
    desc_ar: "اعرف أين يتفوق المنافس — وكيف تفوز بالصفقة بمزايا محددة.",
  },
  {
    icon: BarChart3,
    title_en: "Market Signals",
    title_ar: "إشارات السوق",
    desc_ar: "اتجاهات قطاعك في السعودية مع إجراء عملي — قبل أن يتحرك السوق.",
  },
  {
    icon: Lock,
    title_en: "Enterprise Security",
    title_ar: "أمان مؤسسي",
    desc_ar: "بياناتك في المملكة. تشفير كامل. بدون مشاركة مع أطراف ثالثة.",
  },
  {
    icon: FileCheck,
    title_en: "Board-Ready Reports",
    title_ar: "تقارير جاهزة للإدارة",
    desc_ar: "ملخص pipeline قابل للعرض — للمدير التنفيذي أو مجلس الإدارة.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-28 bg-white border-y border-[#0E3B2E]/6">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-[#C8A96B] uppercase tracking-[0.2em]">
            What You Get
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#0F1115]">
            ليس CRM. ليس قاعدة leads.
            <span className="block text-[#0F1115]/40 text-xl font-medium mt-2">
              محرك يحوّل وصف نشاطك إلى pipeline قابل للتنفيذ
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title_en}
              className="group rounded-xl border border-[#0E3B2E]/8 bg-[#FAFAF8] p-7 hover:border-[#0E3B2E]/18 hover:bg-white transition-all"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#0E3B2E] mb-5">
                <feature.icon className="h-5 w-5 text-[#C8A96B]" />
              </div>
              <h3 className="text-base font-semibold text-[#0F1115] mb-2">{feature.title_ar}</h3>
              <p className="text-[#0F1115]/55 leading-relaxed text-sm">{feature.desc_ar}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
