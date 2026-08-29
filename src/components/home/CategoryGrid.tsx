import Image from "next/image";
import Link from "next/link";
import type { CategoryWithPreview } from "@/lib/products";
import { Container } from "@/components/ui/Container";

export function CategoryGrid({ categories }: { categories: CategoryWithPreview[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="mb-12 flex flex-col items-center text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Shop by category</p>
          <h2 className="mt-3 font-serif-display text-3xl text-charcoal sm:text-4xl">Find your fit</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group relative block aspect-[4/3] overflow-hidden bg-charcoal"
            >
              {category.previewImage ? (
                <Image
                  src={category.previewImage}
                  alt={category.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover opacity-70 transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-charcoal to-charcoal-soft" />
              )}
              <div className="absolute inset-0 bg-charcoal/30 transition-colors duration-500 group-hover:bg-charcoal/10" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-ivory">
                <h3 className="font-serif-display text-2xl sm:text-3xl">{category.name}</h3>
                <span className="text-xs uppercase tracking-wider text-ivory/70">
                  {category.productCount} {category.productCount === 1 ? "Piece" : "Pieces"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
