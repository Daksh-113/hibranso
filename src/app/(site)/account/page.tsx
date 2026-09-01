import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentCustomer, getWishlistProducts } from "@/lib/customer";
import { signOutCustomerAction } from "@/lib/actions/customerAuth";
import { ProfileForm } from "@/components/account/ProfileForm";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/account/login?next=/account");

  const wishlistProducts = await getWishlistProducts(customer.id);
  const wishlistIds = new Set(wishlistProducts.map((product) => product.id));

  return (
    <Container className="py-12 sm:py-16">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold">My account</p>
          <h1 className="mt-2 font-serif-display text-3xl text-charcoal sm:text-4xl">
            {customer.email}
          </h1>
        </div>
        <form action={signOutCustomerAction}>
          <button
            type="submit"
            className="border border-charcoal/30 px-5 py-2.5 text-xs uppercase tracking-wide text-charcoal transition-colors hover:bg-charcoal hover:text-ivory"
          >
            Sign out
          </button>
        </form>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-16 lg:grid-cols-[320px_1fr]">
        <section>
          <h2 className="mb-4 font-serif-display text-xl text-charcoal">Your details</h2>
          <ProfileForm profile={customer.profile} />
        </section>

        <section>
          <h2 className="mb-6 font-serif-display text-xl text-charcoal">
            Your wishlist ({wishlistProducts.length})
          </h2>
          <ProductGrid
            products={wishlistProducts}
            isLoggedIn
            wishlistIds={wishlistIds}
          />
        </section>
      </div>
    </Container>
  );
}
