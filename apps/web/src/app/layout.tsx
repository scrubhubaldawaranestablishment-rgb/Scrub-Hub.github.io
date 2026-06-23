import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "VidEdge - All-In-One Tool For Faceless Creators",
  description: "Scripts, thumbnails, AI video editor, channel analytics, and production board — every tool you need to grow a faceless channel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full font-sans antialiased bg-white text-slate-900">{children}</body>
    </html>
  );
}
