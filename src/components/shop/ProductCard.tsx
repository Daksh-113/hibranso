import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { PriceBlock } from "@/components/product/PriceBlock";
import { Badge } from "@/components/ui/Badge";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const images = product.product_images ?? [];
  const primaryImage = images[0];
  const secondaryImage = images[1];

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-cream">
        {primaryImage ? (
          <>
            <Image
              src={primaryImage.image_url}
              alt={primaryImage.alt_text ?? product.name}
              fill
              priority={priority}
              sizes="(min-width: 1280px) 22vw, (min-width: 768px) 33vw, 50vw"
              className="object-cover transition-opacity duration-500 group-hover:opacity-0"
            />
            {secondaryImage && (
              <Image
                src={secondaryImage.image_url}
                alt={secondaryImage.alt_text ?? product.name}
                fill
                sizes="(min-width: 1280px) 22vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-light">
            <span className="text-xs uppercase tracking-wider">No image</span>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.discount_percentage > 0 && <Badge tone="gold">{product.discount_percentage}% off</Badge>}
          {product.is_bestseller && <Badge tone="charcoal">Bestseller</Badge>}
        </div>

        {!product.is_available && (
          <div className="absolute inset-0 flex items-center justify-center bg-charcoal/50">
            <Badge tone="outline" className="border-ivory bg-ivory/90 text-charcoal">
              Sold Out
            </Badge>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1">
        {product.category?.name && (
          <p className="text-[11px] uppercase tracking-wider text-stone">{product.category.name}</p>
        )}
        <h3 className="font-serif-display text-base text-charcoal transition-colors group-hover:text-gold">
          {product.name}
        </h3>
        <PriceBlock
          mrp={product.mrp}
          sellingPrice={product.selling_price}
          discountPercentage={product.discount_percentage}
          size="sm"
        />
      </div>
    </Link>
  );
}
