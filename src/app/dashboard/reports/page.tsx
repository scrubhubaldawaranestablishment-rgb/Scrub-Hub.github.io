import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: analyses } = await supabase
    .from("analyses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1115]">التقارير</h1>
        <p className="text-[#0F1115]/50 mt-1">Analysis reports and intelligence summaries</p>
      </div>

      {(!analyses || analyses.length === 0) && (
        <div className="rounded-xl border border-[#0E3B2E]/10 bg-white p-12 text-center">
          <FileText className="h-12 w-12 text-[#0E3B2E]/20 mx-auto mb-4" />
          <p className="text-[#0F1115]/60">No reports yet. Run your first analysis to generate a report.</p>
        </div>
      )}

      <div className="space-y-4">
        {analyses?.map((analysis) => (
          <Card key={analysis.id} className="border-[#0E3B2E]/8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#0E3B2E]" />
                  Intelligence Report — {company?.name || "Analysis"}
                </CardTitle>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-[#0F1115]/50">Date</p>
                  <p className="font-medium">
                    {new Date(analysis.created_at).toLocaleDateString("ar-SA")}
                  </p>
                </div>
                <div>
                  <p className="text-[#0F1115]/50">Opportunities</p>
                  <p className="font-medium">{analysis.total_opportunities}</p>
                </div>
                <div>
                  <p className="text-[#0F1115]/50">Growth Score</p>
                  <p className="font-medium">{analysis.growth_score}/100</p>
                </div>
                <div>
                  <p className="text-[#0F1115]/50">Market</p>
                  <p className="font-medium truncate">{analysis.target_market}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#0E3B2E]/8">
                <p className="text-sm text-[#0F1115]/60">
                  <span className="font-medium">Product:</span> {analysis.what_they_sell}
                </p>
                <p className="text-sm text-[#0F1115]/60 mt-1">
                  <span className="font-medium">Location:</span> {analysis.location}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
