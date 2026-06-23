"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";

const STEPS = [
  { title: "Channel Name", description: "What is your channel called?" },
  { title: "Niche & Audience", description: "Define your content focus" },
  { title: "Tone & Style", description: "How should your content feel?" },
  { title: "Platforms", description: "Where will you publish?" },
  { title: "Posting Schedule", description: "How often will you post?" },
];

export default function SetupWizardPage() {
  const router = useRouter();
  const { channels, loadChannels, setActiveChannel } = useAppStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [channelId, setChannelId] = useState<string | null>(channels[0]?.id || null);
  const [form, setForm] = useState({
    name: "",
    niche: "",
    targetAudience: "United States",
    tone: "engaging",
    platforms: ["YOUTUBE", "TIKTOK"] as string[],
    postingFrequency: "daily",
  });

  const progress = ((step + 1) / STEPS.length) * 100;

  async function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    try {
      let id = channelId;
      if (!id) {
        const channel = await api.createChannel(form);
        id = channel.id;
        setChannelId(id);
      } else {
        await api.updateChannel(id, { ...form, wizardComplete: true });
        await api.updateWizardStep(id, 5);
      }
      await loadChannels();
      const updated = await api.getChannel(id);
      setActiveChannel(updated);
      router.push("/dashboard");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Setup failed");
    } finally {
      setLoading(false);
    }
  }

  async function saveProgress() {
    if (!channelId && step === 0 && form.name && form.niche) {
      const channel = await api.createChannel({ name: form.name, niche: form.niche });
      setChannelId(channel.id);
      await api.updateWizardStep(channel.id, step + 1);
    } else if (channelId) {
      await api.updateChannel(channelId, form);
      await api.updateWizardStep(channelId, step + 1);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Channel Setup</h1>
        <p className="text-slate-500 mt-1">Step {step + 1} of {STEPS.length}: {STEPS[step].title}</p>
        <Progress value={progress} className="mt-4" />
      </div>

      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s.title}
            className={`flex-1 h-1 rounded-full ${i <= step ? "bg-indigo-600" : "bg-slate-200"}`}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step].title}</CardTitle>
          <CardDescription>{STEPS[step].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <div className="space-y-2">
              <Label>Channel Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="MindShift Shorts"
              />
            </div>
          )}

          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>Niche</Label>
                <Input
                  value={form.niche}
                  onChange={(e) => setForm({ ...form, niche: e.target.value })}
                  placeholder="Psychology & Self-Improvement"
                />
              </div>
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Input
                  value={form.targetAudience}
                  onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <Label>Content Tone</Label>
              <select
                className="w-full rounded-lg border px-3 py-2"
                value={form.tone}
                onChange={(e) => setForm({ ...form, tone: e.target.value })}
              >
                <option value="engaging">Engaging & Energetic</option>
                <option value="educational">Educational & Authoritative</option>
                <option value="controversial">Controversial & Bold</option>
                <option value="storytelling">Storytelling & Emotional</option>
              </select>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              {["YOUTUBE", "TIKTOK"].map((platform) => (
                <label key={platform} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={form.platforms.includes(platform)}
                    onChange={(e) => {
                      const platforms = e.target.checked
                        ? [...form.platforms, platform]
                        : form.platforms.filter((p) => p !== platform);
                      setForm({ ...form, platforms });
                    }}
                  />
                  <span className="font-medium">{platform === "YOUTUBE" ? "YouTube Shorts" : "TikTok"}</span>
                </label>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-2">
              <Label>Posting Frequency</Label>
              <select
                className="w-full rounded-lg border px-3 py-2"
                value={form.postingFrequency}
                onChange={(e) => setForm({ ...form, postingFrequency: e.target.value })}
              >
                <option value="daily">Daily (1 post/day)</option>
                <option value="twice-daily">Twice Daily</option>
                <option value="weekdays">Weekdays Only</option>
                <option value="three-per-week">3x per Week</option>
              </select>
              <div className="mt-4 p-4 rounded-lg bg-green-50 text-green-800 text-sm">
                <Check className="w-4 h-4 inline mr-1" />
                Your channel will target {form.targetAudience} viewers on {form.platforms.join(" & ")}.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
          Back
        </Button>
        <Button
          onClick={async () => {
            await saveProgress();
            await handleNext();
          }}
          disabled={loading || (step === 0 && !form.name) || (step === 1 && !form.niche)}
        >
          {loading ? "Saving..." : step === STEPS.length - 1 ? "Launch Channel" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
