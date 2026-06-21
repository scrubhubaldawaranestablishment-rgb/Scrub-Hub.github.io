"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PRICING_PLANS } from "@/lib/data/constants";
import { Check } from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState<{ full_name: string | null; email: string } | null>(null);
  const [subscription, setSubscription] = useState<{ plan: string } | null>(null);
  const [company, setCompany] = useState<{ name: string } | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: p }, { data: s }, { data: c }] = await Promise.all([
        supabase.from("profiles").select("full_name, email").eq("id", user.id).single(),
        supabase.from("subscriptions").select("plan").eq("user_id", user.id).single(),
        supabase.from("companies").select("name").eq("user_id", user.id).limit(1).single(),
      ]);

      setProfile(p);
      setSubscription(s);
      setCompany(c);
    }
    load();
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1115]">الإعدادات والاشتراك</h1>
        <p className="text-[#0F1115]/50 mt-1">اختر الخطة حسب حجم pipeline الذي تحتاجه</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">معلومات الحساب</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#0F1115]/50">الاسم</span>
              <span className="font-medium">{profile?.full_name || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#0F1115]/50">البريد</span>
              <span className="font-medium" dir="ltr">{profile?.email || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#0F1115]/50">الشركة</span>
              <span className="font-medium">{company?.name || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#0F1115]/50">الخطة الحالية</span>
              <span className="font-medium capitalize">{subscription?.plan || "free"}</span>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-lg font-semibold mb-2">ترقية pipeline</h2>
          <p className="text-sm text-[#0F1115]/50 mb-4">
            صفقة B2B واحدة تغطي اشتراكك لأشهر — اختر حسب حجم فريق المبيعات
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {PRICING_PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={plan.popular ? "border-[#0E3B2E] ring-1 ring-[#0E3B2E]" : ""}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{plan.name_ar}</CardTitle>
                  <p className="text-2xl font-bold text-[#0E3B2E]">
                    {plan.price} <span className="text-sm font-normal text-[#0F1115]/50">SAR</span>
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {plan.features_ar.slice(0, 3).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-[#0F1115]/70">
                        <Check className="h-3 w-3 text-[#0E3B2E] mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    size="sm"
                  >
                    {subscription?.plan === plan.id ? "الخطة الحالية" : "اختر"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
