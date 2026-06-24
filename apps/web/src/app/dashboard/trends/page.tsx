"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { api, type TrendResearch } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Search, Loader2, Sparkles, AlertCircle } from "lucide-react";

export default function TrendsPage() {
  const { activeChannel } = useAppStore();
  const [query, setQuery] = useState("");
  const [trends, setTrends] = useState<TrendResearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [latest, setLatest] = useState<TrendResearch | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeChannel) {
      api.getTrends(activeChannel.id).then(setTrends).catch(() => {});
    }
  }, [activeChannel]);

  async function handleResearch() {
    if (!activeChannel) return;
    setLoading(true);
    setError(null);
    try {
      const result = await api.researchTrends(activeChannel.id, query || undefined);
      setLatest(result);
      setTrends((prev) => [result, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Research failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!activeChannel) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center gap-3 text-slate-500">
          <AlertCircle className="w-5 h-5" />
          Select or create a channel first from the Setup page.
        </CardContent>
      </Card>
    );
  }

  const display = latest || trends[0];
  const isDemoSummary = display?.summary?.includes("OPENAI_API_KEY");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="w-8 h-8 text-indigo-600" />
          AI Trend Research
        </h1>
        <p className="text-slate-500 mt-1">Discover viral topics for US Shorts & TikTok viewers</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex gap-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleResearch()}
              placeholder="Optional: focus area (e.g., 'morning routines')"
              className="flex-1"
              disabled={loading}
            />
            <Button onClick={handleResearch} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span className="ml-2">{loading ? "Researching..." : "Research Trends"}</span>
            </Button>
          </div>
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {loading && !display && (
        <Card>
          <CardContent className="pt-6 flex items-center gap-3 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            Scanning viral trends for {activeChannel.niche}...
          </CardContent>
        </Card>
      )}

      {display && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>Summary</CardTitle>
                {isDemoSummary ? (
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="w-3 h-3" />
                    Live demo data
                  </Badge>
                ) : (
                  <Badge variant="success" className="gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI powered
                  </Badge>
                )}
              </div>
              <CardDescription>Latest research for {activeChannel.niche}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700">{display.summary}</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {display.trends?.map((trend, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold">{trend.topic}</h3>
                    <Badge variant={trend.virality > 80 ? "success" : "default"}>
                      {trend.virality}% viral
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 mb-3">{trend.reason}</p>
                  <div className="flex flex-wrap gap-1">
                    {trend.hashtags?.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {display.recommendations && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(Array.isArray(display.recommendations) ? display.recommendations : []).map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-indigo-600 font-bold">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
