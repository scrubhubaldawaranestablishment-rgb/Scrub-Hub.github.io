"use client";

import { useState, useCallback } from "react";
import { Sparkles, Globe2, Camera } from "lucide-react";
import PhotoUpload from "@/components/PhotoUpload";
import CountrySelector from "@/components/CountrySelector";
import LoadingState from "@/components/LoadingState";
import ResultsView from "@/components/ResultsView";
import { getCountryByCode } from "@/data/countries";
import type { GenerateResponse } from "@/types";

export default function FashionApp() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [country, setCountry] = useState("SA");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!photo || !country) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoBase64: photo, countryCode: country }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      const data: GenerateResponse = await res.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [photo, country]);

  const handleBack = () => {
    setResults(null);
    setError(null);
  };

  const countryData = getCountryByCode(country);

  if (loading) {
    return <LoadingState />;
  }

  if (results && countryData) {
    return (
      <ResultsView
        results={results}
        countryName={countryData.name}
        countryFlag={countryData.flag}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <Sparkles size={14} />
          AI-Powered Fashion Guide
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
          Try Before You Buy
        </h1>
        <p className="text-gray-500 mt-2 text-sm leading-relaxed">
          Upload your full body photo, select your country, and let AI scan local
          brands to show you personalized fashion looks.
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[
          { icon: Camera, label: "Upload", active: true },
          { icon: Globe2, label: "Country", active: !!country },
          { icon: Sparkles, label: "Generate", active: false },
        ].map((step, i) => (
          <div key={step.label} className="flex items-center gap-2">
            {i > 0 && <div className="w-8 h-px bg-gray-200" />}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                step.active
                  ? "bg-violet-600 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <step.icon size={14} />
              {step.label}
            </div>
          </div>
        ))}
      </div>

      {/* Photo Upload */}
      <div className="mb-6">
        <PhotoUpload photo={photo} onPhotoChange={setPhoto} />
      </div>

      {/* Country Selector */}
      <div className="mb-6">
        <CountrySelector selected={country} onSelect={setCountry} />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!photo || !country}
        className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <Sparkles size={22} />
        Generate Fashion Wear
      </button>

      <p className="text-center text-xs text-gray-400 mt-4">
        AI scans brands available in your country and generates virtual try-on
        images to help you decide before buying.
      </p>
    </div>
  );
}
