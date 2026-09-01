import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, getAllProductSlugs, getRelatedProducts } from "@/lib/products";
import { getCurrentCustomer, getWishlistProductIds } from "@/lib/customer";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ImageGallery } from "@/components/product/ImageGallery";
import { PriceBlock } from "@/components/product/PriceBlock";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { WishlistButton } from "@/components/product/WishlistButton";
import { ProductGrid } from "@/components/shop/ProductGrid";

export const revalidate = 30;

export async function generateStaticParams() {
  const products = await getAllProductSlugs();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const description =
    product.description?.slice(0, 155) ??
    `${product.name} — available now at Hibranso. Order directly on WhatsApp.`;
  const image = product.product_images?.[0]?.image_url;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      images: image ? [{ url: image }] : undefined,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, customer] = await Promise.all([
    getRelatedProducts(product.category_id, product.id, 4),
    getCurrentCustomer(),
  ]);
  const wishlistIds = customer ? await getWishlistProductIds(customer.id) : undefined;
  const isLoggedIn = Boolean(customer);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.product_images?.map((image) => image.image_url) ?? [],
    sku: product.sku ?? undefined,
    category: product.category?.name ?? undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.selling_price,
      availability: product.is_available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <Container className="py-10 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-8 flex flex-wrap items-center gap-1 text-xs uppercase tracking-wide text-stone">
        <Link href="/" className="hover:text-charcoal">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-charcoal">
          Shop
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/category/${product.category.slug}`} className="hover:text-charcoal">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-charcoal">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <ImageGallery images={product.product_images ?? []} productName={product.name} />

        <div>
          {product.category && (
            <Link
              href={`/category/${product.category.slug}`}
              className="text-xs uppercase tracking-wider text-gold"
            >
              {product.category.name}
            </Link>
          )}
          <div className="flex items-start justify-between gap-4">
            <h1 className="mt-2 font-serif-display text-3xl text-charcoal sm:text-4xl">{product.name}</h1>
            <WishlistButton
              productId={product.id}
              initialWishlisted={wishlistIds?.has(product.id) ?? false}
              isLoggedIn={isLoggedIn}
              className="mt-2 shrink-0 border border-line"
            />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <PriceBlock
              mrp={product.mrp}
              sellingPrice={product.selling_price}
              discountPercentage={product.discount_percentage}
              size="lg"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {product.is_bestseller && <Badge tone="charcoal">Bestseller</Badge>}
            {product.is_featured && <Badge tone="gold">Featured</Badge>}
            <Badge tone={product.is_available ? "success" : "danger"}>
              {product.is_available ? "In Stock" : "Sold Out"}
            </Badge>
          </div>

          {product.description && (
            <p className="mt-6 max-w-prose text-sm leading-relaxed text-stone sm:text-base">
              {product.description}
            </p>
          )}

          <div className="mt-8 border-t border-line pt-8">
            <ProductPurchasePanel
              product={product}
              sizes={product.product_sizes ?? []}
              colors={product.product_colors ?? []}
              customerName={customer?.profile?.name ?? null}
            />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 font-serif-display text-2xl text-charcoal sm:text-3xl">You may also like</h2>
          <ProductGrid products={related} wishlistIds={wishlistIds} isLoggedIn={isLoggedIn} />
        </section>
      )}
    </Container>
  );
}
