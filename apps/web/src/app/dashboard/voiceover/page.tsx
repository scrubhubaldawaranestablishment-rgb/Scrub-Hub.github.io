"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Volume2 } from "lucide-react";

const VOICES = [
  { id: "default", name: "Default", lang: "en-US" },
  { id: "uk-male", name: "British Male", lang: "en-GB" },
  { id: "us-female", name: "US Female", lang: "en-US" },
  { id: "au-male", name: "Australian", lang: "en-AU" },
];

export default function VoiceoverPage() {
  const [script, setScript] = useState(
    "Welcome back to the channel. Today we're diving into the 5 habits that quietly kill your testosterone.\n\nMost guys have no idea these everyday habits are sabotaging their progress. By the end of this video, you'll know exactly what to change.\n\nLet's start with habit number one..."
  );
  const [voice, setVoice] = useState("en-US");
  const [rate, setRate] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  const handleGenerate = () => {
    if (!window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.lang = voice;
    utterance.rate = rate;

    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find((v) => v.lang.startsWith(voice.split("-")[0]));
    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.onstart = () => setPlaying(true);
    utterance.onend = () => { setPlaying(false); setProgress(100); };
    utterance.onboundary = (e) => {
      if (e.charIndex) setProgress(Math.min(99, (e.charIndex / script.length) * 100));
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    window.speechSynthesis?.cancel();
    setPlaying(false);
    setProgress(0);
  };

  const handlePause = () => {
    if (playing) {
      window.speechSynthesis?.pause();
      setPlaying(false);
    } else {
      window.speechSynthesis?.resume();
      setPlaying(true);
    }
  };

  const wordCount = script.trim().split(/\s+/).length;
  const estMinutes = Math.ceil(wordCount / 150);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">🎙️ AI Voiceover</h1>
        <p className="text-slate-500 mt-1">Transform your scripts into natural-sounding voiceovers.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border p-6">
            <label className="text-sm font-medium mb-2 block">Script</label>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="w-full h-64 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="Paste your script here..."
            />
            <p className="text-xs text-slate-400 mt-2">{wordCount} words · ~{estMinutes} min narration</p>
          </div>

          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-center gap-4 mb-4">
              <button onClick={handleGenerate} disabled={playing} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                <Play className="w-5 h-5" /> Generate & Play
              </button>
              <button onClick={handlePause} className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200"><Pause className="w-5 h-5" /></button>
              <button onClick={handleStop} className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200"><Square className="w-5 h-5" /></button>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Volume2 className="w-4 h-4" /> Voice Settings</h3>
            <label className="text-sm text-slate-500 mb-1 block">Voice</label>
            <select value={voice} onChange={(e) => setVoice(e.target.value)} className="w-full px-3 py-2 border rounded-lg mb-4">
              {VOICES.map((v) => (
                <option key={v.id} value={v.lang}>{v.name}</option>
              ))}
            </select>
            <label className="text-sm text-slate-500 mb-1 block">Speed: {rate}x</label>
            <input type="range" min="0.5" max="2" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full" />
          </div>

          <div className="bg-indigo-50 rounded-2xl p-6">
            <h3 className="font-bold text-indigo-900 mb-2">Tips</h3>
            <ul className="text-sm text-indigo-700 space-y-2">
              <li>• Write conversationally — shorter sentences sound more natural</li>
              <li>• Use punctuation for natural pauses</li>
              <li>• Aim for 130-150 words per minute</li>
              <li>• Preview before using in the Video Editor</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
