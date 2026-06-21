"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Building2, Target } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#0E3B2E08_0%,_transparent_60%)]" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#C8A96B]/5 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0E3B2E]/15 bg-white px-4 py-1.5 text-sm text-[#0E3B2E]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C8A96B] animate-pulse" />
              AI Opportunity Intelligence Platform
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0F1115] leading-[1.1] tracking-tight">
                <span className="block text-[#0E3B2E]">اكتشف الفرص التجارية المخفية</span>
                <span className="block text-[#0F1115]/40 text-3xl sm:text-4xl mt-2 font-medium">
                  Discover Hidden Business Opportunities
                </span>
              </h1>
              <p className="text-lg text-[#0F1115]/60 max-w-xl leading-relaxed">
                أخبر تراميز بما تبيعه وسنكتشف الجهات الأكثر احتمالاً للاستفادة من خدماتك.
                <span className="block mt-2 text-base text-[#0F1115]/40">
                  Tell Taramiz what your business sells and we will identify companies most likely to buy from you.
                </span>
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  ابدأ التحليل المجاني
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg">
                  See How It Works
                </Button>
              </a>
            </div>

            <div className="flex items-center gap-8 pt-4">
              {[
                { value: "130+", label: "Opportunities per analysis" },
                { value: "94%", label: "Match accuracy" },
                { value: "2,400+", label: "Saudi businesses analyzed" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-[#0E3B2E]">{stat.value}</div>
                  <div className="text-xs text-[#0F1115]/50">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-[#0E3B2E]/10 bg-white p-6 shadow-2xl shadow-[#0E3B2E]/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#C8A96B]" />
                  <span className="text-xs font-medium text-[#0F1115]/50 uppercase tracking-wider">
                    Taramiz Intelligence Engine
                  </span>
                </div>
                <span className="text-xs text-[#0E3B2E] font-medium">Live Analysis</span>
              </div>

              <div className="space-y-4">
                {[
                  {
                    icon: Target,
                    title: "Corporate Facility Contracts",
                    match: "91%",
                    revenue: "450,000 SAR",
                    status: "High Confidence",
                  },
                  {
                    icon: Building2,
                    title: "Hospitality Sector Expansion",
                    match: "88%",
                    revenue: "320,000 SAR",
                    status: "Strong Match",
                  },
                  {
                    icon: TrendingUp,
                    title: "Healthcare Facility Partnerships",
                    match: "86%",
                    revenue: "280,000 SAR",
                    status: "Recommended",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center gap-4 rounded-xl border border-[#0E3B2E]/8 bg-[#F8F7F3]/50 p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0E3B2E]/8">
                      <item.icon className="h-5 w-5 text-[#0E3B2E]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-[#0F1115] truncate">
                        {item.title}
                      </div>
                      <div className="text-xs text-[#0F1115]/50">{item.status}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-[#C8A96B]">{item.revenue}</div>
                      <div className="text-xs text-[#0E3B2E]">{item.match}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-lg bg-[#0E3B2E]/5 border border-[#0E3B2E]/10 p-3 text-center">
                <span className="text-sm text-[#0F1115]/60">
                  +127 additional opportunities available
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
