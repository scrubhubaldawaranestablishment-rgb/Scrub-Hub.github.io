"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export function AnalysisForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    whatTheySell: "",
    targetMarket: "",
    location: "Riyadh, Saudi Arabia",
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
    <Card className="border-[#0E3B2E]/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#C8A96B]" />
          محرك تحليل الفرص
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="space-y-2">
            <Label>ماذا تبيع؟ *</Label>
            <Textarea
              placeholder="مثال: خدمات غسيل تجاري للفنادق والمستشفيات"
              value={form.whatTheySell}
              onChange={(e) => setForm({ ...form, whatTheySell: e.target.value })}
              required
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>السوق المستهدف *</Label>
            <Input
              placeholder="مثال: الفنادق، المستشفيات، المرافق التجارية"
              value={form.targetMarket}
              onChange={(e) => setForm({ ...form, targetMarket: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>الموقع *</Label>
            <Input
              placeholder="مثال: الرياض، المملكة العربية السعودية"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
            />
          </div>
          <Button type="submit" className="w-full gap-2" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري التحليل...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                ابدأ التحليل
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
