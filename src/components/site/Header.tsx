import Link from "next/link";
import { getCategories } from "@/lib/products";
import { getCurrentCustomer, getWishlistProductIds } from "@/lib/customer";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { Container } from "@/components/ui/Container";

export async function Header() {
  const [categories, customer] = await Promise.all([getCategories(), getCurrentCustomer()]);
  const wishlistCount = customer ? (await getWishlistProductIds(customer.id)).size : 0;
  const accountHref = customer ? "/account" : "/account/login";

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-ivory/95 backdrop-blur-md">
      <Container className="flex h-20 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-8 lg:flex">
          <Link
            href="/"
            className="font-serif-display text-sm uppercase tracking-[0.12em] text-charcoal/80 transition-colors hover:text-gold"
          >
            Home
          </Link>
          <Link
            href="/shop"
            className="font-serif-display text-sm uppercase tracking-[0.12em] text-charcoal/80 transition-colors hover:text-gold"
          >
            Shop
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="font-serif-display text-sm uppercase tracking-[0.12em] text-charcoal/80 transition-colors hover:text-gold"
            >
              {category.name}
            </Link>
          ))}
          <Link
            href="/about"
            className="font-serif-display text-sm uppercase tracking-[0.12em] text-charcoal/80 transition-colors hover:text-gold"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="font-serif-display text-sm uppercase tracking-[0.12em] text-charcoal/80 transition-colors hover:text-gold"
          >
            Contact
          </Link>
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <Link href="/shop" aria-label="Search products" className="text-charcoal transition-colors hover:text-gold">
            <SearchIcon />
          </Link>
          <Link href={accountHref} aria-label="Wishlist" className="relative text-charcoal transition-colors hover:text-gold">
            <HeartIcon />
            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-ivory">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link href={accountHref} aria-label="Account" className="text-charcoal transition-colors hover:text-gold">
            <UserIcon />
          </Link>
        </div>

        <MobileNav categories={categories} accountHref={accountHref} wishlistCount={wishlistCount} />
      </Container>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <circle cx="11" cy="11" r="7" strokeLinecap="round" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20.5s-7.5-4.6-10-9.2C.5 8.1 2 4.5 5.6 4c2.1-.3 4 .8 5 2.4C11.6 4.8 13.5 3.7 15.6 4c3.6.5 5.1 4.1 3.6 7.3-2.5 4.6-10 9.2-10 9.2Z"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <circle cx="12" cy="8" r="3.5" />
      <path strokeLinecap="round" d="M4.5 20c1.4-3.5 4.4-5.5 7.5-5.5s6.1 2 7.5 5.5" />
    </svg>
  );
}
