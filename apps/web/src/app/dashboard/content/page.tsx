"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { api, type ContentItem } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Loader2, Wand2 } from "lucide-react";

const ASSET_TYPES = [
  { type: "HOOK", label: "Hooks" },
  { type: "SCRIPT", label: "Scripts" },
  { type: "CTA", label: "CTAs" },
  { type: "DESCRIPTION", label: "Descriptions" },
  { type: "THUMBNAIL_PROMPT", label: "Thumbnail Prompts" },
  { type: "VIDEO_PROMPT", label: "Video Prompts" },
];

export default function ContentPage() {
  const { activeChannel } = useAppStore();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    if (activeChannel) {
      api.getContent(activeChannel.id).then((items) => {
        setContent(items);
        if (items.length && !selected) setSelected(items[0]);
      }).catch(() => {});
    }
  }, [activeChannel, selected]);

  async function generateAsset(type: string) {
    if (!selected) return;
    setGenerating(type);
    try {
      await api.generateAsset(selected.id, type);
      const updated = await api.getContentItem(selected.id);
      setSelected(updated);
      setContent((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(null);
    }
  }

  async function generateAll() {
    if (!selected) return;
    setGenerating("ALL");
    try {
      await api.generateAllAssets(selected.id);
      const updated = await api.getContentItem(selected.id);
      setSelected(updated);
      setContent((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(null);
    }
  }

  if (!activeChannel) {
    return <p className="text-slate-500">Select or create a channel first.</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8 text-indigo-600" />
            Content Pipeline
          </h1>
          <p className="text-slate-500 mt-1">Generate hooks, scripts, CTAs, and more</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/calendar">View Calendar</Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Content Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
            {content.length === 0 ? (
              <p className="text-sm text-slate-500">Generate a calendar first.</p>
            ) : (
              content.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selected?.id === item.id ? "border-indigo-600 bg-indigo-50" : "hover:bg-slate-50"
                  }`}
                >
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  <Badge variant="secondary" className="mt-1">{item.status}</Badge>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          {selected ? (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selected.title}</CardTitle>
                  <Button onClick={generateAll} disabled={generating === "ALL"}>
                    {generating === "ALL" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
                    Generate All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="HOOK">
                  <TabsList className="flex-wrap h-auto">
                    {ASSET_TYPES.map((a) => (
                      <TabsTrigger key={a.type} value={a.type}>{a.label}</TabsTrigger>
                    ))}
                  </TabsList>
                  {ASSET_TYPES.map((a) => {
                    const asset = selected.generatedAssets?.find((ga) => ga.type === a.type);
                    return (
                      <TabsContent key={a.type} value={a.type} className="space-y-4">
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateAsset(a.type)}
                            disabled={generating === a.type}
                          >
                            {generating === a.type ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate"}
                          </Button>
                        </div>
                        {asset ? (
                          <pre className="p-4 rounded-lg bg-slate-50 text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                            {JSON.stringify(JSON.parse(asset.content), null, 2)}
                          </pre>
                        ) : (
                          <p className="text-sm text-slate-500 py-8 text-center">Not generated yet</p>
                        )}
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </CardContent>
            </>
          ) : (
            <CardContent className="py-12 text-center text-slate-500">
              Select a content item to view and generate assets
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
