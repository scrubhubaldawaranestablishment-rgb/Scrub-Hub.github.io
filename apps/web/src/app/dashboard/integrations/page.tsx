"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link2, ExternalLink, Info } from "lucide-react";

export default function IntegrationsPage() {
  const { activeChannel, setActiveChannel } = useAppStore();
  const [connections, setConnections] = useState<Array<{ platform: string; connected: boolean }>>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "info"; text: string } | null>(null);

  useEffect(() => {
    if (activeChannel?.platformConnections) {
      setConnections(activeChannel.platformConnections);
    } else if (activeChannel) {
      api.getChannel(activeChannel.id).then((ch) => {
        setConnections(ch.platformConnections || []);
      });
    }
  }, [activeChannel]);

  async function refreshChannel() {
    if (!activeChannel) return;
    const ch = await api.getChannel(activeChannel.id);
    setConnections(ch.platformConnections || []);
    setActiveChannel(ch);
  }

  async function connect(platform: string) {
    if (!activeChannel) return;
    setConnecting(platform);
    setMessage(null);

    try {
      const { url, configured } = await api.getIntegrationAuth(platform.toLowerCase(), activeChannel.id);

      if (configured && url) {
        window.open(url, "_blank");
        setMessage({
          type: "info",
          text: `Complete sign-in in the new tab. When finished, refresh this page to see your ${platform} connection.`,
        });
      } else {
        await api.demoConnectIntegration(platform.toLowerCase(), activeChannel.id);
        await refreshChannel();
        setMessage({
          type: "success",
          text: `${platform === "youtube" ? "YouTube Shorts" : "TikTok"} connected in demo mode. Publishing and analytics will be simulated until OAuth credentials are configured on the server.`,
        });
      }
    } catch (err) {
      setMessage({
        type: "info",
        text: err instanceof Error ? err.message : "Connection failed",
      });
    } finally {
      setConnecting(null);
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

      {message && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-blue-200 bg-blue-50 text-blue-800"
          }`}
        >
          {message.text}
        </div>
      )}

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
                  disabled={connecting === platform.id}
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {connecting === platform.id
                    ? "Connecting..."
                    : `${connected ? "Reconnect" : "Connect"} ${platform.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Production OAuth setup
          </CardTitle>
          <CardDescription>
            OAuth is not configured on the API yet. Connections work in demo mode. To enable real
            YouTube/TikTok sign-in, add these variables to your Railway API service:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm font-mono">
            {[
              { key: "YOUTUBE_CLIENT_ID", note: "Google Cloud OAuth client ID" },
              { key: "YOUTUBE_CLIENT_SECRET", note: "Google Cloud OAuth secret" },
              {
                key: "YOUTUBE_REDIRECT_URI",
                note: "https://scrub-hubgithubio-production.up.railway.app/api/integrations/youtube/callback",
              },
              { key: "YOUTUBE_API_KEY", note: "Optional — live channel analytics" },
              { key: "TIKTOK_CLIENT_KEY", note: "TikTok developer app key" },
              { key: "TIKTOK_CLIENT_SECRET", note: "TikTok developer app secret" },
              {
                key: "TIKTOK_REDIRECT_URI",
                note: "https://scrub-hubgithubio-production.up.railway.app/api/integrations/tiktok/callback",
              },
            ].map(({ key, note }) => (
              <div key={key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 p-2 rounded bg-slate-50">
                <span>{key}</span>
                <span className="text-xs text-slate-500 font-sans">{note}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
