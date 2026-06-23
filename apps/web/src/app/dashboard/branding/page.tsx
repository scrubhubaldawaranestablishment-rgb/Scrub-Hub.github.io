"use client";

import { useState } from "react";
import { generateBrandingAssets } from "@/lib/ai";
import { Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function BrandingPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your Branding AI. Tell me your channel name, niche, and preferred style (bold, minimal, vibrant, or dark) and I'll generate your profile picture and banner concepts." },
  ]);
  const [input, setInput] = useState("");
  const [assets, setAssets] = useState<ReturnType<typeof generateBrandingAssets> | null>(null);
  const [channelName, setChannelName] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((m) => [...m, { role: "user", content: userMsg }]);

    const nameMatch = userMsg.match(/called\s+"?([^"]+)"?/i) || userMsg.match(/channel\s+(\w+)/i);
    const name = nameMatch?.[1] || "My Channel";
    setChannelName(name);

    const nicheMatch = userMsg.match(/(fitness|finance|history|tech|motivation|crime|food|science)/i);
    const niche = nicheMatch?.[1] || "general";

    const styleMatch = userMsg.match(/(bold|minimal|vibrant|dark)/i);
    const style = styleMatch?.[1]?.toLowerCase() || "bold";

    const generated = generateBrandingAssets(name, niche, style);
    setAssets(generated);

    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: `I've created a ${style} brand identity for "${name}"!\n\n**Profile Picture:** ${generated.profileDescription}\n\n**Banner:** ${generated.bannerDescription}\n\n**Color Palette:** ${generated.colorPalette.join(", ")}\n\nCheck the preview on the right. You can download or regenerate with a different style.`,
        },
      ]);
    }, 600);

    setInput("");
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">🎨 Branding</h1>
        <p className="text-slate-500 mt-1">Chat with the Branding AI to generate channel profile picture and banner.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={msg.role === "user" ? "flex justify-end" : ""}>
                <div className={msg.role === "user" ? "bg-indigo-600 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-[80%]" : "bg-slate-50 rounded-2xl rounded-bl-md px-4 py-3 max-w-[80%]"}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder='e.g. Create branding for my fitness channel called "Bro Pump" with bold style'
            />
            <button onClick={handleSend} className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <h3 className="font-bold mb-4">Brand Preview</h3>
          {assets ? (
            <div className="space-y-6">
              <div className="text-center">
                <div
                  className="w-24 h-24 rounded-full mx-auto mb-2 flex items-center justify-center text-3xl text-white font-bold"
                  style={{ background: `linear-gradient(135deg, ${assets.colorPalette[0]}, ${assets.colorPalette[1]})` }}
                >
                  {channelName[0]?.toUpperCase() || "V"}
                </div>
                <p className="text-sm text-slate-500">Profile Picture</p>
              </div>
              <div
                className="h-32 rounded-xl flex items-center justify-center text-white font-bold text-2xl"
                style={{ background: `linear-gradient(90deg, ${assets.colorPalette[0]}, ${assets.colorPalette[1]})` }}
              >
                {channelName || "Channel Name"}
              </div>
              <p className="text-sm text-slate-500 text-center">YouTube Banner (2560×1440)</p>
              <div className="flex gap-2 justify-center">
                {assets.colorPalette.map((color) => (
                  <div key={color} className="text-center">
                    <div className="w-12 h-12 rounded-lg border" style={{ backgroundColor: color }} />
                    <p className="text-xs mt-1 text-slate-500">{color}</p>
                  </div>
                ))}
              </div>
              <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700">
                Download Brand Kit
              </button>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              <p>Start a conversation to generate your brand assets</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
