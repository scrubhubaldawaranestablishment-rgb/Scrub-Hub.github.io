"use client";

import type { BrandRecommendation, GenerateResponse } from "@/types";
import {
  ExternalLink,
  Sparkles,
  TrendingUp,
  Heart,
  ChevronLeft,
  Star,
} from "lucide-react";

interface BrandResultCardProps {
  recommendation: BrandRecommendation;
  rank: number;
}

function MatchBadge({ score }: { score: number }) {
  const color =
    score >= 90
      ? "bg-emerald-500"
      : score >= 80
        ? "bg-violet-500"
        : "bg-amber-500";

  return (
    <div
      className={`${color} text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1`}
    >
      <Star size={12} fill="currentColor" />
      {score}% Match
    </div>
  );
}

export function BrandResultCard({ recommendation, rank }: BrandResultCardProps) {
  const { brand, matchScore, generatedImageUrl, whyThisFits, trendInsight } =
    recommendation;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={generatedImageUrl}
          alt={`You wearing ${brand.name}`}
          className="w-full aspect-[2/3] object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
            #{rank}
          </span>
          <MatchBadge score={matchScore} />
        </div>
        {brand.trending && (
          <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <TrendingUp size={12} />
            Trending
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{brand.name}</h3>
            <p className="text-xs text-gray-500 capitalize">
              {brand.category} • {brand.priceRange}
            </p>
          </div>
          <div className="flex gap-1">
            {brand.colorPalette.slice(0, 4).map((color) => (
              <div
                key={color}
                className="w-5 h-5 rounded-full border border-gray-200"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          {brand.description}
        </p>

        <div className="bg-violet-50 rounded-xl p-3">
          <p className="text-xs font-semibold text-violet-700 flex items-center gap-1 mb-1">
            <Sparkles size={14} />
            Why This Fits You
          </p>
          <p className="text-sm text-violet-900">{whyThisFits}</p>
        </div>

        <div className="bg-amber-50 rounded-xl p-3">
          <p className="text-xs font-semibold text-amber-700 flex items-center gap-1 mb-1">
            <TrendingUp size={14} />
            Local Trend
          </p>
          <p className="text-sm text-amber-900">{trendInsight}</p>
        </div>

        <div className="bg-emerald-50 rounded-xl p-3">
          <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mb-1">
            <Heart size={14} />
            Why Buy {brand.name}
          </p>
          <p className="text-sm text-emerald-900">{brand.whyBuy}</p>
        </div>

        <p className="text-xs text-gray-500 italic">
          Outfit: {recommendation.outfitDescription}
        </p>

        {brand.website && (
          <a
            href={brand.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            Shop at {brand.name}
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
}

interface ResultsViewProps {
  results: GenerateResponse;
  countryName: string;
  countryFlag: string;
  onBack: () => void;
}

export default function ResultsView({
  results,
  countryName,
  countryFlag,
  onBack,
}: ResultsViewProps) {
  const { analysis, recommendations, countryTrends, mode } = results;

  return (
    <div className="w-full max-w-lg mx-auto pb-8">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-violet-600 font-medium mb-4 hover:text-violet-800 transition-colors"
      >
        <ChevronLeft size={18} />
        Try Another Look
      </button>

      <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-5 text-white mb-6 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{countryFlag}</span>
          <h2 className="text-xl font-bold">Your Fashion Guide</h2>
        </div>
        <p className="text-violet-100 text-sm">
          AI scanned {recommendations.length} top brands in {countryName} and
          generated personalized looks for you.
        </p>
        {mode === "demo" && (
          <p className="text-violet-200 text-xs mt-2 bg-white/10 rounded-lg px-3 py-1.5">
            Demo mode — add OPENAI_API_KEY for full AI image generation
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Your Style Profile
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Body Type</p>
            <p className="text-sm font-semibold capitalize">{analysis.bodyType}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Skin Tone</p>
            <p className="text-sm font-semibold capitalize">{analysis.skinTone}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 col-span-2">
            <p className="text-xs text-gray-500">Style Preferences</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {analysis.stylePreferences.map((pref) => (
                <span
                  key={pref}
                  className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full capitalize"
                >
                  {pref}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
          <TrendingUp size={16} className="text-orange-500" />
          Fashion Trends in {countryName}
        </h3>
        <ul className="space-y-2">
          {countryTrends.map((trend, i) => (
            <li key={i} className="text-sm text-gray-600 flex gap-2">
              <span className="text-violet-400 font-bold shrink-0">•</span>
              {trend}
            </li>
          ))}
        </ul>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Your Brand Matches
      </h3>

      <div className="space-y-6">
        {recommendations.map((rec, i) => (
          <BrandResultCard key={rec.brand.id} recommendation={rec} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}
