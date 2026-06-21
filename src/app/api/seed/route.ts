import { NextResponse } from "next/server";
import { seedSupabaseFromStaticData } from "@/lib/brands-service";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const secret = process.env.SUPABASE_SEED_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Seeding is disabled. Set SUPABASE_SEED_SECRET to enable." },
      { status: 403 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  try {
    const result = await seedSupabaseFromStaticData();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to seed Supabase",
      },
      { status: 500 }
    );
  }
}
