import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentCustomer } from "@/lib/customer";
import { getCart } from "@/lib/cart";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { formatPriceDisplay } from "@/lib/format";

export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/account/login?next=/cart");

  const items = await getCart(customer.id);
  const subtotal = items.reduce((sum, item) => sum + (item.product?.selling_price ?? 0) * item.quantity, 0);
  const hasUnavailableItems = items.some((item) => item.product && !item.product.is_available);

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="font-serif-display text-3xl text-charcoal sm:text-4xl">Your Cart</h1>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-stone">Your cart is empty.</p>
          <Button href="/shop" variant="outline" size="md" className="mt-6">
            Continue shopping
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px]">
          <div>
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>

          <div className="h-fit border border-line bg-ivory p-6">
            <h2 className="font-serif-display text-lg text-charcoal">Order Summary</h2>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-stone">Subtotal</span>
              <span className="text-charcoal">{formatPriceDisplay(subtotal)}</span>
            </div>
            <p className="mt-2 text-xs text-stone-light">Delivery charges are calculated at checkout.</p>

            {hasUnavailableItems && (
              <p className="mt-4 text-xs text-danger">
                One or more items in your cart are now sold out and won&apos;t be included at checkout.
              </p>
            )}

            <Link
              href="/checkout"
              className="mt-6 block bg-charcoal px-6 py-3 text-center text-xs font-medium uppercase tracking-wide text-ivory transition-opacity hover:opacity-90"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </Container>
  );
}
