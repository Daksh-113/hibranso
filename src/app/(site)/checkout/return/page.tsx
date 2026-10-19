import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { confirmOrderPaid } from "@/lib/orders";
import { buildOrderWhatsAppLink } from "@/lib/whatsapp";
import { formatPriceDisplay } from "@/lib/format";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import type { Order, OrderItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "Order Status",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CheckoutReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ merchantOrderId?: string }>;
}) {
  const { merchantOrderId } = await searchParams;
  if (!merchantOrderId) redirect("/cart");

  const result = await confirmOrderPaid(merchantOrderId);

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("merchant_order_id", merchantOrderId)
    .maybeSingle();

  if (!order) {
    return (
      <Container className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <p className="font-serif-display text-2xl text-charcoal">Order not found</p>
        <Button href="/cart" variant="outline" size="md" className="mt-6">
          Back to cart
        </Button>
      </Container>
    );
  }

  const typedOrder = order as Order;
  const items = (order.order_items ?? []) as OrderItem[];

  if (result.status === "paid") {
    return (
      <Container className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Payment successful</p>
        <h1 className="mt-3 font-serif-display text-3xl text-charcoal sm:text-4xl">Thank you!</h1>
        <p className="mt-4 text-sm text-stone">
          Order <span className="font-medium text-charcoal">{typedOrder.merchant_order_id}</span> — total paid{" "}
          {formatPriceDisplay(typedOrder.total_amount)}
        </p>

        <div className="mt-6 max-w-sm text-left text-sm text-stone">
          {items.map((item) => (
            <p key={item.id}>
              {item.product_name}
              {[item.size, item.color].filter(Boolean).length > 0
                ? ` (${[item.size, item.color].filter(Boolean).join(" / ")})`
                : ""}{" "}
              x{item.quantity}
            </p>
          ))}
        </div>

        <Button
          href={buildOrderWhatsAppLink(typedOrder, items)}
          target="_blank"
          rel="noopener noreferrer"
          variant="whatsapp"
          size="lg"
          className="mt-8"
        >
          Notify us on WhatsApp
        </Button>
        <Link href="/shop" className="mt-6 text-sm text-stone underline underline-offset-4">
          Continue shopping
        </Link>
      </Container>
    );
  }

  if (result.status === "failed") {
    return (
      <Container className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <p className="font-serif-display text-2xl text-charcoal">Payment failed</p>
        <p className="mt-2 text-sm text-stone">Your payment could not be completed. Nothing was charged.</p>
        <Button href="/checkout" variant="outline" size="md" className="mt-6">
          Try again
        </Button>
      </Container>
    );
  }

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="font-serif-display text-2xl text-charcoal">Confirming your payment…</p>
      <p className="mt-2 text-sm text-stone">
        This can take a moment. Refresh this page in a few seconds if it doesn&apos;t update automatically.
      </p>
      <Button href={`/checkout/return?merchantOrderId=${merchantOrderId}`} variant="outline" size="md" className="mt-6">
        Refresh
      </Button>
    </Container>
  );
}
