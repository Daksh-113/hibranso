"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { clsx } from "clsx";
import type { Category } from "@/lib/types";
import type { PriceBounds } from "@/lib/products";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "discount_desc", label: "Discount: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
];

export function ShopFilters({
  categories,
  priceBounds,
}: {
  categories: Category[];
  priceBounds: PriceBounds;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") ?? "");

  const activeCategory = searchParams.get("category") ?? "";
  const activeSort = searchParams.get("sort") ?? "newest";
  const inStockOnly = searchParams.get("availability") === "in_stock";

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          updateParams({ q: query || null });
        }}
      >
        <label htmlFor="shop-search" className="mb-2 block text-xs uppercase tracking-wider text-stone">
          Search
        </label>
        <div className="flex gap-2">
          <input
            id="shop-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full border border-line bg-ivory px-4 py-2.5 text-sm outline-none transition-colors focus:border-gold"
          />
          <button
            type="submit"
            className="shrink-0 border border-charcoal px-4 py-2.5 text-xs uppercase tracking-wide transition-colors hover:bg-charcoal hover:text-ivory"
          >
            Go
          </button>
        </div>
      </form>

      <div>
        <p className="mb-3 text-xs uppercase tracking-wider text-stone">Category</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateParams({ category: null })}
            className={clsx(
              "border px-3 py-1.5 text-xs uppercase tracking-wide transition-colors",
              activeCategory === ""
                ? "border-charcoal bg-charcoal text-ivory"
                : "border-line text-charcoal hover:border-charcoal"
            )}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => updateParams({ category: category.slug })}
              className={clsx(
                "border px-3 py-1.5 text-xs uppercase tracking-wide transition-colors",
                activeCategory === category.slug
                  ? "border-charcoal bg-charcoal text-ivory"
                  : "border-line text-charcoal hover:border-charcoal"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="shop-sort" className="mb-2 block text-xs uppercase tracking-wider text-stone">
          Sort by
        </label>
        <select
          id="shop-sort"
          value={activeSort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="w-full border border-line bg-ivory px-4 py-2.5 text-sm outline-none focus:border-gold"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          updateParams({ min: minPrice || null, max: maxPrice || null });
        }}
      >
        <p className="mb-2 text-xs uppercase tracking-wider text-stone">
          Price ({priceBounds.min}–{priceBounds.max})
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full border border-line bg-ivory px-3 py-2 text-sm outline-none focus:border-gold"
          />
          <span className="text-stone">–</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full border border-line bg-ivory px-3 py-2 text-sm outline-none focus:border-gold"
          />
          <button
            type="submit"
            className="shrink-0 border border-charcoal px-3 py-2 text-xs uppercase tracking-wide transition-colors hover:bg-charcoal hover:text-ivory"
          >
            Apply
          </button>
        </div>
      </form>

      <label className="flex cursor-pointer items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => updateParams({ availability: e.target.checked ? "in_stock" : null })}
          className="h-4 w-4 accent-charcoal"
        />
        In stock only
      </label>
    </div>
  );
}
