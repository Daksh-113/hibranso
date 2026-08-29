import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAdminProducts, getCategories } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export const metadata: Metadata = { title: "Products" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const { q, category, page } = await searchParams;
  const currentPage = Number(page) > 0 ? Number(page) : 1;

  const [{ products, total }, categories] = await Promise.all([
    getAdminProducts({ q, category, page: currentPage, pageSize: PAGE_SIZE }),
    getCategories(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    params.set("page", String(targetPage));
    return `/admin/products?${params.toString()}`;
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif-display text-3xl text-charcoal">Products</h1>
          <p className="mt-1 text-sm text-stone">{total} total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center bg-charcoal px-6 py-3 text-xs font-medium uppercase tracking-wide text-ivory hover:opacity-90"
        >
          + Add product
        </Link>
      </div>

      <form className="mt-8 flex flex-wrap gap-3" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by name…"
          className="min-w-[220px] flex-1 border border-line bg-ivory px-4 py-2.5 text-sm outline-none focus:border-gold"
        />
        <select
          name="category"
          defaultValue={category ?? ""}
          className="border border-line bg-ivory px-4 py-2.5 text-sm outline-none focus:border-gold"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="border border-charcoal px-5 py-2.5 text-xs uppercase tracking-wide hover:bg-charcoal hover:text-ivory"
        >
          Filter
        </button>
      </form>

      <div className="mt-8 overflow-x-auto border border-line">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line bg-ivory text-xs uppercase tracking-wider text-stone">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-cream">
                      {product.product_images?.[0] && (
                        <Image
                          src={product.product_images[0].image_url}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-charcoal">{product.name}</p>
                      <p className="text-xs text-stone">{product.sku ?? "—"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-stone">{product.category?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <p className="text-charcoal">{formatPrice(product.selling_price)}</p>
                  {product.discount_percentage > 0 && (
                    <p className="text-xs text-stone line-through">{formatPrice(product.mrp)}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone={product.is_available ? "success" : "danger"}>
                      {product.is_available ? "In stock" : "Sold out"}
                    </Badge>
                    {product.is_featured && <Badge tone="gold">Featured</Badge>}
                    {product.is_bestseller && <Badge tone="charcoal">Bestseller</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-xs uppercase tracking-wide text-charcoal underline underline-offset-4"
                    >
                      Edit
                    </Link>
                    <DeleteProductButton id={product.id} name={product.name} />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-stone">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4 text-sm">
          <Link
            href={pageHref(Math.max(1, currentPage - 1))}
            className={currentPage <= 1 ? "pointer-events-none text-stone-light" : "text-charcoal underline"}
          >
            Previous
          </Link>
          <span className="text-stone">
            Page {currentPage} of {totalPages}
          </span>
          <Link
            href={pageHref(Math.min(totalPages, currentPage + 1))}
            className={currentPage >= totalPages ? "pointer-events-none text-stone-light" : "text-charcoal underline"}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
