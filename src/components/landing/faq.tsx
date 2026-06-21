const faqs = [
  {
    q_ar: "هل تراميز CRM أو قاعدة بيانات leads؟",
    q_en: "Is Taramiz a CRM or lead database?",
    a_ar: "لا. تراميز لا يخزّن contacts ولا يدير pipeline. نحن نُنتج لك قائمة فرص وصفقات محتملة — مع قيمة تقديرية وخطوة بيع — لتبدأ المتابعة فوراً.",
    a_en: "No. Taramiz produces ranked deal opportunities with estimated value — you execute the sales follow-up.",
  },
  {
    q_ar: "ماذا أحصل عليه في التحليل المجاني؟",
    q_en: "What do I get in the free analysis?",
    a_ar: "٣ فرص كاملة: العنوان، الوصف، قيمة الصفقة المتوقعة، احتمال الإغلاق، وخطوتك التالية. باقي التقرير (127 فرصة) متاح في خطة النمو.",
    a_en: "3 full opportunities with deal value and next sales step. The remaining 127 are available on Growth.",
  },
  {
    q_ar: "هل بياناتي آمنة؟",
    q_en: "Is my data secure?",
    a_ar: "نعم. استضافة في المملكة، تشفير كامل، ولا نشارك بياناتك مع أي طرف ثالث.",
    a_en: "Yes. Saudi-hosted, fully encrypted, no third-party data sharing.",
  },
  {
    q_ar: "ما القطاعات التي تغطونها؟",
    q_en: "Which sectors do you cover?",
    a_ar: "كل B2B في السعودية: مرافق، ضيافة، صحة، لوجستيات، أمن، موارد بشرية، مطاعم، وغيرها.",
    a_en: "All Saudi B2B sectors including facilities, hospitality, healthcare, logistics, and more.",
  },
  {
    q_ar: "هل يمكنني الإلغاء؟",
    q_en: "Can I cancel?",
    a_ar: "نعم — شهرياً، بدون عقد، بدون رسوم إلغاء.",
    a_en: "Yes — monthly, no contract, no cancellation fees.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-28 bg-[#F8F7F3]">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-[#C8A96B] uppercase tracking-[0.2em]">
            FAQ
          </span>
          <h2 className="mt-4 text-3xl font-bold text-[#0F1115]">
            أسئلة شائعة
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group rounded-xl border border-[#0E3B2E]/10 bg-white px-6 py-1 open:shadow-sm"
            >
              <summary className="cursor-pointer list-none py-4 font-medium text-[#0F1115] flex justify-between items-center">
                <span>{faq.q_ar}</span>
                <span className="text-[#0F1115]/30 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
              </summary>
              <div className="pb-5 text-sm text-[#0F1115]/65 leading-relaxed border-t border-[#0E3B2E]/6 pt-4">
                {faq.a_ar}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
