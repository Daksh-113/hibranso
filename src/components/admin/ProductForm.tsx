"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { saveProductAction, type ProductFormState } from "@/lib/actions/products";
import { slugify } from "@/lib/slug";
import { calculateDiscountPercentage } from "@/lib/format";
import type { Category, Product } from "@/lib/types";

const initialState: ProductFormState = { error: null };

type ColorRow = { name: string; hex_code: string };

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: Product;
}) {
  const [state, formAction, pending] = useActionState(saveProductAction, initialState);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [mrp, setMrp] = useState(product?.mrp?.toString() ?? "");
  const [sellingPrice, setSellingPrice] = useState(product?.selling_price?.toString() ?? "");

  const [colors, setColors] = useState<ColorRow[]>(
    product?.product_colors?.map((c) => ({ name: c.name, hex_code: c.hex_code ?? "#000000" })) ?? []
  );
  const [removeImageIds, setRemoveImageIds] = useState<string[]>([]);

  const discount = calculateDiscountPercentage(Number(mrp) || 0, Number(sellingPrice) || 0);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function updateColor(index: number, updates: Partial<ColorRow>) {
    setColors((prev) => prev.map((c, i) => (i === index ? { ...c, ...updates } : c)));
  }

  return (
    <form action={formAction} className="max-w-3xl space-y-10">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="colors" value={JSON.stringify(colors)} />

      <section className="space-y-5">
        <h2 className="font-serif-display text-xl text-charcoal">Basic details</h2>

        <Field label="Product name" required>
          <input
            name="name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            className="w-full border border-line bg-ivory px-4 py-2.5 text-sm outline-none focus:border-gold"
          />
        </Field>

        <Field label="Slug (URL)" required hint="Used in the product page URL: /product/your-slug">
          <input
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            required
            className="w-full border border-line bg-ivory px-4 py-2.5 text-sm outline-none focus:border-gold"
          />
        </Field>

        <Field label="Category">
          <select name="category_id" defaultValue={product?.category_id ?? ""} className="w-full border border-line bg-ivory px-4 py-2.5 text-sm outline-none focus:border-gold">
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Description">
          <textarea
            name="description"
            defaultValue={product?.description ?? ""}
            rows={5}
            className="w-full border border-line bg-ivory px-4 py-2.5 text-sm outline-none focus:border-gold resize-y"
          />
        </Field>
      </section>

      <section className="space-y-5">
        <h2 className="font-serif-display text-xl text-charcoal">Pricing</h2>

        <div className="grid grid-cols-2 gap-4">
          <Field label="MRP (₹)" required>
            <input
              name="mrp"
              type="number"
              min={0}
              step="0.01"
              value={mrp}
              onChange={(e) => setMrp(e.target.value)}
              required
              className="w-full border border-line bg-ivory px-4 py-2.5 text-sm outline-none focus:border-gold"
            />
          </Field>
          <Field label="Selling price (₹)" required>
            <input
              name="selling_price"
              type="number"
              min={0}
              step="0.01"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              required
              className="w-full border border-line bg-ivory px-4 py-2.5 text-sm outline-none focus:border-gold"
            />
          </Field>
        </div>

        {discount > 0 && (
          <p className="text-sm font-medium text-success">
            Discount: {discount}% off (auto-calculated)
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="SKU">
            <input name="sku" defaultValue={product?.sku ?? ""} className="w-full border border-line bg-ivory px-4 py-2.5 text-sm outline-none focus:border-gold" />
          </Field>
          <Field label="Stock quantity">
            <input
              name="stock_quantity"
              type="number"
              min={0}
              defaultValue={product?.stock_quantity ?? ""}
              className="w-full border border-line bg-ivory px-4 py-2.5 text-sm outline-none focus:border-gold"
            />
          </Field>
        </div>

        <div className="flex flex-wrap gap-6 pt-2">
          <Checkbox name="is_available" label="Available for sale" defaultChecked={product?.is_available ?? true} />
          <Checkbox name="is_featured" label="Featured" defaultChecked={product?.is_featured ?? false} />
          <Checkbox name="is_bestseller" label="Bestseller" defaultChecked={product?.is_bestseller ?? false} />
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="font-serif-display text-xl text-charcoal">Sizes & colours</h2>

        <Field label="Sizes" hint="Comma-separated, e.g. S, M, L, XL">
          <input
            name="sizes"
            defaultValue={product?.product_sizes?.map((s) => s.size).join(", ") ?? ""}
            className="w-full border border-line bg-ivory px-4 py-2.5 text-sm outline-none focus:border-gold"
          />
        </Field>

        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-stone">Colours</p>
          <div className="space-y-2">
            {colors.map((color, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  value={color.name}
                  onChange={(e) => updateColor(index, { name: e.target.value })}
                  placeholder="Colour name"
                  className="w-full border border-line bg-ivory px-4 py-2.5 text-sm outline-none focus:border-gold"
                />
                <input
                  type="color"
                  value={color.hex_code}
                  onChange={(e) => updateColor(index, { hex_code: e.target.value })}
                  className="h-11 w-14 shrink-0 border border-line"
                />
                <button
                  type="button"
                  onClick={() => setColors((prev) => prev.filter((_, i) => i !== index))}
                  className="shrink-0 px-3 py-2 text-xs uppercase text-danger"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setColors((prev) => [...prev, { name: "", hex_code: "#000000" }])}
            className="mt-3 border border-charcoal/30 px-4 py-2 text-xs uppercase tracking-wide hover:bg-charcoal hover:text-ivory"
          >
            + Add colour
          </button>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="font-serif-display text-xl text-charcoal">Images</h2>

        {product?.product_images && product.product_images.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {product.product_images.map((image) => {
              const marked = removeImageIds.includes(image.id);
              return (
                <label key={image.id} className="relative block cursor-pointer">
                  <div className="relative aspect-square overflow-hidden border border-line">
                    <Image src={image.image_url} alt={image.alt_text ?? ""} fill className="object-cover" />
                    {marked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-danger/70 text-xs font-semibold text-ivory">
                        Will remove
                      </div>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    name="removeImageIds"
                    value={image.id}
                    checked={marked}
                    onChange={(e) =>
                      setRemoveImageIds((prev) =>
                        e.target.checked ? [...prev, image.id] : prev.filter((id) => id !== image.id)
                      )
                    }
                    className="absolute right-1 top-1 h-4 w-4 accent-danger"
                  />
                </label>
              );
            })}
          </div>
        )}

        <Field label="Upload new images" hint="You can select multiple files.">
          <input type="file" name="images" multiple accept="image/*" className="w-full border border-line bg-ivory px-4 py-2.5 text-sm outline-none focus:border-gold" />
        </Field>
      </section>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-charcoal px-8 py-3 text-sm font-medium uppercase tracking-wide text-ivory transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Saving…" : product ? "Save changes" : "Create product"}
      </button>

    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs uppercase tracking-wider text-stone">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-stone-light">{hint}</p>}
    </div>
  );
}

function Checkbox({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-charcoal">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-charcoal" />
      {label}
    </label>
  );
}
