"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INDUSTRIES, SAUDI_CITIES } from "@/lib/data/constants";
import { Loader2, CheckCircle2, MessageCircle } from "lucide-react";

const CITY_LABELS: Record<string, string> = {
  Riyadh: "الرياض",
  Jeddah: "جدة",
  Dammam: "الدمام",
  Khobar: "الخبر",
  Makkah: "مكة",
  Madinah: "المدينة",
  Tabuk: "تبوك",
  Abha: "أبها",
  Buraidah: "بريدة",
  Taif: "الطائف",
};

export function DemoRequestForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    company_name: "",
    whatsapp: "",
    business_type: "",
    city: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.business_type || !form.city) {
      setError("يرجى اختيار نوع النشاط والمدينة");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/demo-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "تعذر إرسال الطلب");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("تعذر الاتصال. تحقق من الإنترنت وحاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-[#0E3B2E]/15 bg-white p-10 text-center shadow-xl shadow-[#0E3B2E]/8">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#0E3B2E]/10">
          <CheckCircle2 className="h-8 w-8 text-[#0E3B2E]" />
        </div>
        <p className="text-lg font-semibold text-[#0F1115] leading-relaxed max-w-md mx-auto">
          تم استلام طلبك. سنرسل لك أول ٣ فرص مناسبة لنشاطك خلال ٢٤ ساعة.
        </p>
        <p className="text-sm text-[#0F1115]/45 mt-3">
          سنتواصل معك عبر واتساب على الرقم الذي أدخلته.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#0E3B2E]/12 bg-white p-8 shadow-xl shadow-[#0E3B2E]/8"
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="demo-name">الاسم *</Label>
          <Input
            id="demo-name"
            placeholder="محمد العتيبي"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="demo-company">اسم الشركة *</Label>
          <Input
            id="demo-company"
            placeholder="شركة النجاح للخدمات"
            value={form.company_name}
            onChange={(e) => setForm({ ...form, company_name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="demo-whatsapp">رقم واتساب *</Label>
          <div className="relative">
            <MessageCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0F1115]/35" />
            <Input
              id="demo-whatsapp"
              placeholder="05XXXXXXXX"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              required
              dir="ltr"
              className="pr-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>نوع النشاط *</Label>
          <Select
            value={form.business_type}
            onValueChange={(v) => setForm({ ...form, business_type: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع النشاط" />
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
          <Label>المدينة *</Label>
          <Select
            value={form.city}
            onValueChange={(v) => setForm({ ...form, city: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر المدينة" />
            </SelectTrigger>
            <SelectContent>
              {SAUDI_CITIES.map((city) => (
                <SelectItem key={city} value={city}>
                  {CITY_LABELS[city] || city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
      )}

      <Button type="submit" className="w-full mt-6 h-12 text-base gap-2" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            جاري الإرسال...
          </>
        ) : (
          "أرسل لي ٣ فرص مجانية"
        )}
      </Button>

      <p className="text-xs text-center text-[#0F1115]/40 mt-4">
        بدون بطاقة ائتمان · نرد خلال ٢٤ ساعة عبر واتساب
      </p>
    </form>
  );
}
