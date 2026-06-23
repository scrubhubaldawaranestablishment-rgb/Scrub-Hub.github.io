"use client";

import { useState } from "react";
import { TOOLS, SAMPLE_VIDEOS } from "@/lib/data";
import { cn } from "@/lib/utils";

export function ToolShowcase() {
  const [active, setActive] = useState("thumbnail-studio");
  const activeTool = TOOLS.find((t) => t.id === active);

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">See every tool in action</h2>
        <p className="text-lg text-slate-500 max-w-3xl mx-auto mb-10">
          Scripts, thumbnails, the AI editor, branding, your production board, video ideas, niche research,
          monetization, and the Chrome extension — the actual tools you get inside.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActive(tool.id)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-sm font-medium transition-all border",
                active === tool.id
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
              )}
            >
              {tool.emoji} {tool.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden text-left">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-slate-400 ml-2">videdge.ai/{activeTool?.id}</span>
          </div>

          <div className="p-6">
            {active === "extension" && <ExtensionPreview />}
            {active === "niche-finder" && <NicheFinderPreview />}
            {active === "branding" && <BrandingPreview />}
            {active === "video-ideas" && <VideoIdeasPreview />}
            {active === "thumbnail-studio" && <ThumbnailPreview />}
            {active === "script-writer" && <ScriptPreview />}
            {active === "voiceover" && <VoiceoverPreview />}
            {active === "video-editor" && <VideoEditorPreview />}
            {active === "production-board" && <BoardPreview />}
            {active === "monetize" && <MonetizePreview />}
            {active === "ai-coach" && <CoachPreview />}
          </div>
        </div>
      </div>
    </section>
  );
}

