import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OpportunityCard } from "@/components/dashboard/opportunity-card";
import { LOCKED_OPPORTUNITIES_COUNT } from "@/lib/ai/engine";
import { Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

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

  const unlockedValue = unlocked.reduce((s, o) => s + Number(o.revenue_potential), 0);
  const lockedValue = locked.reduce((s, o) => s + Number(o.revenue_potential), 0);
  const lockedCount = locked.length > 0 ? locked.length : LOCKED_OPPORTUNITIES_COUNT;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F1115]">فرصك — pipeline جاهز للمتابعة</h1>
        <p className="text-[#0F1115]/50 mt-1">
          {unlocked.length} صفقة مفتوحة بقيمة {formatCurrency(unlockedValue)}
        </p>
      </div>

      {unlocked.length > 0 && (
        <div className="rounded-xl border border-[#C8A96B]/30 bg-[#C8A96B]/8 px-5 py-4 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#0F1115]">
              تقريرك يحتوي {unlocked.length + lockedCount} فرصة — أنت ترى {unlocked.length} فقط
            </p>
            <p className="text-xs text-[#0F1115]/55 mt-1">
              Pipeline المقفل: {lockedValue > 0 ? formatCurrency(lockedValue) : "متاح في خطة النمو"}
            </p>
          </div>
          <Link href="/dashboard/settings">
            <Button variant="accent" size="sm" className="shrink-0">
              فتح {lockedCount} فرصة إضافية
            </Button>
          </Link>
        </div>
      )}

      {(!opportunities || opportunities.length === 0) && (
        <div className="rounded-xl border border-[#0E3B2E]/10 bg-white p-12 text-center">
          <p className="text-[#0F1115]/60 mb-2">لم تجرِ مسح سوق بعد</p>
          <p className="text-sm text-[#0F1115]/40 mb-6">صف نشاطك — واحصل على ٣ فرص مجاناً خلال دقيقتين</p>
          <Link href="/dashboard">
            <Button>ابدأ مسح السوق</Button>
          </Link>
        </div>
      )}

      {unlocked.length > 0 && (
        <>
          <p className="text-xs font-semibold text-[#0E3B2E] uppercase tracking-wider mb-4">
            فرصك المفتوحة — ابدأ المتابعة من #1
          </p>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
            {unlocked.map((opp, i) => (
              <OpportunityCard
                key={opp.id}
                rank={i + 1}
                title={opp.title}
                description={opp.description}
                whyItMatches={opp.why_it_matches}
                revenuePotential={Number(opp.revenue_potential)}
                confidenceScore={opp.confidence_score}
                recommendedAction={opp.recommended_action}
              />
            ))}
          </div>
        </>
      )}

      {locked.length > 0 && (
        <>
          <p className="text-xs font-semibold text-[#0F1115]/40 uppercase tracking-wider mb-4">
            باقي pipeline — متاح في خطة النمو
          </p>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                lockedRevenueHint={Number(opp.revenue_potential)}
              />
            ))}
          </div>

          <div className="mt-10 rounded-xl border border-[#0E3B2E]/12 bg-white p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#0E3B2E]/8 shrink-0">
                <Lock className="h-7 w-7 text-[#0E3B2E]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#0F1115] mb-1">
                  {lockedCount} فرصة إضافية — بقيمة pipeline {lockedValue > 0 ? formatCurrency(lockedValue) : "غير مفتوحة"}
                </h3>
                <p className="text-sm text-[#0F1115]/55 leading-relaxed">
                  التقرير الكامل جاهز. خطة النمو (٩٩٩ ر.س/شهر) تفتح كل الفرص مع مشترين محتملين وتنبيهات تنافسية.
                  <span className="block mt-1 text-[#0E3B2E] font-medium">
                    صفقة B2B واحدة في السعودية تغطي اشتراك ٨+ أشهر.
                  </span>
                </p>
              </div>
              <Link href="/dashboard/settings" className="shrink-0">
                <Button size="lg" variant="accent">
                  فتح التقرير الكامل
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
