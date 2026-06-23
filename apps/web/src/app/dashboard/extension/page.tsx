"use client";

import { useState } from "react";
import { analyzeYouTube, useSettingsStore } from "@/lib/api-client";
import type { YouTubeAnalysisResult } from "@/lib/youtube-api";
import { useAppStore } from "@/lib/store";
import { v4 as uuid } from "uuid";
import { cn } from "@/lib/utils";
import { Search, Star, Trash2, AlertCircle, ExternalLink, Settings } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ExtensionPage() {
  const [url, setUrl] = useState("");
  const [analyzed, setAnalyzed] = useState<YouTubeAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { savedChannels, saveChannel, removeChannel } = useAppStore();
  const { youtubeApiKey } = useSettingsStore();

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalyzed(null);

    try {
      const result = await analyzeYouTube(url.trim(), youtubeApiKey || undefined);
      setAnalyzed(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Check your URL and API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAnalyze();
  };

  const handleSave = () => {
    if (!analyzed) return;
    saveChannel({
      id: uuid(),
      name: analyzed.name,
      handle: analyzed.handle,
      subscribers: analyzed.subscribersFormatted,
      savedAt: new Date().toISOString(),
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">🧩 Chrome Extension</h1>
        <p className="text-slate-500 mt-1">
          Analyze any YouTube channel or video — outlier scores, tags, monetization, and analytics.
        </p>
      </div>

      {!youtubeApiKey && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 font-medium">YouTube API key recommended for full analytics</p>
            <p className="text-sm text-amber-700 mt-1">
              Video URLs work with basic data. For channel stats, outlier scores, and video lists, add your free API key in{" "}
              <Link href="/dashboard/settings" className="underline font-medium inline-flex items-center gap-1">
                <Settings className="w-3 h-3" /> Settings
              </Link>
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border p-6 mb-6">
        <label className="block text-sm font-medium mb-2">YouTube URL (video or channel)</label>
        <div className="flex gap-3">
          <input
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(null); }}
            onKeyDown={handleKeyDown}
            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="https://youtube.com/watch?v=... or youtube.com/@channel"
          />
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            <Search className="w-4 h-4" />
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">Supports video links, @handles, /channel/ID, and youtu.be URLs</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {analyzed && (
        <div className="bg-white rounded-2xl border overflow-hidden mb-6">
          {analyzed.dataSource === "oembed-fallback" && (
            <div className="px-6 py-3 bg-amber-50 border-b border-amber-100 text-sm text-amber-800">
              ⚠️ Limited data — add YouTube API key in Settings for full channel analytics and outlier scores.
            </div>
          )}

          <div className="p-6 border-b">
            <div className="flex items-center gap-4 flex-wrap">
              {analyzed.thumbnail ? (
                <Image src={analyzed.thumbnail} alt={analyzed.name} width={64} height={64} className="w-16 h-16 rounded-full object-cover" unoptimized />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500" />
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold">{analyzed.name}</h2>
                <p className="text-slate-500">
                  {analyzed.handle} · {analyzed.subscribersFormatted} subscribers · {analyzed.videos} videos
                </p>
                {analyzed.description && <p className="text-sm text-slate-600 mt-1 line-clamp-2">{analyzed.description}</p>}
              </div>
              <div className="flex gap-2 flex-wrap">
                {analyzed.monetized && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">💰 Monetized</span>
                )}
                <button type="button" onClick={handleSave} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium hover:bg-indigo-200">
                  <Star className="inline w-3 h-3 mr-1" />Save Channel
                </button>
                {analyzed.channelId && (
                  <a
                    href={`https://youtube.com/channel/${analyzed.channelId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium hover:bg-slate-200 inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> YouTube
                  </a>
                )}
              </div>
            </div>
            {analyzed.sourceVideo && (
              <p className="text-sm text-indigo-600 mt-3">
                📹 Analyzed from video: &ldquo;{analyzed.sourceVideo.title}&rdquo;
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-50 border-b">
            {[
              { label: "Monthly Views (est.)", value: analyzed.monthlyViews },
              { label: "Total Views", value: analyzed.totalViewsFormatted },
              { label: "Est. Revenue", value: analyzed.estimatedRevenue },
              { label: "RPM (est.)", value: analyzed.rpm },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="p-6">
            <div className="flex gap-2 mb-4 flex-wrap">
              <span className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm">📊 Analytics</span>
              <span className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm">Avg outlier: {analyzed.avgOutlier}x</span>
            </div>

            <div className="space-y-3">
              {analyzed.videoList.length > 0 ? (
                analyzed.videoList.map((video) => (
                  <div key={video.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    {video.thumbnail ? (
                      <Image src={video.thumbnail} alt="" width={112} height={64} className="w-28 h-16 rounded-lg object-cover shrink-0" unoptimized />
                    ) : (
                      <div className="w-28 h-16 bg-slate-200 rounded-lg flex items-center justify-center text-xs font-medium text-slate-600 shrink-0">{video.duration}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{video.title}</p>
                      <p className="text-sm text-slate-500">{video.viewsFormatted} views · {video.age}</p>
                    </div>
                    <span className={cn("px-3 py-1 rounded-full text-sm font-bold shrink-0", video.outlier >= 3 ? "bg-green-100 text-green-700" : video.outlier < 1.5 ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600")}>
                      {video.outlier}x
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-8">Add YouTube API key to load channel videos</p>
              )}
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
                <button type="button" onClick={() => removeChannel(ch.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
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
