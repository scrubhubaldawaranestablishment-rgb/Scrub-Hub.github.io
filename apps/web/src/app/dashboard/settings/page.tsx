"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Star } from "lucide-react";

export default function SettingsPage() {
  const { user, activeChannel } = useAppStore();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  async function submitFeedback() {
    try {
      await api.submitFeedback({ rating, comment });
      setFeedbackSent(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit feedback");
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8 text-indigo-600" />
          Settings
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Email</Label>
            <p className="text-sm mt-1">{user?.email}</p>
          </div>
          <div>
            <Label>Name</Label>
            <p className="text-sm mt-1">{user?.name || "—"}</p>
          </div>
          <div>
            <Label>Role</Label>
            <p className="text-sm mt-1">{user?.role}</p>
          </div>
        </CardContent>
      </Card>

      {activeChannel && (
        <Card>
          <CardHeader>
            <CardTitle>Active Channel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Channel Name</Label>
              <p className="text-sm mt-1">{activeChannel.name}</p>
            </div>
            <div>
              <Label>Niche</Label>
              <p className="text-sm mt-1">{activeChannel.niche}</p>
            </div>
            <div>
              <Label>Target Audience</Label>
              <p className="text-sm mt-1">{activeChannel.targetAudience}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            AI Feedback Loop
          </CardTitle>
          <CardDescription>Help improve content generation quality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {feedbackSent ? (
            <p className="text-green-600 text-sm">Thank you! Your feedback will improve future content.</p>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Rating (1-5)</Label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Comments</Label>
                <textarea
                  className="w-full rounded-lg border px-3 py-2 text-sm min-h-[100px]"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What could be improved about the generated content?"
                />
              </div>
              <Button onClick={submitFeedback}>Submit Feedback</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
