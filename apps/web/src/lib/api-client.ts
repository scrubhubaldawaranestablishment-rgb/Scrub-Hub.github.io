"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  youtubeApiKey: string;
  openaiApiKey: string;
  setYoutubeApiKey: (key: string) => void;
  setOpenaiApiKey: (key: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      youtubeApiKey: "",
      openaiApiKey: "",
      setYoutubeApiKey: (key) => set({ youtubeApiKey: key }),
      setOpenaiApiKey: (key) => set({ openaiApiKey: key }),
    }),
    { name: "videdge-settings" }
  )
);

export async function analyzeYouTube(url: string, apiKey?: string) {
  const res = await fetch("/api/youtube/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, apiKey }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Analysis failed");
  return data;
}

export async function generateAI(prompt: string, type: string, apiKey?: string) {
  const res = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, type, apiKey }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "AI generation failed");
  return data.content as string;
}
