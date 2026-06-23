"use client";

import { useState } from "react";
import { v4 as uuid } from "uuid";
import type { VideoScene } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Play, Plus, Film, Trash2 } from "lucide-react";

export default function VideoEditorPage() {
  const [title, setTitle] = useState("My Video Project");
  const [scenes, setScenes] = useState<VideoScene[]>([
    { id: uuid(), title: "Hook", narration: "What if everything you knew was wrong?", duration: 5, style: "animated" },
    { id: uuid(), title: "Introduction", narration: "Welcome back to the channel...", duration: 15, style: "animated" },
    { id: uuid(), title: "Main Point", narration: "Here's the key insight most people miss...", duration: 30, style: "real-life" },
    { id: uuid(), title: "Call to Action", narration: "If this helped, hit subscribe!", duration: 10, style: "animated" },
  ]);
  const [activeScene, setActiveScene] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const { addVideoProject } = useAppStore();

  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);

  const addScene = () => {
    setScenes([...scenes, { id: uuid(), title: `Scene ${scenes.length + 1}`, narration: "", duration: 10, style: "animated" }]);
  };

  const updateScene = (id: string, updates: Partial<VideoScene>) => {
    setScenes(scenes.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteScene = (id: string) => {
    setScenes(scenes.filter((s) => s.id !== id));
    if (activeScene >= scenes.length - 1) setActiveScene(Math.max(0, scenes.length - 2));
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
      addVideoProject({ id: uuid(), title, scenes, createdAt: new Date().toISOString() });
    }, 3000);
  };

  const current = scenes[activeScene];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">🎬 AI Video Editor</h1>
        <p className="text-slate-500 mt-1">Turn narration into fully generated video — scene-by-scene AI imagery and timeline editor.</p>
      </div>

      <div className="bg-white rounded-2xl border p-4 mb-6 flex items-center gap-4">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 px-4 py-2 border rounded-xl font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <span className="text-sm text-slate-500">{scenes.length} scenes · {totalDuration}s total</span>
        <button onClick={handleGenerate} disabled={generating} className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold disabled:opacity-50">
          {generating ? "Generating video..." : "🎬 Generate Video"}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden">
            {generated ? (
              <div className="text-center text-white">
                <Film className="w-16 h-16 mx-auto mb-4 text-indigo-400" />
                <p className="text-xl font-bold">{current?.title}</p>
                <p className="text-slate-400 mt-2">{current?.narration}</p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Play className="w-8 h-8" />
                  <span className="text-sm">Scene {activeScene + 1} of {scenes.length}</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500">
                <Play className="w-16 h-16 mx-auto mb-4" />
                <p>Preview will appear after generation</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border p-4">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-bold">Timeline</h3>
              <button onClick={addScene} className="ml-auto px-3 py-1 bg-slate-100 rounded-lg text-sm hover:bg-slate-200 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Scene</button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {scenes.map((scene, i) => (
                <button
                  key={scene.id}
                  onClick={() => setActiveScene(i)}
                  className={cn(
                    "min-w-[140px] p-3 rounded-xl text-left text-sm transition-all shrink-0",
                    i === activeScene ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  )}
                >
                  <p className="font-semibold">{scene.title}</p>
                  <p className="text-xs opacity-70">{scene.duration}s · {scene.style}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6">
          {current && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Scene Editor</h3>
                <button onClick={() => deleteScene(current.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
              <label className="text-sm text-slate-500 mb-1 block">Title</label>
              <input value={current.title} onChange={(e) => updateScene(current.id, { title: e.target.value })} className="w-full px-3 py-2 border rounded-lg mb-3 text-sm" />
              <label className="text-sm text-slate-500 mb-1 block">Narration</label>
              <textarea value={current.narration} onChange={(e) => updateScene(current.id, { narration: e.target.value })} className="w-full px-3 py-2 border rounded-lg mb-3 text-sm h-24" />
              <label className="text-sm text-slate-500 mb-1 block">Duration (seconds)</label>
              <input type="number" value={current.duration} onChange={(e) => updateScene(current.id, { duration: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg mb-3 text-sm" />
              <label className="text-sm text-slate-500 mb-1 block">Style</label>
              <select value={current.style} onChange={(e) => updateScene(current.id, { style: e.target.value as "animated" | "real-life" })} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="animated">Animated ($4/min)</option>
                <option value="real-life">Real-life ($2/min)</option>
              </select>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
