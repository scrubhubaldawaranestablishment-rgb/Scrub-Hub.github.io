"use client";

import { useState, useMemo } from "react";
import { NICHE_CHANNELS } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import { v4 as uuid } from "uuid";
import { cn } from "@/lib/utils";
import { Search, Star } from "lucide-react";

export default function NicheFinderPage() {
  const [search, setSearch] = useState("");
  const [nicheFilter, setNicheFilter] = useState("all");
  const { saveChannel } = useAppStore();

  const niches = useMemo(() => ["all", ...new Set(NICHE_CHANNELS.map((c) => c.niche))], []);

  const filtered = useMemo(() => {
    return NICHE_CHANNELS.filter((c) => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.niche.toLowerCase().includes(search.toLowerCase());
      const matchNiche = nicheFilter === "all" || c.niche === nicheFilter;
      return matchSearch && matchNiche;
    });
  }, [search, nicheFilter]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">🔍 Niche Finder</h1>
        <p className="text-slate-500 mt-1">Discover high-performing faceless channels across niches. {NICHE_CHANNELS.length}+ channels in database.</p>
      </div>

      <div className="bg-white rounded-2xl border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search channels or niches..."
            />
          </div>
          <select
            value={nicheFilter}
            onChange={(e) => setNicheFilter(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {niches.map((n) => (
              <option key={n} value={n}>{n === "all" ? "All Niches" : n}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map((channel) => (
          <div key={channel.id} className="bg-white rounded-2xl border p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xl">📺</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{channel.name}</h3>
                {channel.monetized && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">💰</span>}
              </div>
              <p className="text-slate-500 text-sm">{channel.niche} · {channel.subscribers} subs · {channel.videos} videos · avg {channel.avgViews} views</p>
              <p className="text-sm text-slate-600 mt-1">{channel.description}</p>
            </div>
            <div className="text-center">
              <span className={cn("inline-block px-4 py-2 rounded-full text-lg font-bold", channel.outlierScore >= 3 ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700")}>
                {channel.outlierScore}x
              </span>
              <p className="text-xs text-slate-500 mt-1">outlier</p>
            </div>
            <button
              onClick={() => saveChannel({ id: uuid(), name: channel.name, handle: `@${channel.name.replace(/\s/g, "")}`, subscribers: channel.subscribers, savedAt: new Date().toISOString() })}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-100"
            >
              <Star className="inline w-4 h-4 mr-1" />Save
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">No channels found matching your search.</div>
        )}
      </div>
    </div>
  );
}
