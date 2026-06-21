import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OpportunityCard } from "@/components/dashboard/opportunity-card";
import { LOCKED_OPPORTUNITIES_COUNT } from "@/lib/ai/engine";
import { Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function OpportunitiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: opportunities } = await supabase
    .from("opportunities")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });

  const unlocked = opportunities?.filter((o) => !o.is_locked) ?? [];
  const locked = opportunities?.filter((o) => o.is_locked) ?? [];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1115]">الفرص المكتشفة</h1>
        <p className="text-[#0F1115]/50 mt-1">
          {unlocked.length} opportunities unlocked · {LOCKED_OPPORTUNITIES_COUNT} additional available
        </p>
      </div>

      {(!opportunities || opportunities.length === 0) && (
        <div className="rounded-xl border border-[#0E3B2E]/10 bg-white p-12 text-center">
          <p className="text-[#0F1115]/60 mb-4">لم يتم إجراء أي تحليل بعد</p>
          <Link href="/dashboard">
            <Button>ابدأ تحليلك الأول</Button>
          </Link>
        </div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {unlocked.map((opp) => (
          <OpportunityCard
            key={opp.id}
            title={opp.title}
            description={opp.description}
            whyItMatches={opp.why_it_matches}
            revenuePotential={Number(opp.revenue_potential)}
            confidenceScore={opp.confidence_score}
            recommendedAction={opp.recommended_action}
          />
        ))}
        {locked.slice(0, 3).map((opp) => (
          <OpportunityCard
            key={opp.id}
            title={opp.title}
            description=""
            whyItMatches=""
            revenuePotential={0}
            confidenceScore={0}
            recommendedAction=""
            isLocked
          />
        ))}
      </div>

      {locked.length > 0 && (
        <div className="mt-8 rounded-xl border border-[#C8A96B]/30 bg-[#C8A96B]/5 p-8 text-center">
          <Lock className="h-8 w-8 text-[#C8A96B] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#0F1115] mb-2">
            {LOCKED_OPPORTUNITIES_COUNT} additional opportunities available
          </h3>
          <p className="text-[#0F1115]/60 mb-6">
            {LOCKED_OPPORTUNITIES_COUNT} فرصة إضافية متاحة — قم بالترقية لفتح جميع النتائج
          </p>
          <Link href="/dashboard/settings">
            <Button variant="accent" size="lg">
              ترقية إلى Growth — 999 SAR/month
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
