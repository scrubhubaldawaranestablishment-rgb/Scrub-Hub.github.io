import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MetricCard } from "@/components/dashboard/metric-card";
import { AnalysisForm } from "@/components/dashboard/analysis-form";
import { Target, DollarSign, Users, Shield, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

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
    { data: opportunities },
    { count: prospectCount },
    { count: competitorCount },
    { data: latestAnalysis },
    { data: company },
  ] = await Promise.all([
    supabase.from("opportunities").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_locked", false),
    supabase.from("opportunities").select("revenue_potential").eq("user_id", user.id).eq("is_locked", false),
    supabase.from("prospects").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("competitors").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("analyses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).single(),
    supabase.from("companies").select("*").eq("user_id", user.id).limit(1).single(),
  ]);

  const potentialRevenue = opportunities?.reduce(
    (sum, o) => sum + Number(o.revenue_potential),
    0
  ) ?? 0;

  const growthScore = latestAnalysis?.growth_score ?? 0;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1115]">
          مرحباً، {profile?.full_name || "مستخدم"}
        </h1>
        <p className="text-[#0F1115]/50 mt-1">
          {company?.name ? `${company.name} — ` : ""}لوحة ذكاء الفرص
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <MetricCard
          title="الفرص المكتشفة"
          value={opportunityCount ?? 0}
          icon={Target}
          trend="+3 this week"
        />
        <MetricCard
          title="الإيرادات المحتملة"
          value={formatCurrency(potentialRevenue)}
          icon={DollarSign}
        />
        <MetricCard
          title="العملاء المحتملون"
          value={prospectCount ?? 0}
          icon={Users}
        />
        <MetricCard
          title="تنبيهات المنافسين"
          value={competitorCount ?? 0}
          icon={Shield}
        />
        <MetricCard
          title="درجة النمو"
          value={`${growthScore}/100`}
          icon={TrendingUp}
          subtitle="Growth Score"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnalysisForm />
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-[#0E3B2E]/10 bg-white p-6">
            <h3 className="font-semibold text-[#0F1115] mb-4">حالة الذكاء</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#0F1115]/60">آخر تحليل</span>
                <span className="font-medium">
                  {latestAnalysis
                    ? new Date(latestAnalysis.created_at).toLocaleDateString("ar-SA")
                    : "لم يتم بعد"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#0F1115]/60">الفرص المقفلة</span>
                <span className="font-medium text-[#C8A96B]">127</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#0F1115]/60">الخطة</span>
                <span className="font-medium">Free</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
