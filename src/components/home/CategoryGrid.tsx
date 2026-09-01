import Image from "next/image";
import Link from "next/link";
import type { CategoryWithPreview } from "@/lib/products";
import { Container } from "@/components/ui/Container";
import { Carousel } from "@/components/ui/Carousel";

const offsets = ["translate-y-0 rotate-0", "translate-y-6 -rotate-2", "-translate-y-2 rotate-2"];

export function CategoryGrid({ categories }: { categories: CategoryWithPreview[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="overflow-hidden py-20 sm:py-28">
      <Container>
        <div className="mb-16 flex flex-col items-center text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Shop by category</p>
          <h2 className="mt-3 font-serif-display text-3xl text-charcoal sm:text-4xl">Find your fit</h2>
        </div>

        <Carousel itemClassName="w-[58vw] sm:w-[34vw] md:w-[24vw] lg:w-[19vw]" className="px-2 py-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className={`group block bg-ivory p-2.5 pb-5 shadow-sm ring-1 ring-line/70 transition-transform duration-500 hover:-translate-y-1 hover:shadow-md ${offsets[index % offsets.length]}`}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-cream">
                {category.previewImage ? (
                  <Image
                    src={category.previewImage}
                    alt={category.name}
                    fill
                    sizes="(min-width: 1024px) 19vw, (min-width: 640px) 34vw, 58vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-charcoal to-charcoal-soft" />
                )}
              </div>
              <p className="mt-4 text-center font-serif-display text-lg text-charcoal">{category.name}</p>
              <p className="text-center text-[11px] uppercase tracking-wider text-stone">
                {category.productCount} {category.productCount === 1 ? "Piece" : "Pieces"}
              </p>
            </Link>
          ))}
        </Carousel>
      </Container>
    </section>
  );
}
