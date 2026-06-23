"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, FileText, Clock, ArrowRight, Plus } from "lucide-react";

export default function DashboardPage() {
  const { activeChannel, channels } = useAppStore();
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (activeChannel) {
      api.getAnalytics(activeChannel.id).then(setAnalytics).catch(() => {});
    }
  }, [activeChannel]);

  if (!channels.length) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Welcome to CreatorPilot AI</h1>
        <p className="text-slate-500 mb-8">Set up your first channel to get started.</p>
        <Button asChild size="lg">
          <Link href="/dashboard/setup">
            <Plus className="w-4 h-4 mr-2" />
            Create your channel
          </Link>
        </Button>
      </div>
    );
  }

  const contentStats = (analytics?.contentStats as Record<string, number>) || {};
  const platforms = analytics?.platforms as Record<string, Record<string, number>> | undefined;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{activeChannel?.name}</h1>
          <p className="text-slate-500">{activeChannel?.niche} · Targeting {activeChannel?.targetAudience}</p>
        </div>
        {!activeChannel?.wizardComplete && (
          <Button asChild>
            <Link href="/dashboard/setup">Complete setup</Link>
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Draft", value: contentStats.DRAFT || 0, color: "secondary" },
          { label: "Ready", value: contentStats.READY || 0, color: "success" },
          { label: "Scheduled", value: contentStats.SCHEDULED || 0, color: "warning" },
          { label: "Published", value: contentStats.PUBLISHED || 0, color: "default" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-3xl font-bold mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Platform Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {platforms ? (
              Object.entries(platforms).map(([platform, data]) => (
                <div key={platform} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <span className="font-medium">{platform}</span>
                  <div className="text-right text-sm">
                    <p>{(data.views || 0).toLocaleString()} views</p>
                    <p className="text-slate-500">{(data.subscribers || data.followers || 0).toLocaleString()} followers</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm">Connect platforms to see analytics</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump into your content workflow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { href: "/dashboard/trends", icon: TrendingUp, label: "Research trends" },
              { href: "/dashboard/calendar", icon: Calendar, label: "Generate 30-day calendar" },
              { href: "/dashboard/content", icon: FileText, label: "View content pipeline" },
              { href: "/dashboard/schedule", icon: Clock, label: "Manage schedule" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <action.icon className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-medium">{action.label}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Channel Status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant={activeChannel?.wizardComplete ? "success" : "warning"}>
            Setup {activeChannel?.wizardComplete ? "Complete" : "Incomplete"}
          </Badge>
          {activeChannel?.platforms?.map((p) => (
            <Badge key={p} variant="secondary">{p}</Badge>
          ))}
          <Badge variant="secondary">{activeChannel?.postingFrequency} posting</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