function ExtensionPreview() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500" />
        <div>
          <h3 className="font-bold text-xl">Bro Pump</h3>
          <p className="text-slate-500 text-sm">@BropumpYT · 223K subscribers · 25 videos</p>
        </div>
        <div className="ml-auto flex gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">💰 Monetized</span>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">⭐ Save Channel</span>
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        {["Videos", "Shorts", "Posts", "🔍"].map((tab) => (
          <span key={tab} className="px-3 py-1 bg-slate-100 rounded-lg text-sm">{tab}</span>
        ))}
        <span className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm ml-auto">📊 Analytics</span>
      </div>
      <div className="grid gap-3">
        {SAMPLE_VIDEOS.slice(0, 4).map((v) => (
          <div key={v.title} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
            <div className="w-24 h-14 bg-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-500">{v.duration}</div>
            <div className="flex-1">
              <p className="font-medium text-sm">{v.title}</p>
              <p className="text-xs text-slate-500">{v.views} views · {v.age}</p>
            </div>
            <span className={cn("px-2 py-1 rounded text-xs font-bold", v.outlier >= 3 ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600")}>
              {v.outlier}x
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NicheFinderPreview() {
  const channels = [
    { name: "History Unveiled", niche: "History", subs: "412K", score: 2.8 },
    { name: "Money Mindset", niche: "Finance", subs: "890K", score: 4.1 },
    { name: "Dark Mysteries", niche: "True Crime", subs: "567K", score: 3.5 },
  ];
  return (
    <div>
      <input className="w-full px-4 py-3 border rounded-xl mb-4" placeholder="Search niches or channels..." readOnly value="faceless history" />
      <div className="grid gap-3">
        {channels.map((c) => (
          <div key={c.name} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">📺</div>
            <div className="flex-1">
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-slate-500">{c.niche} · {c.subs} subs</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">{c.score}x outlier</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BrandingPreview() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="p-4 bg-indigo-50 rounded-xl">
          <p className="text-sm"><strong>You:</strong> Create branding for my fitness channel called &quot;Bro Pump&quot;</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl">
          <p className="text-sm"><strong>AI:</strong> I&apos;ve generated a bold fitness brand with indigo/violet gradients. Your profile picture features a stylized dumbbell icon, and the banner includes your channel name with a motivational tagline.</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 mx-auto" />
        <div className="h-20 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold">Bro Pump</div>
      </div>
    </div>
  );
}

function VideoIdeasPreview() {
  const ideas = [
    { title: "5 Boring Habits That Quietly Kill Your Testosterone", score: 92 },
    { title: "Why Your Chest Won't Grow (The Real Fix)", score: 88 },
    { title: "The One Rule That Built My Physique", score: 85 },
  ];
  return (
    <div className="space-y-3">
      {ideas.map((idea) => (
        <div key={idea.title} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold">{idea.score}</div>
          <div className="flex-1">
            <p className="font-medium">{idea.title}</p>
            <p className="text-sm text-slate-500">Hook: &quot;Most guys miss this one thing...&quot;</p>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">→ Script</button>
        </div>
      ))}
    </div>
  );
}

function ThumbnailPreview() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2 aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center relative">
        <span className="text-4xl font-black text-yellow-400 drop-shadow-lg">5 HABITS</span>
        <span className="absolute bottom-4 left-4 text-white text-sm">THAT KILL TESTOSTERONE</span>
      </div>
      <div className="space-y-2">
        <p className="font-semibold text-sm">Layers</p>
        {["Background", "Text: 5 HABITS", "Subtitle", "Arrow shape"].map((l) => (
          <div key={l} className="px-3 py-2 bg-slate-50 rounded-lg text-sm">{l}</div>
        ))}
        <button className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm mt-2">✨ AI Generate</button>
      </div>
    </div>
  );
}

function ScriptPreview() {
  return (
    <div className="space-y-4">
      {["Hook", "Introduction", "Main Point 1"].map((section) => (
        <div key={section} className="border rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-slate-50 font-semibold text-sm">{section}</div>
          <div className="p-4 text-sm text-slate-600">
            {section === "Hook" && '"What if everything you knew about fitness was wrong?" [PAUSE 2 seconds]'}
            {section === "Introduction" && "Welcome back. If you're into fitness, you're in the right place..."}
            {section === "Main Point 1" && "[B-ROLL: Gym footage] First — the foundation most people skip..."}
          </div>
        </div>
      ))}
    </div>
  );
}

function VoiceoverPreview() {
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4 text-3xl">🎙️</div>
      <p className="font-medium mb-2">AI Voiceover Studio</p>
      <p className="text-sm text-slate-500 mb-4">Paste your script and generate natural-sounding narration</p>
      <div className="max-w-md mx-auto bg-slate-50 rounded-xl p-4 text-left text-sm text-slate-600">
        &quot;Welcome back to the channel. Today we&apos;re diving into the 5 habits that quietly kill your testosterone...&quot;
      </div>
      <button className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl">▶ Generate Voiceover</button>
    </div>
  );
}

function VideoEditorPreview() {
  return (
    <div>
      <div className="aspect-video bg-slate-900 rounded-xl mb-4 flex items-center justify-center text-white">
        <span className="text-6xl">▶</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["Scene 1: Hook", "Scene 2: Intro", "Scene 3: Point 1", "Scene 4: CTA"].map((s, i) => (
          <div key={s} className={cn("min-w-[120px] h-16 rounded-lg flex items-center justify-center text-xs text-white", i === 0 ? "bg-indigo-600" : "bg-slate-400")}>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

function BoardPreview() {
  const cols = ["💡 Brainstorm", "✍️ Scripting", "🎬 Editing", "✅ Uploaded"];
  return (
    <div className="grid grid-cols-4 gap-3">
      {cols.map((col, i) => (
        <div key={col} className="bg-slate-50 rounded-xl p-3">
          <p className="font-semibold text-sm mb-2">{col}</p>
          {i === 0 && <div className="p-2 bg-white rounded-lg text-xs border">Top 10 mysteries video</div>}
          {i === 1 && <div className="p-2 bg-white rounded-lg text-xs border">Testosterone habits script</div>}
          {i === 3 && <div className="p-2 bg-white rounded-lg text-xs border">V-Taper guide ✓</div>}
        </div>
      ))}
    </div>
  );
}

function MonetizePreview() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {[
        { title: "Ad Revenue", amount: "$2,400/mo", icon: "📺" },
        { title: "Affiliates", amount: "$800/mo", icon: "🔗" },
        { title: "Sponsorships", amount: "$1,200/mo", icon: "🤝" },
      ].map((item) => (
        <div key={item.title} className="p-4 bg-slate-50 rounded-xl text-center">
          <span className="text-2xl">{item.icon}</span>
          <p className="font-semibold mt-2">{item.title}</p>
          <p className="text-2xl font-bold text-indigo-600">{item.amount}</p>
        </div>
      ))}
    </div>
  );
}

function CoachPreview() {
  return (
    <div className="space-y-3 max-w-lg mx-auto">
      <div className="p-4 bg-indigo-50 rounded-xl text-sm">
        <strong>You:</strong> What niche should I start with for a faceless channel?
      </div>
      <div className="p-4 bg-slate-50 rounded-xl text-sm">
        <strong>Caleb AI:</strong> Great question! For faceless channels, look for topics with high search volume but moderate competition. Finance, history, and true crime consistently perform well...
      </div>
    </div>
  );
}
