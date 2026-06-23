"use client";

import { useState } from "react";
import { useSettingsStore } from "@/lib/api-client";
import { Key, Check, ExternalLink } from "lucide-react";

export default function SettingsPage() {
  const { youtubeApiKey, openaiApiKey, setYoutubeApiKey, setOpenaiApiKey } = useSettingsStore();
  const [ytKey, setYtKey] = useState(youtubeApiKey);
  const [aiKey, setAiKey] = useState(openaiApiKey);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setYoutubeApiKey(ytKey.trim());
    setOpenaiApiKey(aiKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">⚙️ Settings</h1>
        <p className="text-slate-500 mt-1">Configure API keys for full functionality. Keys are stored locally in your browser.</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div className="bg-white rounded-2xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-red-500" />
            <h2 className="font-bold text-lg">YouTube Data API Key</h2>
            {youtubeApiKey && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Active</span>}
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Required for channel analytics, video lists, outlier scores, and subscriber counts.
            Video URLs work without a key (limited data).
          </p>
          <input
            type="password"
            value={ytKey}
            onChange={(e) => setYtKey(e.target.value)}
            placeholder="AIza..."
            className="w-full px-4 py-3 border rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
          />
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:underline inline-flex items-center gap-1"
          >
            Get free API key from Google Cloud Console <ExternalLink className="w-3 h-3" />
          </a>
          <p className="text-xs text-slate-400 mt-2">Enable &ldquo;YouTube Data API v3&rdquo; in your Google Cloud project. Free tier: 10,000 units/day.</p>
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-indigo-500" />
            <h2 className="font-bold text-lg">OpenAI API Key</h2>
            {openaiApiKey && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Active</span>}
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Powers AI Script Writer, Video Ideas, Branding AI, and AI Coach with GPT-4o-mini.
            Without a key, tools use built-in templates.
          </p>
          <input
            type="password"
            value={aiKey}
            onChange={(e) => setAiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-4 py-3 border rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
          />
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:underline inline-flex items-center gap-1"
          >
            Get API key from OpenAI <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 flex items-center gap-2"
        >
          {saved ? <><Check className="w-5 h-5" /> Saved!</> : "Save API Keys"}
        </button>
      </div>
    </div>
  );
}
