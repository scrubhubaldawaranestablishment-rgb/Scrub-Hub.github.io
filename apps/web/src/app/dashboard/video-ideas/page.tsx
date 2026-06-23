"use client";

import { useState } from "react";
import { generateVideoIdeas } from "@/lib/ai";
import { generateAI, useSettingsStore } from "@/lib/api-client";
import { useAppStore } from "@/lib/store";
import { v4 as uuid } from "uuid";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Lightbulb, ArrowRight } from "lucide-react";

export default function VideoIdeasPage() {
  const [niche, setNiche] = useState("Fitness");
  const [loading, setLoading] = useState(false);
  const { openaiApiKey } = useSettingsStore();
  const { videoIdeas, addVideoIdeas } = useAppStore();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      if (openaiApiKey) {
        const content = await generateAI(
          `Generate 5 scored YouTube video ideas for the "${niche}" niche. Return JSON array only: [{"title":"...","hook":"...","score":85}]`,
          "ideas",
          openaiApiKey
        );
        const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, "").trim());
        const ideas = (Array.isArray(parsed) ? parsed : []).map((item: { title: string; hook: string; score: number }) => ({
          id: uuid(),
          title: item.title,
          hook: item.hook,
          score: item.score,
          niche,
          createdAt: new Date().toISOString(),
        }));
        if (ideas.length > 0) addVideoIdeas(ideas);
        else addVideoIdeas(generateVideoIdeas(niche, 5));
      } else {
        await new Promise((r) => setTimeout(r, 800));
        addVideoIdeas(generateVideoIdeas(niche, 5));
      }
    } catch {
      addVideoIdeas(generateVideoIdeas(niche, 5));
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "from-green-500 to-emerald-600";
    if (score >= 70) return "from-indigo-500 to-violet-600";
    return "from-amber-500 to-orange-600";
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">💡 Video Ideas</h1>
        <p className="text-slate-500 mt-1">Generate scored, ready-to-make video ideas tailored to your niche.</p>
      </div>

      <div className="bg-white rounded-2xl border p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your niche (e.g. Fitness, Finance, History)"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !niche.trim()}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Lightbulb className="w-5 h-5" />
            {loading ? "Generating..." : "Generate Ideas"}
          </button>
        </div>
      </div>

      {videoIdeas.length > 0 ? (
        <div className="space-y-4">
          {videoIdeas.map((idea) => (
            <div key={idea.id} className="bg-white rounded-2xl border p-6 flex items-center gap-4">
              <div className={cn("w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-xl shrink-0", getScoreColor(idea.score))}>
                {idea.score}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg">{idea.title}</h3>
                <p className="text-sm text-slate-500 mt-1">Hook: &ldquo;{idea.hook}&rdquo;</p>
                <p className="text-xs text-slate-400 mt-1">{idea.niche} · Score based on title length, keywords, and search potential</p>
              </div>
              <Link
                href={`/dashboard/script-writer?title=${encodeURIComponent(idea.title)}&niche=${encodeURIComponent(idea.niche)}`}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 flex items-center gap-1 shrink-0"
              >
                Script <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Enter your niche and generate video ideas</p>
        </div>
      )}
    </div>
  );
}
