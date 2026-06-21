import {
  Target,
  Users,
  Shield,
  BarChart3,
  Lock,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Target,
    title_en: "Opportunity Intelligence",
    title_ar: "ذكاء الفرص",
    desc_en: "Discover hidden sales opportunities ranked by revenue potential and confidence score.",
    desc_ar: "اكتشف فرص مبيعات مخفية مرتبة حسب إمكانية الإيرادات ودرجة الثقة.",
  },
  {
    icon: Users,
    title_en: "AI Customer Discovery",
    title_ar: "اكتشاف العملاء بالذكاء الاصطناعي",
    desc_en: "Identify companies most likely to buy from you with fit scores and matching rationale.",
    desc_ar: "حدد الشركات الأكثر احتمالاً للشراء منك مع درجات التوافق وأسباب المطابقة.",
  },
  {
    icon: Shield,
    title_en: "Competitor Monitoring",
    title_ar: "مراقبة المنافسين",
    desc_en: "Track competitor strengths, weaknesses, and get suggested advantages to win.",
    desc_ar: "تابع نقاط قوة وضعف المنافسين واحصل على مزايا مقترحة للفوز.",
  },
  {
    icon: BarChart3,
    title_en: "Market Insights",
    title_ar: "رؤى السوق",
    desc_en: "Stay ahead with market trends, growth opportunities, and recommended actions.",
    desc_ar: "ابقَ في المقدمة مع اتجاهات السوق وفرص النمو والإجراءات الموصى بها.",
  },
  {
    icon: Lock,
    title_en: "Enterprise Security",
    title_ar: "أمان المؤسسات",
    desc_en: "Bank-grade encryption, Saudi data residency, and role-based access control.",
    desc_ar: "تشفير على مستوى البنوك، استضافة بيانات سعودية، وتحكم بالوصول.",
  },
  {
    icon: Zap,
    title_en: "Instant Analysis",
    title_ar: "تحليل فوري",
    desc_en: "Get comprehensive intelligence reports in minutes, not weeks.",
    desc_ar: "احصل على تقارير ذكاء شاملة في دقائق، وليس أسابيع.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-[#F8F7F3]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-[#C8A96B] uppercase tracking-wider">
            Platform Capabilities
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-[#0F1115]">
            منصة ذكاء الفرص
          </h2>
          <p className="mt-4 text-[#0F1115]/60 max-w-2xl mx-auto">
            Not a CRM. Not a lead database. A proprietary intelligence engine for growth.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title_en}
              className="group rounded-2xl border border-[#0E3B2E]/8 bg-white p-8 hover:border-[#0E3B2E]/20 transition-all hover:shadow-xl hover:shadow-[#0E3B2E]/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0E3B2E]/8 group-hover:bg-[#0E3B2E] transition-colors mb-6">
                <feature.icon className="h-6 w-6 text-[#0E3B2E] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-[#0F1115] mb-1">{feature.title_ar}</h3>
              <p className="text-sm text-[#0F1115]/40 mb-3">{feature.title_en}</p>
              <p className="text-[#0F1115]/60 leading-relaxed text-sm">{feature.desc_ar}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
