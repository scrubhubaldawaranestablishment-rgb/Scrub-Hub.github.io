import {
  BRANDS,
  COUNTRY_TRENDS,
  getBrandsByCountry as getStaticBrandsByCountry,
  getCountryTrends as getStaticCountryTrends,
} from "@/data/brands";
import { COUNTRIES } from "@/data/countries";
import { createSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import type { FashionBrand } from "@/types";

interface BrandRow {
  id: string;
  name: string;
  country_code: string;
  category: FashionBrand["category"];
  description: string;
  why_buy: string;
  price_range: FashionBrand["priceRange"];
  trending: boolean;
  website: string | null;
  outfit_style: string;
  color_palette: string[];
  tags: string[];
}

function mapBrandRow(row: BrandRow): FashionBrand {
  return {
    id: row.id,
    name: row.name,
    country: row.country_code,
    category: row.category,
    description: row.description,
    whyBuy: row.why_buy,
    priceRange: row.price_range,
    trending: row.trending,
    website: row.website ?? undefined,
    outfitStyle: row.outfit_style,
    colorPalette: row.color_palette,
    tags: row.tags,
  };
}

export async function getBrandsByCountry(countryCode: string): Promise<FashionBrand[]> {
  if (!isSupabaseConfigured()) {
    return getStaticBrandsByCountry(countryCode);
  }

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return getStaticBrandsByCountry(countryCode);
  }

  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("country_code", countryCode)
    .order("name");

  if (error || !data?.length) {
    return getStaticBrandsByCountry(countryCode);
  }

  return data.map((row) => mapBrandRow(row as BrandRow));
}

export async function getTrendingBrands(countryCode: string): Promise<FashionBrand[]> {
  const brands = await getBrandsByCountry(countryCode);
  return brands.filter((brand) => brand.trending);
}

export async function getCountryTrends(countryCode: string): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    return getStaticCountryTrends(countryCode);
  }

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return getStaticCountryTrends(countryCode);
  }

  const { data, error } = await supabase
    .from("country_trends")
    .select("trend")
    .eq("country_code", countryCode)
    .order("sort_order");

  if (error || !data?.length) {
    return getStaticCountryTrends(countryCode);
  }

  return data.map((row) => row.trend);
}

export async function seedSupabaseFromStaticData(): Promise<{
  countries: number;
  brands: number;
  trends: number;
}> {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const countryRows = COUNTRIES.map((country) => ({
    code: country.code,
    name: country.name,
    flag: country.flag,
    region: country.region,
  }));

  const { error: countriesError } = await supabase
    .from("countries")
    .upsert(countryRows, { onConflict: "code" });

  if (countriesError) {
    throw new Error(`Failed to seed countries: ${countriesError.message}`);
  }

  const brandRows = BRANDS.map((brand) => ({
    id: brand.id,
    name: brand.name,
    country_code: brand.country,
    category: brand.category,
    description: brand.description,
    why_buy: brand.whyBuy,
    price_range: brand.priceRange,
    trending: brand.trending,
    website: brand.website ?? null,
    outfit_style: brand.outfitStyle,
    color_palette: brand.colorPalette,
    tags: brand.tags,
  }));

  const { error: brandsError } = await supabase
    .from("brands")
    .upsert(brandRows, { onConflict: "id" });

  if (brandsError) {
    throw new Error(`Failed to seed brands: ${brandsError.message}`);
  }

  const trendRows = Object.entries(COUNTRY_TRENDS).flatMap(([countryCode, trends]) =>
    trends.map((trend, index) => ({
      country_code: countryCode,
      trend,
      sort_order: index,
    }))
  );

  const { error: deleteTrendsError } = await supabase
    .from("country_trends")
    .delete()
    .in("country_code", Object.keys(COUNTRY_TRENDS));

  if (deleteTrendsError) {
    throw new Error(`Failed to clear country trends: ${deleteTrendsError.message}`);
  }

  const { error: trendsError } = await supabase.from("country_trends").insert(trendRows);

  if (trendsError) {
    throw new Error(`Failed to seed country trends: ${trendsError.message}`);
  }

  return {
    countries: countryRows.length,
    brands: brandRows.length,
    trends: trendRows.length,
  };
}
