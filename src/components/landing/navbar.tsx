"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function Navbar() {
  const [locale, setLocale] = useState<"ar" | "en">("ar");
  const isAr = locale === "ar";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#0E3B2E]/8 bg-[#F8F7F3]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0E3B2E]">
            <span className="text-sm font-bold text-[#C8A96B]">T</span>
          </div>
          <div className={isAr ? "text-right" : "text-left"}>
            <span className="text-lg font-semibold text-[#0F1115]">
              {isAr ? "تراميز" : "Taramiz"}
            </span>
            <span className="hidden sm:block text-xs text-[#0F1115]/50">
              {isAr ? "فك شفرة النمو" : "Decode Growth"}
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {[
            { href: "#how-it-works", ar: "كيف يعمل", en: "How It Works" },
            { href: "#features", ar: "المميزات", en: "Features" },
            { href: "#pricing", ar: "الأسعار", en: "Pricing" },
            { href: "#faq", ar: "الأسئلة الشائعة", en: "FAQ" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-[#0F1115]/70 hover:text-[#0E3B2E] transition-colors"
            >
              {isAr ? item.ar : item.en}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocale(isAr ? "en" : "ar")}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-[#0F1115]/70 hover:bg-[#0E3B2E]/5 transition-colors"
          >
            <Globe className="h-4 w-4" />
            {isAr ? "EN" : "عربي"}
          </button>
          <Link href="/login">
            <Button variant="ghost" size="sm">
              {isAr ? "تسجيل الدخول" : "Log In"}
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">
              {isAr ? "ابدأ مجاناً" : "Start Free"}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
