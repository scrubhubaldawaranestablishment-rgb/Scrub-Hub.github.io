"use client";

import { Loader2, Sparkles, Shirt, Scan, Wand2 } from "lucide-react";

const STEPS = [
  { icon: Scan, text: "Scanning brands in your country..." },
  { icon: Shirt, text: "Analyzing your body type & style..." },
  { icon: Wand2, text: "Generating virtual try-on looks..." },
  { icon: Sparkles, text: "Building your fashion guide..." },
];

export default function LoadingState() {
  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center py-16 px-6">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-violet-200" />
        <div className="absolute inset-0 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles size={32} className="text-violet-600 animate-pulse" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">
        AI Fashion Scanner
      </h2>
      <p className="text-sm text-gray-500 text-center mb-8">
        Our AI is scanning local brands and creating personalized looks for you
      </p>

      <div className="w-full space-y-4">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm animate-pulse"
            style={{ animationDelay: `${i * 0.5}s` }}
          >
            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
              <step.icon size={20} className="text-violet-600" />
            </div>
            <p className="text-sm text-gray-700">{step.text}</p>
            <Loader2
              size={16}
              className="ml-auto text-violet-400 animate-spin shrink-0"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
