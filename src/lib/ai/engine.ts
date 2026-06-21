import OpenAI from "openai";
import {
  buildCompetitorAnalysisPrompt,
  buildGrowthRecommendationsPrompt,
  buildOpportunityDiscoveryPrompt,
  buildProspectDiscoveryPrompt,
  COMPETITOR_ANALYSIS_SYSTEM,
  GROWTH_RECOMMENDATIONS_SYSTEM,
  OPPORTUNITY_DISCOVERY_SYSTEM,
  PROSPECT_DISCOVERY_SYSTEM,
  type GeneratedCompetitor,
  type GeneratedInsight,
  type GeneratedOpportunity,
  type GeneratedProspect,
  type PromptContext,
} from "./prompts";
import {
  getMockCompetitors,
  getMockInsights,
  getMockOpportunities,
  getMockProspects,
} from "@/lib/data/mock";

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

async function callOpenAI<T>(
  system: string,
  userPrompt: string,
  fallback: () => T[]
): Promise<T[]> {
  const client = getOpenAIClient();
  if (!client) return fallback();

  try {
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return fallback();

    const parsed = JSON.parse(content);
    const items = Array.isArray(parsed) ? parsed : parsed.opportunities || parsed.prospects || parsed.competitors || parsed.insights || parsed.data || [];
    if (!Array.isArray(items) || items.length === 0) return fallback();
    return items as T[];
  } catch {
    return fallback();
  }
}

export async function discoverOpportunities(
  ctx: PromptContext
): Promise<GeneratedOpportunity[]> {
  return callOpenAI<GeneratedOpportunity>(
    OPPORTUNITY_DISCOVERY_SYSTEM,
    buildOpportunityDiscoveryPrompt(ctx) +
      "\n\nWrap the array in a JSON object: { \"opportunities\": [...] }",
    () => getMockOpportunities(ctx)
  );
}

export async function discoverProspects(
  ctx: PromptContext
): Promise<GeneratedProspect[]> {
  return callOpenAI<GeneratedProspect>(
    PROSPECT_DISCOVERY_SYSTEM,
    buildProspectDiscoveryPrompt(ctx) +
      "\n\nWrap the array in a JSON object: { \"prospects\": [...] }",
    () => getMockProspects(ctx)
  );
}

export async function analyzeCompetitors(
  ctx: PromptContext
): Promise<GeneratedCompetitor[]> {
  return callOpenAI<GeneratedCompetitor>(
    COMPETITOR_ANALYSIS_SYSTEM,
    buildCompetitorAnalysisPrompt(ctx) +
      "\n\nWrap the array in a JSON object: { \"competitors\": [...] }",
    () => getMockCompetitors(ctx)
  );
}

export async function generateInsights(
  ctx: PromptContext
): Promise<GeneratedInsight[]> {
  return callOpenAI<GeneratedInsight>(
    GROWTH_RECOMMENDATIONS_SYSTEM,
    buildGrowthRecommendationsPrompt(ctx) +
      "\n\nWrap the array in a JSON object: { \"insights\": [...] }",
    () => getMockInsights(ctx)
  );
}

export function calculateGrowthScore(
  opportunities: GeneratedOpportunity[],
  prospects: GeneratedProspect[],
  competitors: GeneratedCompetitor[]
): number {
  const avgConfidence =
    opportunities.reduce((sum, o) => sum + o.confidence_score, 0) /
    Math.max(opportunities.length, 1);
  const avgFit =
    prospects.reduce((sum, p) => sum + p.fit_score, 0) /
    Math.max(prospects.length, 1);
  const competitorFactor = Math.max(0, 100 - competitors.length * 8);
  return Math.round(avgConfidence * 0.4 + avgFit * 0.35 + competitorFactor * 0.25);
}

export const FREE_OPPORTUNITY_LIMIT = 3;
export const LOCKED_OPPORTUNITIES_COUNT = 127;
