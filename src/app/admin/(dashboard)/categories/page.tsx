import type { Metadata } from "next";
import { getCategories } from "@/lib/products";
import { CategoriesManager } from "@/components/admin/CategoriesManager";

export const metadata: Metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="font-serif-display text-3xl text-charcoal">Categories</h1>
      <p className="mt-2 text-sm text-stone">
        Create, edit or remove product categories. Deleting a category does not delete its
        products — they simply become uncategorised.
      </p>

      <div className="mt-8">
        <CategoriesManager categories={categories} />
      </div>
    </div>
  );
}
