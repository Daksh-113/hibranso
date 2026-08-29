import type { Metadata } from "next";
import Link from "next/link";
import { getAdminStats } from "@/lib/products";

export const metadata: Metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  const cards = [
    { label: "Total products", value: stats.totalProducts, href: "/admin/products" },
    { label: "Categories", value: stats.totalCategories, href: "/admin/categories" },
    { label: "Out of stock", value: stats.outOfStock, href: "/admin/products" },
    { label: "Featured", value: stats.featured, href: "/admin/products" },
  ];

  return (
    <div>
      <h1 className="font-serif-display text-3xl text-charcoal">Overview</h1>
      <p className="mt-2 text-sm text-stone">A quick snapshot of the Hibranso catalogue.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="border border-line bg-ivory p-6 transition-colors hover:border-gold"
          >
            <p className="text-3xl font-semibold text-charcoal">{card.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-stone">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/admin/products/new"
          className="bg-charcoal px-6 py-3 text-xs font-medium uppercase tracking-wide text-ivory hover:opacity-90"
        >
          + Add product
        </Link>
        <Link
          href="/admin/categories"
          className="border border-charcoal px-6 py-3 text-xs font-medium uppercase tracking-wide text-charcoal hover:bg-charcoal hover:text-ivory"
        >
          Manage categories
        </Link>
      </div>
    </div>
  );
}
