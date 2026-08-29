import type { Metadata } from "next";
import { getCategories } from "@/lib/products";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Add Product" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="font-serif-display text-3xl text-charcoal">Add product</h1>
      <div className="mt-8">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
