"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { api, type ContentItem } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Loader2, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function CalendarPage() {
  const { activeChannel } = useAppStore();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (activeChannel) {
      api.getContent(activeChannel.id).then(setContent).catch(() => {});
    }
  }, [activeChannel]);

  async function handleGenerate() {
    if (!activeChannel) return;
    setGenerating(true);
    try {
      const result = await api.generateCalendar(activeChannel.id, 30);
      const items = (result as { contentItems: ContentItem[] }).contentItems;
      setContent(items);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
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
            <Calendar className="w-8 h-8 text-indigo-600" />
            30-Day Content Calendar
          </h1>
          <p className="text-slate-500 mt-1">AI-generated content plan for {activeChannel.name}</p>
        </div>
        <Button onClick={handleGenerate} disabled={generating}>
          {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
          {generating ? "Generating..." : "Generate Calendar"}
        </Button>
      </div>

      {content.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">No calendar yet. Generate 30 days of content ideas.</p>
            <Button onClick={handleGenerate} disabled={generating}>
              Generate 30-Day Calendar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {content.map((item, i) => (
            <Card key={item.id} className="hover:border-indigo-200 transition-colors">
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-slate-500">{item.topic}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {item.scheduledFor && (
                    <span className="text-xs text-slate-500">{formatDate(item.scheduledFor)}</span>
                  )}
                  <Badge variant={item.status === "READY" ? "success" : "secondary"}>{item.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
