import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, TrendingDown, TrendingUp, Zap } from "lucide-react";

export default async function CompetitorsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: competitors } = await supabase
    .from("competitors")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1115]">الموقف التنافسي</h1>
        <p className="text-[#0F1115]/50 mt-1">
          {competitors?.length ?? 0} منافس — مع ميزة واضحة للفوز بالصفقة
        </p>
      </div>

      {(!competitors || competitors.length === 0) && (
        <div className="rounded-xl border border-[#0E3B2E]/10 bg-white p-12 text-center">
          <p className="text-[#0F1115]/60">قم بإجراء تحليل لرؤية المنافسين</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {competitors?.map((comp) => (
          <Card key={comp.id} className="border-[#0E3B2E]/8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5 text-[#0E3B2E]" />
                {comp.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-700" />
                  <span className="text-xs font-medium text-green-700">نقاط القوة</span>
                </div>
                <p className="text-sm text-green-800">{comp.strength}</p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="h-4 w-4 text-red-700" />
                  <span className="text-xs font-medium text-red-700">نقاط الضعف</span>
                </div>
                <p className="text-sm text-red-800">{comp.weakness}</p>
              </div>
              <div className="rounded-lg border border-[#C8A96B]/30 bg-[#C8A96B]/5 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-[#C8A96B]" />
                  <span className="text-xs font-medium text-[#0E3B2E]">مزيتك المقترحة</span>
                </div>
                <p className="text-sm text-[#0F1115]/70">{comp.suggested_advantage}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
