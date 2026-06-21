export type Locale = "ar" | "en";

export const translations = {
  ar: {
    tagline: "فك شفرة النمو",
    heroHeadline: "اكتشف الفرص التجارية المخفية",
    heroSubheadline:
      "أخبر تراميز بما تبيعه وسنكتشف الجهات الأكثر احتمالاً للاستفادة من خدماتك.",
    ctaPrimary: "ابدأ التحليل المجاني",
    ctaSecondary: "شاهد كيف يعمل",
    nav: {
      howItWorks: "كيف يعمل",
      features: "المميزات",
      pricing: "الأسعار",
      faq: "الأسئلة الشائعة",
      login: "تسجيل الدخول",
      signup: "إنشاء حساب",
    },
    dashboard: {
      overview: "نظرة عامة",
      opportunities: "الفرص",
      prospects: "العملاء المحتملون",
      competitors: "المنافسون",
      insights: "الرؤى",
      reports: "التقارير",
      settings: "الإعدادات",
    },
  },
  en: {
    tagline: "Decode Growth",
    heroHeadline: "Discover Hidden Business Opportunities",
    heroSubheadline:
      "Tell Taramiz what your business sells and we will identify companies most likely to buy from you.",
    ctaPrimary: "Start Free Analysis",
    ctaSecondary: "See How It Works",
    nav: {
      howItWorks: "How It Works",
      features: "Features",
      pricing: "Pricing",
      faq: "FAQ",
      login: "Log In",
      signup: "Sign Up",
    },
    dashboard: {
      overview: "Overview",
      opportunities: "Opportunities",
      prospects: "Prospects",
      competitors: "Competitors",
      insights: "Insights",
      reports: "Reports",
      settings: "Settings",
    },
  },
} as const;

export function t(locale: Locale, key: string): string {
  const keys = key.split(".");
  let value: unknown = translations[locale];
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k];
  }
  return (value as string) ?? key;
}
