"use client";

import { useState } from "react";
import { MONETIZE_STRATEGIES } from "@/lib/data";
import { cn } from "@/lib/utils";
import { DollarSign, TrendingUp, Calculator } from "lucide-react";

export default function MonetizePage() {
  const [subscribers, setSubscribers] = useState(50000);
  const [monthlyViews, setMonthlyViews] = useState(500000);
  const [rpm, setRpm] = useState(8);
  const [videosPerMonth, setVideosPerMonth] = useState(8);

  const adRevenue = (monthlyViews / 1000) * rpm;
  const affiliateRevenue = subscribers > 10000 ? subscribers * 0.02 : 0;
  const sponsorshipRevenue = subscribers > 50000 ? (monthlyViews / 1000) * 25 : 0;
  const totalRevenue = adRevenue + affiliateRevenue + sponsorshipRevenue;

  const potentialColors: Record<string, string> = {
    High: "bg-green-100 text-green-700",
    Medium: "bg-amber-100 text-amber-700",
    Low: "bg-slate-100 text-slate-600",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">💰 Monetize</h1>
        <p className="text-slate-500 mt-1">Discover revenue streams and calculate your channel&apos;s earning potential.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 bg-white rounded-2xl border p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2"><Calculator className="w-5 h-5" /> Revenue Calculator</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-500 mb-1 block">Subscribers: {subscribers.toLocaleString()}</label>
              <input type="range" min="1000" max="1000000" step="1000" value={subscribers} onChange={(e) => setSubscribers(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="text-sm text-slate-500 mb-1 block">Monthly Views: {monthlyViews.toLocaleString()}</label>
              <input type="range" min="10000" max="5000000" step="10000" value={monthlyViews} onChange={(e) => setMonthlyViews(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="text-sm text-slate-500 mb-1 block">RPM: ${rpm}</label>
              <input type="range" min="1" max="25" step="0.5" value={rpm} onChange={(e) => setRpm(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="text-sm text-slate-500 mb-1 block">Videos/Month: {videosPerMonth}</label>
              <input type="range" min="1" max="30" value={videosPerMonth} onChange={(e) => setVideosPerMonth(Number(e.target.value))} className="w-full" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white sm:col-span-2">
            <p className="text-indigo-100 text-sm mb-1">Estimated Monthly Revenue</p>
            <p className="text-4xl font-bold">${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            <p className="text-indigo-200 text-sm mt-2">${(totalRevenue * 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}/year projected</p>
          </div>
          {[
            { label: "Ad Revenue", amount: adRevenue, icon: "📺" },
            { label: "Affiliate Income", amount: affiliateRevenue, icon: "🔗" },
            { label: "Sponsorships", amount: sponsorshipRevenue, icon: "🤝" },
            { label: "Per Video", amount: totalRevenue / videosPerMonth, icon: "🎬" },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-2xl border p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{item.icon}</span>
                <p className="font-medium text-sm text-slate-600">{item.label}</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">${item.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Monetization Strategies</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {MONETIZE_STRATEGIES.map((strategy) => (
            <div key={strategy.title} className="bg-white rounded-2xl border p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-600" />{strategy.title}</h3>
                <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", potentialColors[strategy.potential])}>{strategy.potential} potential</span>
              </div>
              <p className="text-sm text-slate-600">{strategy.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
