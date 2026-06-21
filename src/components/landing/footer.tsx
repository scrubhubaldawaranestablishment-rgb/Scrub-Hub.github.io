import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#0E3B2E]/10 bg-[#0F1115] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0E3B2E]">
                <span className="text-sm font-bold text-[#C8A96B]">T</span>
              </div>
              <div>
                <span className="text-lg font-semibold">تراميز</span>
                <span className="block text-xs text-white/40">Taramiz — Decode Growth</span>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-md">
              منصة ذكاء نمو B2B للسوق السعودي.
              حوّل وصف نشاطك إلى pipeline صفقات — مع قيمة تقديرية وخطوة بيع واضحة.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#C8A96B]">Platform</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><Link href="/signup" className="hover:text-white transition-colors">٣ فرص مجاناً</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#C8A96B]">Legal</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li><span>Privacy Policy</span></li>
              <li><span>Terms of Service</span></li>
              <li><span>Data Processing</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} Taramiz. All rights reserved. Made in Saudi Arabia 🇸🇦
          </p>
          <p className="text-sm text-white/30">
            Riyadh, Kingdom of Saudi Arabia
          </p>
        </div>
      </div>
    </footer>
  );
}
