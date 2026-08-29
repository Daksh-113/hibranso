import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hibranso — Premium Bags, Clothing & Lifestyle",
    template: "%s | Hibranso",
  },
  description:
    "Hibranso is a premium fashion and lifestyle brand offering bags, clothing and accessories. Browse the catalogue and order directly on WhatsApp.",
  openGraph: {
    title: "Hibranso — Premium Bags, Clothing & Lifestyle",
    description:
      "Discover Hibranso's curated collection of bags, clothing and lifestyle accessories. Order directly on WhatsApp — no checkout required.",
    siteName: "Hibranso",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hibranso — Premium Bags, Clothing & Lifestyle",
    description:
      "Discover Hibranso's curated collection of bags, clothing and lifestyle accessories.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-ivory text-charcoal">{children}</body>
    </html>
  );
}
