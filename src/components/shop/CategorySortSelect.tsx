"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "discount_desc", label: "Discount: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
];

export function CategorySortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSort = searchParams.get("sort") ?? "newest";

  return (
    <select
      value={activeSort}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", e.target.value);
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="border border-line bg-ivory px-4 py-2.5 text-sm outline-none focus:border-gold"
    >
      {sortOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
