import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Lightbulb, Rocket } from "lucide-react";

export default async function InsightsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: insights } = await supabase
    .from("insights")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1115]">إشارات السوق</h1>
        <p className="text-[#0F1115]/50 mt-1">
          اتجاهات قطاعك في السعودية — مع إجراء عملي
        </p>
      </div>

      {(!insights || insights.length === 0) && (
        <div className="rounded-xl border border-[#0E3B2E]/10 bg-white p-12 text-center">
          <p className="text-[#0F1115]/60">قم بإجراء تحليل للحصول على رؤى السوق</p>
        </div>
      )}

      <div className="space-y-6">
        {insights?.map((insight) => (
          <Card key={insight.id} className="border-[#0E3B2E]/8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-5 w-5 text-[#0E3B2E]" />
                Market Insight
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div className="rounded-lg bg-[#F8F7F3] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-[#0E3B2E]" />
                  <span className="text-xs font-medium text-[#0E3B2E]">اتجاه السوق</span>
                </div>
                <p className="text-sm text-[#0F1115]/70">{insight.market_trend}</p>
              </div>
              <div className="rounded-lg bg-[#0E3B2E]/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-[#0E3B2E]" />
                  <span className="text-xs font-medium text-[#0E3B2E]">الإجراء الموصى به</span>
                </div>
                <p className="text-sm text-[#0F1115]/70">{insight.recommended_action}</p>
              </div>
              <div className="rounded-lg bg-[#C8A96B]/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="h-4 w-4 text-[#C8A96B]" />
                  <span className="text-xs font-medium text-[#0E3B2E]">فرصة النمو</span>
                </div>
                <p className="text-sm text-[#0F1115]/70">{insight.growth_opportunity}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
