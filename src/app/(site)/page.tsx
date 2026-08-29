import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductRail } from "@/components/home/ProductRail";
import { PromoBanner } from "@/components/home/PromoBanner";
import { AboutTeaser } from "@/components/home/AboutTeaser";
import {
  getCategoriesWithPreview,
  getFeaturedProducts,
  getBestsellerProducts,
} from "@/lib/products";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Hibranso — Premium Bags, Clothing & Lifestyle",
  description:
    "Shop Hibranso's curated collection of premium bags, clothing and lifestyle accessories. Browse by category and order directly on WhatsApp.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [categories, featured, bestsellers] = await Promise.all([
    getCategoriesWithPreview(),
    getFeaturedProducts(8),
    getBestsellerProducts(8),
  ]);

  return (
    <>
      <Hero />
      <CategoryGrid categories={categories} />
      <ProductRail eyebrow="Handpicked" title="Featured Products" products={featured} />
      <PromoBanner />
      <ProductRail eyebrow="Customer favourites" title="Best Sellers" products={bestsellers} />
      <AboutTeaser />
    </>
  );
}
