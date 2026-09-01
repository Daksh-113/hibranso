import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getProducts, getAllCategorySlugs } from "@/lib/products";
import { getCurrentCustomer, getWishlistProductIds } from "@/lib/customer";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { CategorySortSelect } from "@/components/shop/CategorySortSelect";
import { Container } from "@/components/ui/Container";
import type { ProductSortOption } from "@/lib/types";

export const revalidate = 30;

export async function generateStaticParams() {
  const categories = await getAllCategorySlugs();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: category.name,
    description:
      category.description ?? `Shop Hibranso's ${category.name} collection — premium quality, honest pricing.`,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: ProductSortOption }>;
}) {
  const { slug } = await params;
  const { sort } = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [products, customer] = await Promise.all([
    getProducts({ category: slug, sort }),
    getCurrentCustomer(),
  ]);
  const wishlistIds = customer ? await getWishlistProductIds(customer.id) : undefined;

  return (
    <Container className="py-12 sm:py-16">
      <div className="mb-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Category</p>
        <h1 className="mt-3 font-serif-display text-4xl text-charcoal sm:text-5xl">{category.name}</h1>
        {category.description && (
          <p className="mx-auto mt-4 max-w-xl text-sm text-stone sm:text-base">{category.description}</p>
        )}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-stone">
          {products.length} {products.length === 1 ? "product" : "products"}
        </p>
        <CategorySortSelect />
      </div>

      <ProductGrid
        products={products}
        priorityCount={4}
        wishlistIds={wishlistIds}
        isLoggedIn={Boolean(customer)}
      />
    </Container>
  );
}
