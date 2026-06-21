import { NextResponse } from "next/server";
import {
  getBrandsByCountry,
  getCountryTrends,
  getTrendingBrands,
} from "@/lib/brands-service";
import { getCountryByCode } from "@/data/countries";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get("country");

  if (!countryCode) {
    return NextResponse.json(
      { error: "Country code is required" },
      { status: 400 }
    );
  }

  const country = getCountryByCode(countryCode);
  if (!country) {
    return NextResponse.json({ error: "Country not found" }, { status: 404 });
  }

  const [brands, trending, trends] = await Promise.all([
    getBrandsByCountry(countryCode),
    getTrendingBrands(countryCode),
    getCountryTrends(countryCode),
  ]);

  return NextResponse.json({
    country,
    brands,
    trending,
    trends,
    total: brands.length,
    source: isSupabaseConfigured() ? "supabase" : "static",
  });
}
