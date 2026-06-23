"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuid } from "uuid";
import type { ThumbnailElement } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { Download, Trash2, Type, Square, Sparkles } from "lucide-react";

export default function ThumbnailStudioPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<ThumbnailElement[]>([
    { id: uuid(), type: "rect", x: 0, y: 0, width: 1280, height: 720, color: "#1e293b" },
    { id: uuid(), type: "text", x: 100, y: 280, width: 600, height: 80, content: "YOUR TITLE", color: "#facc15", fontSize: 72 },
    { id: uuid(), type: "text", x: 100, y: 380, width: 500, height: 50, content: "Subtitle here", color: "#ffffff", fontSize: 36 },
  ]);
  const [selected, setSelected] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const { addThumbnailProject } = useAppStore();

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, 1280, 720);
    elements.forEach((el) => {
      if (el.type === "rect") {
        ctx.fillStyle = el.color || "#1e293b";
        ctx.fillRect(el.x, el.y, el.width, el.height);
      } else if (el.type === "text") {
        ctx.fillStyle = el.color || "#ffffff";
        ctx.font = `bold ${el.fontSize || 48}px Inter, sans-serif`;
        ctx.fillText(el.content || "", el.x, el.y + (el.fontSize || 48));
      } else if (el.type === "image" && el.imageUrl) {
        const img = new Image();
        img.src = el.imageUrl;
        ctx.drawImage(img, el.x, el.y, el.width, el.height);
      }
    });
  }, [elements]);

  useEffect(() => { drawCanvas(); }, [drawCanvas]);

  const addText = () => {
    setElements([...elements, { id: uuid(), type: "text", x: 200, y: 200, width: 400, height: 60, content: "New Text", color: "#ffffff", fontSize: 48 }]);
  };

  const addShape = () => {
    setElements([...elements, { id: uuid(), type: "rect", x: 300, y: 300, width: 200, height: 100, color: "#6366f1" }]);
  };

  const updateElement = (id: string, updates: Partial<ThumbnailElement>) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, ...updates } : el)));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
    setSelected(null);
  };

  const handleAiGenerate = () => {
    const colors = ["#dc2626", "#2563eb", "#7c3aed", "#059669"];
    const bgColor = colors[Math.floor(Math.random() * colors.length)];
    setElements([
      { id: uuid(), type: "rect", x: 0, y: 0, width: 1280, height: 720, color: bgColor },
      { id: uuid(), type: "text", x: 80, y: 250, width: 800, height: 100, content: aiPrompt.toUpperCase().slice(0, 30) || "AI GENERATED", color: "#facc15", fontSize: 80 },
      { id: uuid(), type: "text", x: 80, y: 380, width: 600, height: 50, content: "Click to learn more →", color: "#ffffff", fontSize: 32 },
    ]);
  };

  const handleSave = () => {
    addThumbnailProject({
      id: uuid(),
      name: aiPrompt || "Untitled Thumbnail",
      width: 1280,
      height: 720,
      elements,
      createdAt: new Date().toISOString(),
    });
    alert("Thumbnail saved!");
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "thumbnail.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const selectedEl = elements.find((el) => el.id === selected);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">🖼️ Thumbnail Studio</h1>
        <p className="text-slate-500 mt-1">Canva-style editor with AI image generation. Design click-worthy thumbnails.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border p-4">
            <div className="flex gap-2 mb-4">
              <button onClick={addText} className="px-3 py-2 bg-slate-100 rounded-lg text-sm flex items-center gap-1 hover:bg-slate-200"><Type className="w-4 h-4" /> Text</button>
              <button onClick={addShape} className="px-3 py-2 bg-slate-100 rounded-lg text-sm flex items-center gap-1 hover:bg-slate-200"><Square className="w-4 h-4" /> Shape</button>
              <button onClick={handleDownload} className="px-3 py-2 bg-slate-100 rounded-lg text-sm flex items-center gap-1 hover:bg-slate-200 ml-auto"><Download className="w-4 h-4" /> Export</button>
              <button onClick={handleSave} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Save</button>
            </div>
            <div className="overflow-auto rounded-xl border bg-slate-100">
              <canvas ref={canvasRef} width={1280} height={720} className="w-full h-auto cursor-crosshair" onClick={() => setSelected(null)} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Generate</h3>
            <input
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm mb-2"
              placeholder="Describe your thumbnail..."
            />
            <button onClick={handleAiGenerate} className="w-full py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg text-sm font-medium">
              ✨ Generate
            </button>
          </div>

          <div className="bg-white rounded-2xl border p-4">
            <h3 className="font-bold mb-3">Layers</h3>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {[...elements].reverse().map((el) => (
                <button
                  key={el.id}
                  onClick={() => setSelected(el.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${selected === el.id ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-50"}`}
                >
                  <span>{el.type === "text" ? `T: ${el.content?.slice(0, 20)}` : el.type === "rect" ? "Background" : "Image"}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }} className="text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                </button>
              ))}
            </div>
          </div>

          {selectedEl && (
            <div className="bg-white rounded-2xl border p-4">
              <h3 className="font-bold mb-3">Properties</h3>
              {selectedEl.type === "text" && (
                <>
                  <label className="text-xs text-slate-500">Text</label>
                  <input value={selectedEl.content} onChange={(e) => updateElement(selectedEl.id, { content: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mb-2" />
                  <label className="text-xs text-slate-500">Font Size</label>
                  <input type="number" value={selectedEl.fontSize} onChange={(e) => updateElement(selectedEl.id, { fontSize: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm mb-2" />
                </>
              )}
              <label className="text-xs text-slate-500">Color</label>
              <input type="color" value={selectedEl.color || "#ffffff"} onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })} className="w-full h-10 rounded-lg mb-2" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
