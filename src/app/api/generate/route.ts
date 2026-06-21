import { NextResponse } from "next/server";
import type { BrandRecommendation, GenerateResponse } from "@/types";
import { getCountryByCode } from "@/data/countries";
import {
  getBrandsByCountry,
  getCountryTrends,
} from "@/lib/brands-service";
import { createSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  analyzeUserAI,
  analyzeUserDemo,
  buildWhyThisFits,
  generateTryOnImageAI,
  generateTryOnImageDemo,
  scoreBrandMatch,
} from "@/lib/ai-service";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { photoBase64, countryCode } = body;

    if (!photoBase64 || !countryCode) {
      return NextResponse.json(
        { error: "Photo and country are required" },
        { status: 400 }
      );
    }

    if (!photoBase64.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Invalid image format. Please upload a valid image." },
        { status: 400 }
      );
    }

    const country = getCountryByCode(countryCode);
    if (!country) {
      return NextResponse.json({ error: "Country not found" }, { status: 404 });
    }

    const brands = await getBrandsByCountry(countryCode);
    if (brands.length === 0) {
      return NextResponse.json(
        { error: "No brands found for this country" },
        { status: 404 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const useAI = Boolean(apiKey);

    const analysis = useAI
      ? await analyzeUserAI(photoBase64, apiKey!)
      : analyzeUserDemo(photoBase64);

    const scoredBrands = brands
      .map((brand) => ({
        brand,
        matchScore: scoreBrandMatch(brand, analysis),
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);

    const countryTrends = await getCountryTrends(countryCode);

    const recommendations: BrandRecommendation[] = await Promise.all(
      scoredBrands.map(async ({ brand, matchScore }) => {
        let generatedImageUrl: string;

        if (useAI) {
          try {
            generatedImageUrl = await generateTryOnImageAI(
              photoBase64,
              brand,
              apiKey!
            );
          } catch {
            generatedImageUrl = generateTryOnImageDemo(photoBase64, brand);
          }
        } else {
          generatedImageUrl = generateTryOnImageDemo(photoBase64, brand);
        }

        const trendInsight =
          countryTrends[Math.floor(Math.random() * countryTrends.length)];

        return {
          brand,
          matchScore,
          outfitDescription: brand.outfitStyle,
          generatedImageUrl,
          whyThisFits: buildWhyThisFits(brand, analysis, matchScore),
          trendInsight,
        };
      })
    );

    const response: GenerateResponse = {
      analysis,
      recommendations,
      countryTrends,
      mode: useAI ? "ai" : "demo",
    };

    if (isSupabaseConfigured()) {
      const supabase = createSupabaseAdmin();
      if (supabase) {
        await supabase.from("generation_sessions").insert({
          country_code: countryCode,
          analysis,
          recommendations,
          mode: response.mode,
        });
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate fashion recommendations" },
      { status: 500 }
    );
  }
}
