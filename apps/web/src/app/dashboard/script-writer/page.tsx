"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { generateScript } from "@/lib/ai";
import { generateAI, useSettingsStore } from "@/lib/api-client";
import { useAppStore } from "@/lib/store";
import { v4 as uuid } from "uuid";
import { FileText, Copy, Check } from "lucide-react";

function ScriptWriterContent() {
  const searchParams = useSearchParams();
  const initialTitle = searchParams.get("title") || "";
  const initialNiche = searchParams.get("niche") || "Fitness";
  const [title, setTitle] = useState(initialTitle);
  const [niche, setNiche] = useState(initialNiche);
  const [sections, setSections] = useState<ReturnType<typeof generateScript>>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { openaiApiKey } = useSettingsStore();
  const { addScript } = useAppStore();

  const handleGenerate = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      if (openaiApiKey) {
        const content = await generateAI(
          `Write a complete YouTube script for a faceless "${niche}" channel video titled "${title}". Use sections: Hook, Introduction, Main Point 1, Main Point 2, Main Point 3, Call to Action. Include B-roll cues and pattern interrupts.`,
          "script",
          openaiApiKey
        );
        const sectionTitles = ["Hook", "Introduction", "Main Point 1", "Main Point 2", "Main Point 3", "Call to Action"];
        const parts = content.split(/#{1,3}\s+/).filter(Boolean);
        const generated = sectionTitles.map((sectionTitle, i) => ({
          id: uuid(),
          title: sectionTitle,
          content: parts[i]?.replace(/^(Hook|Introduction|Main Point \d|Call to Action)[:\s]*/i, "").trim() || content,
        }));
        setSections(generated);
        addScript({ id: uuid(), title, niche, sections: generated, createdAt: new Date().toISOString() });
      } else {
        await new Promise((r) => setTimeout(r, 1000));
        const generated = generateScript(title, niche);
        setSections(generated);
        addScript({ id: uuid(), title, niche, sections: generated, createdAt: new Date().toISOString() });
      }
    } catch {
      const generated = generateScript(title, niche);
      setSections(generated);
      addScript({ id: uuid(), title, niche, sections: generated, createdAt: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const fullScript = sections.map((s) => `## ${s.title}\n\n${s.content}`).join("\n\n");
    navigator.clipboard.writeText(fullScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateSection = (id: string, content: string) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, content } : s)));
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">✍️ AI Script Writer</h1>
        <p className="text-slate-500 mt-1">Generate research-backed scripts section by section, with hooks optimized for retention.</p>
      </div>

      <div className="bg-white rounded-2xl border p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Video Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 5 Habits That Kill Your Testosterone" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Niche</label>
            <input value={niche} onChange={(e) => setNiche(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Fitness" />
          </div>
        </div>
        <button onClick={handleGenerate} disabled={loading || !title.trim()} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold disabled:opacity-50">
          {loading ? "Writing script..." : <><FileText className="inline w-5 h-5 mr-2" />Generate Script</>}
        </button>
      </div>

      {sections.length > 0 && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={handleCopy} className="px-4 py-2 bg-slate-100 rounded-xl text-sm flex items-center gap-2 hover:bg-slate-200">
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Full Script"}
            </button>
          </div>
          <div className="space-y-4">
            {sections.map((section, i) => (
              <div key={section.id} className="bg-white rounded-2xl border overflow-hidden">
                <div className="px-6 py-3 bg-slate-50 border-b flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">{i + 1}</span>
                  <h3 className="font-bold">{section.title}</h3>
                </div>
                <textarea
                  value={section.content}
                  onChange={(e) => updateSection(section.id, e.target.value)}
                  className="w-full p-6 text-sm text-slate-700 min-h-[120px] focus:outline-none resize-y"
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ScriptWriterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
      <ScriptWriterContent />
    </Suspense>
  );
}
