import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  discoverOpportunities,
  discoverProspects,
  analyzeCompetitors,
  generateInsights,
  calculateGrowthScore,
  FREE_OPPORTUNITY_LIMIT,
  LOCKED_OPPORTUNITIES_COUNT,
} from "@/lib/ai/engine";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { whatTheySell, targetMarket, location } = body;

    if (!whatTheySell || !targetMarket || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: company } = await supabase
      .from("companies")
      .select("*")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    const ctx = {
      companyName: company?.name,
      industry: company?.industry ?? undefined,
      whatTheySell,
      targetMarket,
      location,
      businessDescription: company?.description ?? undefined,
      targetCustomer: company?.target_customer ?? undefined,
    };

    const [opportunities, prospects, competitors, insights] = await Promise.all([
      discoverOpportunities(ctx),
      discoverProspects(ctx),
      analyzeCompetitors(ctx),
      generateInsights(ctx),
    ]);

    const growthScore = calculateGrowthScore(opportunities, prospects, competitors);

    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .insert({
        user_id: user.id,
        company_id: company?.id ?? null,
        what_they_sell: whatTheySell,
        target_market: targetMarket,
        location,
        status: "completed",
        growth_score: growthScore,
        total_opportunities: opportunities.length + LOCKED_OPPORTUNITIES_COUNT,
      })
      .select()
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json({ error: "Failed to save analysis" }, { status: 500 });
    }

    const opportunityRows = opportunities.map((opp, i) => ({
      analysis_id: analysis.id,
      user_id: user.id,
      title: opp.title,
      description: opp.description,
      why_it_matches: opp.why_it_matches,
      revenue_potential: opp.revenue_potential,
      confidence_score: opp.confidence_score,
      recommended_action: opp.recommended_action,
      is_locked: i >= FREE_OPPORTUNITY_LIMIT,
      sort_order: i,
    }));

    await supabase.from("opportunities").insert(opportunityRows);

    await supabase.from("prospects").insert(
      prospects.map((p) => ({
        user_id: user.id,
        analysis_id: analysis.id,
        company_name: p.company_name,
        industry: p.industry,
        fit_score: p.fit_score,
        location: p.location,
        why_they_match: p.why_they_match,
      }))
    );

    await supabase.from("competitors").insert(
      competitors.map((c) => ({
        user_id: user.id,
        analysis_id: analysis.id,
        name: c.name,
        strength: c.strength,
        weakness: c.weakness,
        suggested_advantage: c.suggested_advantage,
      }))
    );

    await supabase.from("insights").insert(
      insights.map((ins) => ({
        user_id: user.id,
        analysis_id: analysis.id,
        market_trend: ins.market_trend,
        recommended_action: ins.recommended_action,
        growth_opportunity: ins.growth_opportunity,
      }))
    );

    await supabase.from("usage_logs").insert({
      user_id: user.id,
      action: "analysis_completed",
      metadata: {
        analysis_id: analysis.id,
        opportunities: opportunities.length,
        prospects: prospects.length,
      },
    });

    return NextResponse.json({
      analysisId: analysis.id,
      growthScore,
      opportunitiesUnlocked: FREE_OPPORTUNITY_LIMIT,
      opportunitiesLocked: LOCKED_OPPORTUNITIES_COUNT,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
