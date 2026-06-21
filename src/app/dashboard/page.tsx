import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MetricCard } from "@/components/dashboard/metric-card";
import { AnalysisForm } from "@/components/dashboard/analysis-form";
import { Target, DollarSign, Users, Shield, TrendingUp, Lock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { LOCKED_OPPORTUNITIES_COUNT } from "@/lib/ai/engine";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  const [
    { count: opportunityCount },
    { data: unlockedOpps },
    { data: lockedOpps },
    { count: prospectCount },
    { count: competitorCount },
    { data: latestAnalysis },
    { data: company },
  ] = await Promise.all([
    supabase.from("opportunities").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_locked", false),
    supabase.from("opportunities").select("revenue_potential, confidence_score").eq("user_id", user.id).eq("is_locked", false),
    supabase.from("opportunities").select("revenue_potential").eq("user_id", user.id).eq("is_locked", true),
    supabase.from("prospects").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("competitors").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("analyses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("companies").select("*").eq("user_id", user.id).limit(1).maybeSingle(),
  ]);

  const pipelineValue = unlockedOpps?.reduce(
    (sum, o) => sum + Number(o.revenue_potential),
    0
  ) ?? 0;

  const lockedPipelineValue = lockedOpps?.reduce(
    (sum, o) => sum + Number(o.revenue_potential),
    0
  ) ?? 0;

  const avgDealSize = opportunityCount && opportunityCount > 0
    ? pipelineValue / opportunityCount
    : 0;

  const avgConfidence = unlockedOpps?.length
    ? Math.round(unlockedOpps.reduce((s, o) => s + o.confidence_score, 0) / unlockedOpps.length)
    : 0;

  const growthScore = latestAnalysis?.growth_score ?? 0;
  const hasAnalysis = !!latestAnalysis;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1115]">
          {company?.name || profile?.full_name || "مرحباً"}
        </h1>
        <p className="text-[#0F1115]/50 mt-1">
          لوحة pipeline — {hasAnalysis ? "ملخص آخر مسح سوق" : "ابدأ أول مسح لرؤية قيمة الفرص"}
        </p>
      </div>

      {hasAnalysis && (
        <div className="rounded-xl border border-[#0E3B2E]/12 bg-[#0E3B2E] text-white p-6 mb-6 grid sm:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-white/50 mb-1">Pipeline المفتوح</p>
            <p className="text-2xl font-bold text-[#C8A96B] tabular-nums">{formatCurrency(pipelineValue)}</p>
            <p className="text-xs text-white/40 mt-1">{opportunityCount ?? 0} فرصة جاهزة للمتابعة</p>
          </div>
          <div>
            <p className="text-xs text-white/50 mb-1">Pipeline غير المفتوح</p>
            <p className="text-2xl font-bold text-white/80 tabular-nums">
              {lockedPipelineValue > 0 ? formatCurrency(lockedPipelineValue) : "—"}
            </p>
            <p className="text-xs text-white/40 mt-1">
              {lockedOpps?.length ?? LOCKED_OPPORTUNITIES_COUNT} فرصة في خطة النمو
            </p>
          </div>
          <div className="flex flex-col justify-center sm:items-end">
            <Link href="/dashboard/settings">
              <Button variant="accent" size="sm">
                فتح pipeline كامل — ٩٩٩ ر.س/شهر
              </Button>
            </Link>
            <p className="text-[10px] text-white/35 mt-2 sm:text-left">
              صفقة واحدة تغطي ٨+ أشهر
            </p>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <MetricCard
          title="صفقات جاهزة"
          value={opportunityCount ?? 0}
          icon={Target}
          subtitle={avgConfidence ? `متوسط احتمال الإغلاق ${avgConfidence}%` : undefined}
        />
        <MetricCard
          title="قيمة Pipeline"
          value={formatCurrency(pipelineValue)}
          icon={DollarSign}
          subtitle={avgDealSize > 0 ? `متوسط الصفقة ${formatCurrency(avgDealSize)}` : "ابدأ مسح السوق"}
          highlight
        />
        <MetricCard
          title="مشترين محتملين"
          value={prospectCount ?? 0}
          icon={Users}
          subtitle="جهات B2B للمتابعة"
        />
        <MetricCard
          title="منافسون مرصودون"
          value={competitorCount ?? 0}
          icon={Shield}
          subtitle="مع ميزة تنافسية"
        />
        <MetricCard
          title="جاهزية النمو"
          value={`${growthScore}/100`}
          icon={TrendingUp}
          subtitle="مؤشر قوة الفرص"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnalysisForm />
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-[#0E3B2E]/10 bg-white p-6">
            <h3 className="font-semibold text-[#0F1115] mb-4">ملخص القيمة</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#0F1115]/55">آخر مسح</span>
                <span className="font-medium tabular-nums">
                  {latestAnalysis
                    ? new Date(latestAnalysis.created_at).toLocaleDateString("ar-SA")
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#0F1115]/55">فرص مفتوحة</span>
                <span className="font-medium text-[#0E3B2E]">{opportunityCount ?? 0} / 130</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#0F1115]/55 flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  pipeline مقفل
                </span>
                <span className="font-medium text-[#C8A96B] tabular-nums">
                  {lockedPipelineValue > 0 ? formatCurrency(lockedPipelineValue) : `${LOCKED_OPPORTUNITIES_COUNT} فرصة`}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-[#0E3B2E]/8">
                <span className="text-[#0F1115]/55">خطتك</span>
                <span className="font-medium">مجانية — ٣ فرص/مسح</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
