import type { FashionBrand, UserAnalysis } from "@/types";

const BODY_TYPES = ["athletic", "slim", "average", "curvy", "plus-size"] as const;
const SKIN_TONES = ["fair", "light", "medium", "olive", "tan", "deep"] as const;
const STYLE_PREFS = [
  "minimalist",
  "bold",
  "classic",
  "streetwear",
  "modest",
  "luxury",
  "casual",
  "sporty",
] as const;

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickFrom<T>(arr: readonly T[], seed: number, index: number): T {
  return arr[(seed + index) % arr.length];
}

export function analyzeUserDemo(photoBase64: string): UserAnalysis {
  const seed = hashString(photoBase64.slice(0, 200));

  return {
    bodyType: pickFrom(BODY_TYPES, seed, 0),
    skinTone: pickFrom(SKIN_TONES, seed, 1),
    stylePreferences: [
      pickFrom(STYLE_PREFS, seed, 2),
      pickFrom(STYLE_PREFS, seed, 3),
    ].filter((v, i, a) => a.indexOf(v) === i),
    recommendedCategories: ["premium", "streetwear", "modest"].slice(0, 2 + (seed % 2)),
    confidence: 0.75 + (seed % 20) / 100,
  };
}

export async function analyzeUserAI(
  photoBase64: string,
  apiKey: string
): Promise<UserAnalysis> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a fashion stylist AI. Analyze the full-body photo and return JSON only with: bodyType, skinTone, stylePreferences (array), recommendedCategories (array), confidence (0-1).",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this full-body photo for fashion recommendations. Return JSON only.",
            },
            {
              type: "image_url",
              image_url: { url: photoBase64 },
            },
          ],
        },
      ],
      max_tokens: 300,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`Vision API error: ${response.status}`);
  }

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);
  return content as UserAnalysis;
}

export function scoreBrandMatch(
  brand: FashionBrand,
  analysis: UserAnalysis
): number {
  let score = 60;

  if (brand.trending) score += 10;
  if (analysis.recommendedCategories.includes(brand.category)) score += 15;
  if (
    analysis.stylePreferences.some((p) =>
      brand.tags.some((t) => t.includes(p) || p.includes(t))
    )
  ) {
    score += 10;
  }
  if (brand.category === "modest" && analysis.stylePreferences.includes("modest")) {
    score += 12;
  }
  if (brand.category === "luxury" && analysis.stylePreferences.includes("luxury")) {
    score += 12;
  }
  if (brand.category === "streetwear" && analysis.stylePreferences.includes("streetwear")) {
    score += 12;
  }

  return Math.min(score + Math.floor(Math.random() * 8), 98);
}

export function buildWhyThisFits(
  brand: FashionBrand,
  analysis: UserAnalysis,
  matchScore: number
): string {
  const reasons: string[] = [];

  if (matchScore >= 90) {
    reasons.push(`${brand.name} is an exceptional match for your ${analysis.bodyType} build`);
  } else if (matchScore >= 80) {
    reasons.push(`${brand.name} complements your ${analysis.bodyType} physique well`);
  } else {
    reasons.push(`${brand.name} offers styles that work with your body type`);
  }

  if (brand.trending) {
    reasons.push("currently trending in your selected country");
  }

  if (analysis.stylePreferences.some((p) => brand.tags.includes(p))) {
    reasons.push(`aligns with your ${analysis.stylePreferences.join(" & ")} style preference`);
  }

  return reasons.join(", ") + ".";
}

export async function generateTryOnImageAI(
  photoBase64: string,
  brand: FashionBrand,
  apiKey: string
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: `Fashion virtual try-on: A person wearing ${brand.outfitStyle} from ${brand.name} brand. Style: ${brand.category}. Colors: ${brand.colorPalette.join(", ")}. Professional fashion photography, full body shot, clean background, photorealistic.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    }),
  });

  if (!response.ok) {
    throw new Error(`Image generation error: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].url;
}

export function generateTryOnImageDemo(
  photoBase64: string,
  brand: FashionBrand
): string {
  const primaryColor = brand.colorPalette[0] ?? "#6366f1";
  const secondaryColor = brand.colorPalette[1] ?? "#a855f7";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:0.15"/>
          <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:0.25"/>
        </linearGradient>
        <clipPath id="photoClip">
          <rect x="40" y="60" width="320" height="480" rx="16"/>
        </clipPath>
      </defs>
      <rect width="400" height="600" fill="url(#bg)"/>
      <rect x="20" y="40" width="360" height="520" rx="20" fill="white" opacity="0.9"/>
      <image href="${photoBase64}" x="40" y="60" width="320" height="400" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)" opacity="0.85"/>
      <rect x="40" y="60" width="320" height="400" fill="${primaryColor}" opacity="0.12" clip-path="url(#photoClip)"/>
      <rect x="40" y="460" width="320" height="80" fill="${primaryColor}" opacity="0.85" rx="0"/>
      <text x="200" y="490" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="14" font-weight="700">${brand.name}</text>
      <text x="200" y="515" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="11" opacity="0.9">${brand.outfitStyle.slice(0, 45)}...</text>
      <rect x="140" y="530" width="120" height="24" rx="12" fill="white" opacity="0.2"/>
      <text x="200" y="547" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="10">${brand.category.toUpperCase()} • ${brand.priceRange}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
