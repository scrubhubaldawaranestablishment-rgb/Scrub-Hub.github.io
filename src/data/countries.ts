import type { Country } from "@/types";

export const COUNTRIES: Country[] = [
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", region: "Middle East" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", region: "Middle East" },
  { code: "QA", name: "Qatar", flag: "🇶🇦", region: "Middle East" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼", region: "Middle East" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭", region: "Middle East" },
  { code: "OM", name: "Oman", flag: "🇴🇲", region: "Middle East" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", region: "Middle East" },
  { code: "JO", name: "Jordan", flag: "🇯🇴", region: "Middle East" },
  { code: "US", name: "United States", flag: "🇺🇸", region: "Americas" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", region: "Europe" },
  { code: "FR", name: "France", flag: "🇫🇷", region: "Europe" },
  { code: "IT", name: "Italy", flag: "🇮🇹", region: "Europe" },
  { code: "JP", name: "Japan", flag: "🇯🇵", region: "Asia" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", region: "Asia" },
  { code: "IN", name: "India", flag: "🇮🇳", region: "Asia" },
  { code: "AU", name: "Australia", flag: "🇦🇺", region: "Oceania" },
  { code: "CA", name: "Canada", flag: "🇨🇦", region: "Americas" },
  { code: "DE", name: "Germany", flag: "🇩🇪", region: "Europe" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", region: "Americas" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", region: "Africa" },
];

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}
