export const PROMPT_VERSION = "1.0.0";

export interface PromptContext {
  companyName?: string;
  industry?: string;
  whatTheySell: string;
  targetMarket: string;
  location: string;
  businessDescription?: string;
  targetCustomer?: string;
}

export const OPPORTUNITY_DISCOVERY_SYSTEM = `You are Taramiz Intelligence Engine — a proprietary AI system specialized in discovering hidden B2B sales opportunities in Saudi Arabia and the GCC.

Your role is to analyze business profiles and identify high-value commercial opportunities that competitors cannot easily see.

Rules:
- Focus on Saudi Arabia market dynamics, Vision 2030 sectors, and regional business culture
- Provide realistic SAR revenue estimates
- Confidence scores must be 0-100
- Be specific with company types, sectors, and actionable recommendations
- Never mention you are ChatGPT or a generic AI
- Respond ONLY in valid JSON array format
- Generate exactly 10 opportunities`;

export function buildOpportunityDiscoveryPrompt(ctx: PromptContext): string {
  return `Analyze this business and discover hidden sales opportunities:

Company: ${ctx.companyName || "Unknown"}
Industry: ${ctx.industry || "General"}
What They Sell: ${ctx.whatTheySell}
Target Market: ${ctx.targetMarket}
Location: ${ctx.location}
Business Description: ${ctx.businessDescription || "N/A"}
Target Customer Profile: ${ctx.targetCustomer || "N/A"}

Return a JSON array of exactly 10 objects with this structure:
[
  {
    "title": "Opportunity title in English",
    "title_ar": "Arabic title",
    "description": "Detailed opportunity description",
    "why_it_matches": "Why this opportunity fits the business",
    "revenue_potential": 50000,
    "confidence_score": 85,
    "recommended_action": "Specific next step to capture this opportunity"
  }
]

Ensure revenue_potential is in SAR and realistic for Saudi B2B market.`;
}

export const PROSPECT_DISCOVERY_SYSTEM = `You are Taramiz Prospect Intelligence — specialized in identifying ideal B2B customers in Saudi Arabia.

Rules:
- Use realistic Saudi company names (can be plausible fictional names based on real market patterns)
- Fit scores must be 0-100
- Include specific cities in Saudi Arabia
- Explain matching logic clearly
- Respond ONLY in valid JSON array format
- Generate exactly 8 prospects`;

export function buildProspectDiscoveryPrompt(ctx: PromptContext): string {
  return `Identify ideal prospect companies for this business:

What They Sell: ${ctx.whatTheySell}
Target Market: ${ctx.targetMarket}
Location: ${ctx.location}
Industry: ${ctx.industry || "General"}

Return JSON array of 8 objects:
[
  {
    "company_name": "Company name",
    "industry": "Industry sector",
    "fit_score": 92,
    "location": "City, Saudi Arabia",
    "why_they_match": "Detailed matching rationale"
  }
]`;
}

export const COMPETITOR_ANALYSIS_SYSTEM = `You are Taramiz Competitive Intelligence — analyzing competitive landscape in Saudi Arabia.

Rules:
- Identify realistic competitors in the Saudi market
- Provide actionable competitive advantages
- Be specific about strengths and weaknesses
- Respond ONLY in valid JSON array format
- Generate exactly 5 competitors`;

export function buildCompetitorAnalysisPrompt(ctx: PromptContext): string {
  return `Analyze the competitive landscape for:

What They Sell: ${ctx.whatTheySell}
Target Market: ${ctx.targetMarket}
Location: ${ctx.location}
Industry: ${ctx.industry || "General"}

Return JSON array of 5 objects:
[
  {
    "name": "Competitor name",
    "strength": "Key competitive strength",
    "weakness": "Exploitable weakness",
    "suggested_advantage": "How to win against this competitor"
  }
]`;
}

export const GROWTH_RECOMMENDATIONS_SYSTEM = `You are Taramiz Growth Intelligence — providing market insights and growth recommendations for Saudi businesses.

Rules:
- Focus on Saudi market trends, Vision 2030, and regional opportunities
- Provide actionable recommendations
- Respond ONLY in valid JSON array format
- Generate exactly 5 insights`;

export function buildGrowthRecommendationsPrompt(ctx: PromptContext): string {
  return `Provide market insights and growth recommendations for:

What They Sell: ${ctx.whatTheySell}
Target Market: ${ctx.targetMarket}
Location: ${ctx.location}
Industry: ${ctx.industry || "General"}

Return JSON array of 5 objects:
[
  {
    "market_trend": "Current market trend affecting this business",
    "recommended_action": "Specific action to take",
    "growth_opportunity": "Untapped growth opportunity"
  }
]`;
}

export interface GeneratedOpportunity {
  title: string;
  title_ar?: string;
  description: string;
  why_it_matches: string;
  revenue_potential: number;
  confidence_score: number;
  recommended_action: string;
}

export interface GeneratedProspect {
  company_name: string;
  industry: string;
  fit_score: number;
  location: string;
  why_they_match: string;
}

export interface GeneratedCompetitor {
  name: string;
  strength: string;
  weakness: string;
  suggested_advantage: string;
}

export interface GeneratedInsight {
  market_trend: string;
  recommended_action: string;
  growth_opportunity: string;
}
