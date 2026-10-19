import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/customer";
import { getCart } from "@/lib/cart";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/account/login?next=/checkout");

  const items = await getCart(customer.id);
  const sellableItems = items.filter(
    (item) =>
      item.product?.is_available &&
      (item.product.stock_quantity === null || item.product.stock_quantity >= item.quantity)
  );

  if (sellableItems.length === 0) redirect("/cart");

  const subtotal = sellableItems.reduce(
    (sum, item) => sum + (item.product?.selling_price ?? 0) * item.quantity,
    0
  );

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="mb-10 font-serif-display text-3xl text-charcoal sm:text-4xl">Checkout</h1>
      <CheckoutForm profile={customer.profile} subtotal={subtotal} />
    </Container>
  );
}
