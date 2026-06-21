import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

function getSupabase() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function normalizeWhatsApp(value: string): string {
  return value.replace(/\s+/g, "").replace(/^\+/, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, company_name, whatsapp, business_type, city } = body;

    if (!name?.trim() || !company_name?.trim() || !whatsapp?.trim() || !business_type?.trim() || !city?.trim()) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    const cleanedWhatsApp = normalizeWhatsApp(whatsapp);
    if (!/^966?\d{8,9}$/.test(cleanedWhatsApp) && !/^05\d{8}$/.test(cleanedWhatsApp)) {
      return NextResponse.json(
        { error: "رقم واتساب غير صالح — مثال: 0501234567 أو 966501234567" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const { error } = await supabase.from("demo_requests").insert({
      name: name.trim(),
      company_name: company_name.trim(),
      whatsapp: cleanedWhatsApp,
      business_type: business_type.trim(),
      city: city.trim(),
    });

    if (error) {
      console.error("demo_requests insert error:", error);
      return NextResponse.json({ error: "تعذر إرسال الطلب. حاول مرة أخرى." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("demo_requests API error:", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
