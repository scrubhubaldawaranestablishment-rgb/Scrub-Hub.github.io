import { DemoRequestForm } from "@/components/landing/demo-request-form";
import { Check } from "lucide-react";

const bullets = [
  "٣ فرص مخصصة لنشاطك — مع قيمة الصفقة المتوقعة",
  "قائمة مشترين محتملين في مدينتك",
  "خطوة بيع واضحة لكل فرصة",
];

export function DemoRequestSection() {
  return (
    <section id="demo-request" className="py-28 bg-[#0E3B2E] relative overflow-hidden scroll-mt-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#C8A96B10_0%,_transparent_50%)]" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-white">
            <span className="inline-block text-xs font-semibold text-[#C8A96B] uppercase tracking-[0.2em] mb-4">
              تقرير تجريبي مجاني
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-5">
              لا وقت للتسجيل؟
              <span className="block text-white/55 text-xl font-medium mt-2">
                اطلب تقريرك — ونرسل لك ٣ فرص خلال ٢٤ ساعة
              </span>
            </h2>
            <p className="text-white/60 leading-relaxed mb-8 max-w-md">
              املأ النموذج وسيتواصل فريق تراميز معك عبر واتساب بأول ٣ فرص مناسبة لقطاعك ومدينتك.
            </p>
            <ul className="space-y-3">
              {bullets.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white/75">
                  <Check className="h-4 w-4 text-[#C8A96B] mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-xs text-white/30 mt-8">
              أكثر من ٢,٤٠٠ منشأة B2B في السعودية استخدمت تراميز
            </p>
          </div>

          <DemoRequestForm />
        </div>
      </div>
    </section>
  );
}
