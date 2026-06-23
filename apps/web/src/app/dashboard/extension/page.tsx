"use client";

import { useState } from "react";
import { analyzeChannel } from "@/lib/ai";
import { SAMPLE_VIDEOS } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import { v4 as uuid } from "uuid";
import { cn } from "@/lib/utils";
import { Search, Star, Trash2 } from "lucide-react";

export default function ExtensionPage() {
  const [url, setUrl] = useState("https://youtube.com/@BropumpYT");
  const [analyzed, setAnalyzed] = useState<ReturnType<typeof analyzeChannel> | null>(null);
  const [loading, setLoading] = useState(false);
  const { savedChannels, saveChannel, removeChannel } = useAppStore();

  const handleAnalyze = () => {
    setLoading(true);
    setTimeout(() => {
      setAnalyzed(analyzeChannel(url));
      setLoading(false);
    }, 800);
  };

  const handleSave = () => {
    if (!analyzed) return;
    saveChannel({
      id: uuid(),
      name: analyzed.name,
      handle: analyzed.handle,
      subscribers: analyzed.subscribers,
      savedAt: new Date().toISOString(),
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">🧩 Chrome Extension</h1>
        <p className="text-slate-500 mt-1">Analyze any YouTube channel — outlier scores, tags, monetization, and analytics.</p>
      </div>

      <div className="bg-white rounded-2xl border p-6 mb-6">
        <label className="block text-sm font-medium mb-2">YouTube Channel URL</label>
        <div className="flex gap-3">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="https://youtube.com/@channelname"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50"
          >
            {loading ? "Analyzing..." : <><Search className="inline w-4 h-4 mr-2" />Analyze</>}
          </button>
        </div>
      </div>

      {analyzed && (
        <div className="bg-white rounded-2xl border overflow-hidden mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500" />
              <div>
                <h2 className="text-xl font-bold">{analyzed.name}</h2>
                <p className="text-slate-500">{analyzed.handle} · {analyzed.subscribers} subscribers · {analyzed.videos} videos</p>
              </div>
              <div className="ml-auto flex gap-2">
                {analyzed.monetized && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">💰 Monetized</span>}
                <button onClick={handleSave} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium hover:bg-indigo-200">
                  <Star className="inline w-3 h-3 mr-1" />Save Channel
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4 p-6 bg-slate-50 border-b">
            {[
              { label: "Monthly Views", value: analyzed.monthlyViews },
              { label: "Total Views", value: analyzed.totalViews },
              { label: "Est. Revenue", value: analyzed.estimatedRevenue },
              { label: "RPM", value: analyzed.rpm },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="p-6">
            <div className="flex gap-2 mb-4">
              {["Videos", "Shorts", "Posts"].map((tab) => (
                <span key={tab} className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm">{tab}</span>
              ))}
              <span className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm ml-auto">📊 Analytics</span>
              <span className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm">🔍 Similar Channels</span>
              <span className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm">🔬 Audit Channel</span>
            </div>

            <div className="space-y-3">
              {SAMPLE_VIDEOS.map((video) => (
                <div key={video.title} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-28 h-16 bg-slate-200 rounded-lg flex items-center justify-center text-xs font-medium text-slate-600">{video.duration}</div>
                  <div className="flex-1">
                    <p className="font-medium">{video.title}</p>
                    <p className="text-sm text-slate-500">{video.views} views · {video.age}</p>
                  </div>
                  <span className={cn("px-3 py-1 rounded-full text-sm font-bold", video.outlier >= 3 ? "bg-green-100 text-green-700" : video.outlier < 1.5 ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600")}>
                    {video.outlier}x outlier
                  </span>
                  <button className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg">🔍 Scan</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {savedChannels.length > 0 && (
        <div className="bg-white rounded-2xl border p-6">
          <h3 className="font-bold text-lg mb-4">⭐ Saved Channels</h3>
          <div className="space-y-2">
            {savedChannels.map((ch) => (
              <div key={ch.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">📺</div>
                <div className="flex-1">
                  <p className="font-medium">{ch.name}</p>
                  <p className="text-sm text-slate-500">{ch.handle} · {ch.subscribers}</p>
                </div>
                <button onClick={() => removeChannel(ch.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
