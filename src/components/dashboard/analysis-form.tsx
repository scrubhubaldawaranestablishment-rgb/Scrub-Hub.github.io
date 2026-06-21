"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export function AnalysisForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    whatTheySell: "",
    targetMarket: "",
    location: "الرياض، المملكة العربية السعودية",
  });

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/dashboard/opportunities");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-[#0E3B2E]/10 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#0F1115]">
          <Search className="h-5 w-5 text-[#C8A96B]" />
          مسح السوق — ابحث عن صفقاتك القادمة
        </CardTitle>
        <CardDescription>
          النتيجة: فرص مرتبة بقيمة الإيراد + مشترين محتملين + موقفك التنافسي
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="space-y-2">
            <Label>ماذا تبيع؟ *</Label>
            <Textarea
              placeholder="مثال: عقود صيانة دورية للمباني التجارية والمجمعات الصناعية"
              value={form.whatTheySell}
              onChange={(e) => setForm({ ...form, whatTheySell: e.target.value })}
              required
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>من هو مشتريك المثالي؟ *</Label>
            <Input
              placeholder="مثال: مطوري عقارات، سلاسل فنادق، مستشفيات خاصة"
              value={form.targetMarket}
              onChange={(e) => setForm({ ...form, targetMarket: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>المنطقة الجغرافية *</Label>
            <Input
              placeholder="مثال: الرياض، المملكة العربية السعودية"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
            />
          </div>
          <Button type="submit" className="w-full gap-2 h-12" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري مسح السوق...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                ابدأ المسح — ٣ فرص مجاناً
              </>
            )}
          </Button>
          <p className="text-xs text-center text-[#0F1115]/40">
            يستغرق أقل من دقيقتين · بدون بطاقة ائتمان
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
