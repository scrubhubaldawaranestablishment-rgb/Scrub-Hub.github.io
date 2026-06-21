import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Building2, MapPin } from "lucide-react";

export default async function ProspectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: prospects } = await supabase
    .from("prospects")
    .select("*")
    .eq("user_id", user.id)
    .order("fit_score", { ascending: false });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1115]">العملاء المحتملون</h1>
        <p className="text-[#0F1115]/50 mt-1">
          {prospects?.length ?? 0} prospects identified by Taramiz Intelligence
        </p>
      </div>

      {(!prospects || prospects.length === 0) && (
        <div className="rounded-xl border border-[#0E3B2E]/10 bg-white p-12 text-center">
          <p className="text-[#0F1115]/60">قم بإجراء تحليل لاكتشاف العملاء المحتملين</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {prospects?.map((prospect) => (
          <Card key={prospect.id} className="border-[#0E3B2E]/8 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0E3B2E]/8">
                    <Building2 className="h-5 w-5 text-[#0E3B2E]" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{prospect.company_name}</CardTitle>
                    <p className="text-sm text-[#0F1115]/50">{prospect.industry}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-[#0E3B2E]">{prospect.fit_score}%</span>
                  <p className="text-xs text-[#0F1115]/40">Fit Score</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-[#0F1115]/60">
                <MapPin className="h-4 w-4" />
                {prospect.location}
              </div>
              <Progress value={prospect.fit_score} className="h-1.5" />
              <div className="rounded-lg bg-[#F8F7F3] p-3">
                <p className="text-xs font-medium text-[#0E3B2E] mb-1">لماذا يتطابقون</p>
                <p className="text-sm text-[#0F1115]/70">{prospect.why_they_match}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
