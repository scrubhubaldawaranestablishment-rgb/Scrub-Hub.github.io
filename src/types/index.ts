export interface Country {
  code: string;
  name: string;
  flag: string;
  region: string;
}

export interface FashionBrand {
  id: string;
  name: string;
  country: string;
  category: "luxury" | "premium" | "streetwear" | "traditional" | "modest" | "sportswear";
  description: string;
  whyBuy: string;
  priceRange: "$" | "$$" | "$$$" | "$$$$";
  trending: boolean;
  website?: string;
  outfitStyle: string;
  colorPalette: string[];
  tags: string[];
}

export interface UserAnalysis {
  bodyType: string;
  skinTone: string;
  stylePreferences: string[];
  recommendedCategories: string[];
  confidence: number;
}

export interface BrandRecommendation {
  brand: FashionBrand;
  matchScore: number;
  outfitDescription: string;
  generatedImageUrl: string;
  whyThisFits: string;
  trendInsight: string;
}

export interface GenerateRequest {
  photoBase64: string;
  countryCode: string;
}

export interface GenerateResponse {
  analysis: UserAnalysis;
  recommendations: BrandRecommendation[];
  countryTrends: string[];
  mode: "ai" | "demo";
}
