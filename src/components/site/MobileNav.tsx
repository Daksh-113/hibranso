"use client";

import { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import type { Category } from "@/lib/types";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";

const staticLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function MobileNav({
  categories,
  accountHref,
  wishlistCount,
}: {
  categories: Category[];
  accountHref: string;
  wishlistCount: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[5px]"
      >
        <span
          className={clsx(
            "block h-px w-6 bg-charcoal transition-transform duration-300",
            open && "translate-y-[6.5px] rotate-45"
          )}
        />
        <span
          className={clsx(
            "block h-px w-6 bg-charcoal transition-opacity duration-200",
            open && "opacity-0"
          )}
        />
        <span
          className={clsx(
            "block h-px w-6 bg-charcoal transition-transform duration-300",
            open && "-translate-y-[6.5px] -rotate-45"
          )}
        />
      </button>

      <div
        className={clsx(
          "fixed inset-0 z-40 bg-ivory transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <nav className="flex h-full flex-col items-center justify-center gap-8 px-8">
          {staticLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="font-serif-display text-3xl text-charcoal"
            >
              {link.label}
            </Link>
          ))}

          {categories.length > 0 && (
            <div className="mt-4 flex flex-col items-center gap-4 border-t border-line pt-8">
              <span className="text-xs uppercase tracking-wider text-stone">Categories</span>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    onClick={() => setOpen(false)}
                    className="text-sm uppercase tracking-wide text-charcoal/80"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-6 border-t border-line pt-8">
            <Link href={accountHref} onClick={() => setOpen(false)} className="text-sm uppercase tracking-wide text-charcoal/80">
              Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
            </Link>
            <Link href={accountHref} onClick={() => setOpen(false)} className="text-sm uppercase tracking-wide text-charcoal/80">
              Account
            </Link>
          </div>

          <a
            href={buildGeneralWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-medium text-white"
          >
            Chat on WhatsApp
          </a>
        </nav>
      </div>
    </div>
  );
}
