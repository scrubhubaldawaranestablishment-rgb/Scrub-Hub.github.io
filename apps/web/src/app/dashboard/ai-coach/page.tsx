"use client";

import { useState, useRef, useEffect } from "react";
import { generateCoachResponse } from "@/lib/ai";
import { generateAI, useSettingsStore } from "@/lib/api-client";
import { useAppStore } from "@/lib/store";
import { v4 as uuid } from "uuid";
import { Send, GraduationCap } from "lucide-react";

const SUGGESTIONS = [
  "What niche should I start with?",
  "How do I improve my thumbnails?",
  "What's the best script structure for retention?",
  "How can I monetize my channel faster?",
  "How often should I upload?",
];

export default function AICoachPage() {
  const { coachMessages, addCoachMessage } = useAppStore();
  const { openaiApiKey } = useSettingsStore();
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (coachMessages.length === 0) {
      addCoachMessage({
        id: uuid(),
        role: "assistant",
        content: "Hey! I'm Caleb AI, your YouTube growth coach. I've helped build faceless channels making $3M+. Ask me anything about niches, titles, thumbnails, scripts, or monetization!",
        timestamp: new Date().toISOString(),
      });
    }
  }, [coachMessages.length, addCoachMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [coachMessages, typing]);

  const handleSend = async (text?: string) => {
    const message = text || input.trim();
    if (!message) return;

    addCoachMessage({ id: uuid(), role: "user", content: message, timestamp: new Date().toISOString() });
    setInput("");
    setTyping(true);

    try {
      let response: string;
      if (openaiApiKey) {
        response = await generateAI(message, "coach", openaiApiKey);
      } else {
        await new Promise((r) => setTimeout(r, 600));
        response = generateCoachResponse(message);
      }
      addCoachMessage({ id: uuid(), role: "assistant", content: response, timestamp: new Date().toISOString() });
    } catch {
      addCoachMessage({
        id: uuid(),
        role: "assistant",
        content: generateCoachResponse(message),
        timestamp: new Date().toISOString(),
      });
    } finally {
      setTyping(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">🎓 AI Coach</h1>
        <p className="text-slate-500 mt-1">Chat with Caleb AI, your 24/7 YouTube growth coach for faceless channels.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl border flex flex-col h-[calc(100vh-220px)]">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {coachMessages.map((msg) => (
              <div key={msg.id} className={msg.role === "user" ? "flex justify-end" : "flex gap-3"}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={msg.role === "user" ? "bg-indigo-600 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-[75%]" : "bg-slate-50 rounded-2xl rounded-bl-md px-4 py-3 max-w-[75%]"}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-50 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ask Caleb anything about YouTube growth..."
              />
              <button onClick={() => handleSend()} className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border p-6">
            <h3 className="font-bold mb-3">Suggested Questions</h3>
            <div className="space-y-2">
              {SUGGESTIONS.map((q) => (
                <button key={q} onClick={() => handleSend(q)} className="w-full text-left px-3 py-2 bg-slate-50 rounded-lg text-sm hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-indigo-50 rounded-2xl p-6">
            <h3 className="font-bold text-indigo-900 mb-2">About Caleb AI</h3>
            <p className="text-sm text-indigo-700">Built from strategies used by faceless channels making $3M+. Get advice on niches, content, thumbnails, and growth.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
