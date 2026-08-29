import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getProductById } from "@/lib/products";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Edit Product" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [categories, product] = await Promise.all([getCategories(), getProductById(id)]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="font-serif-display text-3xl text-charcoal">Edit product</h1>
      <div className="mt-8">
        <ProductForm categories={categories} product={product} />
      </div>
    </div>
  );
}
