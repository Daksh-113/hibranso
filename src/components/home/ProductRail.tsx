import Link from "next/link";
import type { Product } from "@/lib/types";
import { Container } from "@/components/ui/Container";
import { Carousel } from "@/components/ui/Carousel";
import { ProductCard } from "@/components/shop/ProductCard";

export function ProductRail({
  eyebrow,
  title,
  products,
  wishlistIds,
  isLoggedIn = false,
  viewAllHref = "/shop",
}: {
  eyebrow: string;
  title: string;
  products: Product[];
  wishlistIds?: Set<string>;
  isLoggedIn?: boolean;
  viewAllHref?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
          <h2 className="mt-3 font-serif-display text-3xl text-charcoal sm:text-4xl">{title}</h2>
        </div>

        <Carousel itemClassName="w-[62vw] sm:w-[38vw] md:w-[28vw] lg:w-[22vw]">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={wishlistIds?.has(product.id) ?? false}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </Carousel>

        <div className="mt-12 flex justify-center">
          <Link
            href={viewAllHref}
            className="inline-flex items-center justify-center bg-charcoal px-10 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-ivory transition-opacity hover:opacity-90"
          >
            View All
          </Link>
        </div>
      </Container>
    </section>
  );
}
