import Link from "next/link";
import type { Product } from "@/lib/types";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/shop/ProductCard";

export function ProductRail({
  eyebrow,
  title,
  products,
  viewAllHref = "/shop",
}: {
  eyebrow: string;
  title: string;
  products: Product[];
  viewAllHref?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="mb-12 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
            <h2 className="mt-3 font-serif-display text-3xl text-charcoal sm:text-4xl">{title}</h2>
          </div>
          <Link
            href={viewAllHref}
            className="text-sm font-medium uppercase tracking-wide text-charcoal underline decoration-gold decoration-2 underline-offset-4 hover:text-gold"
          >
            View all
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
