import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scrub Hub",
  description: "Scrub Hub application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
