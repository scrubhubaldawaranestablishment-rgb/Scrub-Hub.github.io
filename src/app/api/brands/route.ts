import { NextResponse } from "next/server";
import { getBrandsByCountry, getCountryTrends, getTrendingBrands } from "@/data/brands";
import { getCountryByCode } from "@/data/countries";

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

  const brands = getBrandsByCountry(countryCode);
  const trending = getTrendingBrands(countryCode);
  const trends = getCountryTrends(countryCode);

  return NextResponse.json({
    country,
    brands,
    trending,
    trends,
    total: brands.length,
  });
}
