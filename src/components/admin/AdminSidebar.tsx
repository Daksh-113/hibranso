"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { logoutAction } from "@/lib/actions/auth";

const links = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
];

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-full flex-col justify-between border-r border-line bg-ivory p-6 lg:w-64">
      <div>
        <Link href="/admin" className="font-serif-display text-xl tracking-wordmark text-charcoal">
          HIBRANSO
        </Link>
        <p className="mt-1 text-xs uppercase tracking-wider text-stone">Admin</p>

        <nav className="mt-10 space-y-1">
          {links.map((link) => {
            const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "block px-3 py-2.5 text-sm transition-colors",
                  active ? "bg-charcoal text-ivory" : "text-charcoal hover:bg-charcoal/5"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-line pt-4">
        <p className="truncate text-xs text-stone" title={email}>
          {email}
        </p>
        <form action={logoutAction}>
          <button
            type="submit"
            className="mt-3 w-full border border-charcoal/30 py-2 text-xs uppercase tracking-wide text-charcoal transition-colors hover:bg-charcoal hover:text-ivory"
          >
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
