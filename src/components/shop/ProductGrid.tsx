import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({
  products,
  priorityCount = 0,
  wishlistIds,
  isLoggedIn = false,
}: {
  products: Product[];
  priorityCount?: number;
  wishlistIds?: Set<string>;
  isLoggedIn?: boolean;
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
        <p className="font-serif-display text-xl text-charcoal">No products found</p>
        <p className="text-sm text-stone">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < priorityCount}
          isWishlisted={wishlistIds?.has(product.id) ?? false}
          isLoggedIn={isLoggedIn}
        />
      ))}
    </div>
  );
}
