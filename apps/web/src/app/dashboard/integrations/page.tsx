"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link2, ExternalLink } from "lucide-react";

export default function IntegrationsPage() {
  const { activeChannel } = useAppStore();
  const [connections, setConnections] = useState<Array<{ platform: string; connected: boolean }>>([]);

  useEffect(() => {
    if (activeChannel?.platformConnections) {
      setConnections(activeChannel.platformConnections);
    } else if (activeChannel) {
      api.getChannel(activeChannel.id).then((ch) => {
        setConnections(ch.platformConnections || []);
      });
    }
  }, [activeChannel]);

  async function connect(platform: string) {
    if (!activeChannel) return;
    try {
      const { url } = await api.getIntegrationAuth(platform.toLowerCase(), activeChannel.id);
      if (url && !url.includes("undefined")) {
        window.open(url, "_blank");
      } else {
        alert(`Configure ${platform}_CLIENT_ID in environment variables for OAuth. Demo mode: connection simulated on callback.`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Connection failed");
    }
  }

  if (!activeChannel) {
    return <p className="text-slate-500">Select or create a channel first.</p>;
  }

  const platforms = [
    {
      id: "youtube",
      name: "YouTube Shorts",
      description: "Upload Shorts and pull channel analytics via YouTube Data API v3.",
      color: "bg-red-100 text-red-700",
    },
    {
      id: "tiktok",
      name: "TikTok",
      description: "Publish videos and track performance via TikTok Content Posting API.",
      color: "bg-slate-900 text-white",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Link2 className="w-8 h-8 text-indigo-600" />
          Platform Integrations
        </h1>
        <p className="text-slate-500 mt-1">Connect YouTube and TikTok to auto-publish content</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {platforms.map((platform) => {
          const conn = connections.find(
            (c) => c.platform.toLowerCase() === platform.id,
          );
          const connected = conn?.connected;

          return (
            <Card key={platform.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{platform.name}</CardTitle>
                  <Badge variant={connected ? "success" : "secondary"}>
                    {connected ? "Connected" : "Not connected"}
                  </Badge>
                </div>
                <CardDescription>{platform.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant={connected ? "outline" : "default"}
                  onClick={() => connect(platform.id)}
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {connected ? "Reconnect" : "Connect"} {platform.name}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>Required environment variables for production</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm font-mono">
            {[
              "YOUTUBE_API_KEY",
              "YOUTUBE_CLIENT_ID",
              "YOUTUBE_CLIENT_SECRET",
              "TIKTOK_CLIENT_KEY",
              "TIKTOK_CLIENT_SECRET",
              "GEMINI_API_KEY",
              "GEMINI_MODEL",
            ].map((key) => (
              <div key={key} className="flex items-center justify-between p-2 rounded bg-slate-50">
                <span>{key}</span>
                <Badge variant="secondary">Required</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
