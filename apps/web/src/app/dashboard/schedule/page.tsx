"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { api, type ScheduledPost, type ContentItem } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Plus } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function SchedulePage() {
  const { activeChannel } = useAppStore();
  const [schedule, setSchedule] = useState<ScheduledPost[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    contentItemId: "",
    platform: "YOUTUBE",
    scheduledAt: "",
  });

  useEffect(() => {
    if (activeChannel) {
      api.getSchedule(activeChannel.id).then(setSchedule).catch(() => {});
      api.getContent(activeChannel.id).then(setContent).catch(() => {});
    }
  }, [activeChannel]);

  async function handleSchedule() {
    if (!activeChannel || !form.contentItemId || !form.scheduledAt) return;
    try {
      await api.schedulePost(activeChannel.id, form);
      const updated = await api.getSchedule(activeChannel.id);
      setSchedule(updated);
      setShowForm(false);
      setForm({ contentItemId: "", platform: "YOUTUBE", scheduledAt: "" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Scheduling failed");
    }
  }

  const statusVariant: Record<string, string> = {
    PENDING: "warning",
    PUBLISHED: "success",
    FAILED: "destructive",
    PROCESSING: "default",
    CANCELLED: "secondary",
  };

  if (!activeChannel) {
    return <p className="text-slate-500">Select or create a channel first.</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Clock className="w-8 h-8 text-indigo-600" />
            Content Scheduling
          </h1>
          <p className="text-slate-500 mt-1">Queue posts for YouTube Shorts and TikTok</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Schedule Post
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Content</Label>
              <select
                className="w-full rounded-lg border px-3 py-2"
                value={form.contentItemId}
                onChange={(e) => setForm({ ...form, contentItemId: e.target.value })}
              >
                <option value="">Select content...</option>
                {content.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Platform</Label>
              <select
                className="w-full rounded-lg border px-3 py-2"
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
              >
                <option value="YOUTUBE">YouTube Shorts</option>
                <option value="TIKTOK">TikTok</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Schedule Time (EST)</Label>
              <Input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              />
            </div>
            <Button onClick={handleSchedule}>Schedule</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {schedule.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              No scheduled posts yet. Schedule your first post above.
            </CardContent>
          </Card>
        ) : (
          schedule.map((post) => (
            <Card key={post.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{post.contentItem?.title || "Untitled"}</h3>
                  <p className="text-sm text-slate-500">{formatDateTime(post.scheduledAt)} · {post.platform}</p>
                </div>
                <Badge variant={statusVariant[post.status] || "secondary"}>{post.status}</Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
