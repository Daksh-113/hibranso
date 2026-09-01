import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCategoryBySlug,
  getCategoryById,
  getSubcategories,
  getProducts,
  getAllCategorySlugs,
} from "@/lib/products";
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

  const [products, customer, subcategories, parentCategory] = await Promise.all([
    getProducts({ category: slug, sort }),
    getCurrentCustomer(),
    category.parent_id ? Promise.resolve([]) : getSubcategories(category.id),
    category.parent_id ? getCategoryById(category.parent_id) : Promise.resolve(null),
  ]);
  const wishlistIds = customer ? await getWishlistProductIds(customer.id) : undefined;
  const siblings = parentCategory ? await getSubcategories(parentCategory.id) : [];

  return (
    <Container className="py-12 sm:py-16">
      <div className="mb-10 text-center">
        {parentCategory ? (
          <p className="text-xs uppercase tracking-[0.3em] text-gold">
            <Link href={`/category/${parentCategory.slug}`} className="hover:text-charcoal">
              {parentCategory.name}
            </Link>
            {" / "}
            {category.name}
          </p>
        ) : (
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Category</p>
        )}
        <h1 className="mt-3 font-serif-display text-4xl text-charcoal sm:text-5xl">{category.name}</h1>
        {category.description && (
          <p className="mx-auto mt-4 max-w-xl text-sm text-stone sm:text-base">{category.description}</p>
        )}
      </div>

      {(subcategories.length > 0 || siblings.length > 0) && (
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {parentCategory && (
            <Link
              href={`/category/${parentCategory.slug}`}
              className="border border-charcoal bg-charcoal px-4 py-2 text-xs uppercase tracking-wide text-ivory"
            >
              All {parentCategory.name}
            </Link>
          )}
          {(subcategories.length > 0 ? subcategories : siblings).map((item) => (
            <Link
              key={item.id}
              href={`/category/${item.slug}`}
              className={
                item.id === category.id
                  ? "border border-charcoal bg-charcoal px-4 py-2 text-xs uppercase tracking-wide text-ivory"
                  : "border border-line px-4 py-2 text-xs uppercase tracking-wide text-charcoal transition-colors hover:border-charcoal"
              }
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}

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
