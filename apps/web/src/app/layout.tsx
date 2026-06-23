import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreatorPilot AI — Automated Faceless Shorts & TikTok",
  description:
    "AI-powered SaaS to automatically manage faceless YouTube Shorts and TikTok channels targeting US viewers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
