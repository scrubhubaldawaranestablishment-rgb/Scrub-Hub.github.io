import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "Taramiz | تراميز — Decode Growth",
  description:
    "AI Opportunity Intelligence Platform. Discover hidden sales opportunities, potential customers, and growth paths for Saudi businesses.",
  keywords: ["Taramiz", "تراميز", "Saudi Arabia", "AI", "Business Intelligence", "Opportunities"],
  openGraph: {
    title: "Taramiz — Decode Growth",
    description: "Discover Hidden Business Opportunities with AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${inter.variable} ${notoArabic.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
