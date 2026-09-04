import type { Metadata } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.URL ||
  process.env.DEPLOY_PRIME_URL ||
  "https://akbarnurrizqi.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Akbar Nur Rizqi — Data & AI Portfolio",
  description:
    "Portfolio of Akbar Nur Rizqi, an AI engineer and data analyst working across machine learning, computer vision, OCR, and business intelligence.",
  keywords: [
    "Akbar Nur Rizqi",
    "Data Analyst",
    "Machine Learning Engineer",
    "AI Engineer",
    "Computer Vision",
    "Portfolio",
  ],
  authors: [{ name: "Akbar Nur Rizqi" }],
  icons: { icon: "/favicon.png" },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Akbar Nur Rizqi — Data & AI Portfolio",
    description:
      "Data analytics, machine learning, computer vision, and AI engineering projects.",
    siteName: "Akbar Nur Rizqi Portfolio",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Akbar Nur Rizqi — Data & AI Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Akbar Nur Rizqi — Data & AI Portfolio",
    description:
      "Data analytics, machine learning, computer vision, and AI engineering projects.",
    images: ["/og.png"],
  },
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
