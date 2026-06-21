"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { INDUSTRIES, REVENUE_RANGES, TEAM_SIZES, SAUDI_CITIES } from "@/lib/data/constants";
import { Progress } from "@/components/ui/progress";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    website: "",
    description: "",
    industry: "",
    city: "",
    country: "Saudi Arabia",
    target_customer: "",
    monthly_revenue_range: "",
    team_size: "",
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error: companyError } = await supabase.from("companies").insert({
      user_id: user.id,
      name: form.name,
      website: form.website || null,
      description: form.description || null,
      industry: form.industry || null,
      city: form.city || null,
      country: form.country,
      target_customer: form.target_customer || null,
      monthly_revenue_range: form.monthly_revenue_range || null,
      team_size: form.team_size || null,
    });

    if (companyError) {
      console.error(companyError);
      setLoading(false);
      return;
    }

    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", user.id);

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7F3] px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0E3B2E]">
              <span className="text-sm font-bold text-[#C8A96B]">T</span>
            </div>
            <span className="text-xl font-semibold text-[#0F1115]">إعداد حسابك</span>
          </div>
          <Progress value={progress} className="h-1.5" />
          <p className="text-sm text-[#0F1115]/50 mt-2">Step {step} of {totalSteps}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "معلومات الشركة"}
              {step === 2 && "تفاصيل العمل"}
              {step === 3 && "السوق المستهدف"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Company Information"}
              {step === 2 && "Business Details"}
              {step === 3 && "Target Market"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label>اسم الشركة *</Label>
                  <Input
                    placeholder="شركة النجاح"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>الموقع الإلكتروني</Label>
                  <Input
                    placeholder="https://company.sa"
                    value={form.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>المدينة</Label>
                  <Select value={form.city} onValueChange={(v) => updateField("city", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المدينة" />
                    </SelectTrigger>
                    <SelectContent>
                      {SAUDI_CITIES.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label>الصناعة *</Label>
                  <Select value={form.industry} onValueChange={(v) => updateField("industry", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الصناعة" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind.value} value={ind.value}>
                          {ind.label_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>وصف العمل</Label>
                  <Textarea
                    placeholder="صف ما تقدمه شركتك..."
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>حجم الفريق</Label>
                  <Select value={form.team_size} onValueChange={(v) => updateField("team_size", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر حجم الفريق" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAM_SIZES.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label>العميل المستهدف</Label>
                  <Textarea
                    placeholder="من هم عملاؤك المثاليون؟"
                    value={form.target_customer}
                    onChange={(e) => updateField("target_customer", e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>نطاق الإيرادات الشهرية</Label>
                  <Select
                    value={form.monthly_revenue_range}
                    onValueChange={(v) => updateField("monthly_revenue_range", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النطاق" />
                    </SelectTrigger>
                    <SelectContent>
                      {REVENUE_RANGES.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                  السابق
                </Button>
              )}
              {step < totalSteps ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  className="flex-1"
                  disabled={step === 1 && !form.name}
                >
                  التالي
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="flex-1" disabled={loading}>
                  {loading ? "جاري الحفظ..." : "ابدأ التحليل"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
