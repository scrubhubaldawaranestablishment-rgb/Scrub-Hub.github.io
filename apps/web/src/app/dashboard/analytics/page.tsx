"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, RefreshCw } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  const { activeChannel } = useAppStore();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (activeChannel) {
      api.getAnalytics(activeChannel.id).then(setData).catch(() => {});
    }
  }, [activeChannel]);

  async function loadAnalytics() {
    if (!activeChannel) return;
    const result = await api.getAnalytics(activeChannel.id);
    setData(result);
  }

  async function handleSync() {
    if (!activeChannel) return;
    setSyncing(true);
    try {
      await api.syncAnalytics(activeChannel.id);
      await loadAnalytics();
    } finally {
      setSyncing(false);
    }
  }

  if (!activeChannel) {
    return <p className="text-slate-500">Select or create a channel first.</p>;
  }

  const platforms = data?.platforms as Record<string, Record<string, number>> | undefined;
  const snapshots = (data?.snapshots as Array<Record<string, unknown>>) || [];

  const chartData = snapshots.slice(0, 14).reverse().map((s) => ({
    date: new Date(s.date as string).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    views: s.views as number,
    likes: s.likes as number,
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-indigo-600" />
            Analytics Dashboard
          </h1>
          <p className="text-slate-500 mt-1">Track performance across platforms</p>
        </div>
        <Button variant="outline" onClick={handleSync} disabled={syncing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
          Sync Data
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {platforms &&
          Object.entries(platforms).flatMap(([platform, stats]) => [
            { label: `${platform} Views`, value: stats.views || 0 },
            { label: `${platform} Followers`, value: stats.subscribers || stats.followers || 0 },
          ]).map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{formatNumber(stat.value)}</p>
              </CardContent>
            </Card>
          ))}
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Views Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Content Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {((data?.recentContent as Array<Record<string, unknown>>) || []).map((item) => (
              <div key={item.id as string} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <span className="font-medium text-sm">{item.title as string}</span>
                <span className="text-xs text-slate-500">{item.status as string}</span>
              </div>
            ))}
            {!(data?.recentContent as unknown[])?.length && (
              <p className="text-sm text-slate-500">No published content yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
