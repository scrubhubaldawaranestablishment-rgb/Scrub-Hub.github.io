import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q_ar: "هل تراميز نظام CRM؟",
    q_en: "Is Taramiz a CRM?",
    a_ar: "لا. تراميز ليس CRM ولا قاعدة بيانات leads. نحن منصة ذكاء فرص تستخدم الذكاء الاصطناعي لاكتشاف فرص مبيعات مخفية وعملاء محتملين وتحليل المنافسين.",
    a_en: "No. Taramiz is not a CRM or lead database. We are an AI Opportunity Intelligence Platform.",
  },
  {
    q_ar: "كيف يعمل التحليل المجاني؟",
    q_en: "How does the free analysis work?",
    a_ar: "تحصل على 3 فرص مجانية مع كل تحليل. يمكنك رؤية 127 فرصة إضافية مقفلة — قم بالترقية لفتحها جميعاً.",
    a_en: "You get 3 free opportunities per analysis. 127 additional opportunities are locked until you upgrade.",
  },
  {
    q_ar: "هل البيانات آمنة؟",
    q_en: "Is my data secure?",
    a_ar: "نعم. نستخدم تشفير على مستوى البنوك مع استضافة بيانات في المملكة العربية السعودية.",
    a_en: "Yes. We use bank-grade encryption with Saudi data residency.",
  },
  {
    q_ar: "ما هي الصناعات المدعومة؟",
    q_en: "What industries are supported?",
    a_ar: "ندعم جميع قطاعات B2B في السعودية: الغسيل، العيادات، الفنادق، المطاعم، اللوجستيات، الصيانة، الأمن، الموارد البشرية، والمزيد.",
    a_en: "All B2B sectors in Saudi Arabia including laundry, clinics, hotels, restaurants, logistics, and more.",
  },
  {
    q_ar: "هل يمكنني إلغاء الاشتراك؟",
    q_en: "Can I cancel anytime?",
    a_ar: "نعم. يمكنك إلغاء اشتراكك في أي وقت بدون رسوم إضافية.",
    a_en: "Yes. Cancel anytime with no additional fees.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 bg-[#F8F7F3]">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-[#C8A96B] uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="mt-3 text-3xl font-bold text-[#0F1115]">
            الأسئلة الشائعة
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-xl border border-[#0E3B2E]/10 bg-white px-6"
            >
              <AccordionTrigger className="text-[#0F1115] hover:no-underline">
                <div className="text-right w-full">
                  <span className="block font-medium">{faq.q_ar}</span>
                  <span className="block text-sm text-[#0F1115]/40 font-normal">{faq.q_en}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-[#0F1115]/70 leading-relaxed">{faq.a_ar}</p>
                <p className="text-sm text-[#0F1115]/40 mt-2">{faq.a_en}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
