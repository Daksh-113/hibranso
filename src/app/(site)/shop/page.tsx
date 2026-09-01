import type { Metadata } from "next";
import { getCategories, getProducts, getPriceBounds } from "@/lib/products";
import { getCurrentCustomer, getWishlistProductIds } from "@/lib/customer";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Container } from "@/components/ui/Container";
import type { ShopSearchParams } from "@/lib/types";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Shop All Products",
  description: "Browse the full Hibranso catalogue of bags, clothing and lifestyle accessories.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const params = await searchParams;

  const [categories, products, priceBounds, customer] = await Promise.all([
    getCategories(),
    getProducts(params),
    getPriceBounds(),
    getCurrentCustomer(),
  ]);
  const wishlistIds = customer ? await getWishlistProductIds(customer.id) : undefined;

  return (
    <Container className="py-12 sm:py-16">
      <div className="mb-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">The full collection</p>
        <h1 className="mt-3 font-serif-display text-4xl text-charcoal sm:text-5xl">Shop</h1>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <ShopFilters categories={categories} priceBounds={priceBounds} />
        </aside>

        <div>
          <p className="mb-6 text-sm text-stone">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
          <ProductGrid
            products={products}
            priorityCount={4}
            wishlistIds={wishlistIds}
            isLoggedIn={Boolean(customer)}
          />
        </div>
      </div>
    </Container>
  );
}
