import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { checkPhonePeOrderStatus } from "@/lib/phonepe";

export type ConfirmOrderResult = {
  status: "paid" | "failed" | "pending" | "not_found";
};

/**
 * The single, idempotent source of truth for marking an order paid. Called
 * from both the PhonePe webhook and the customer's checkout-return page
 * (whichever arrives first "wins" — the second call is a safe no-op because
 * it checks the current payment_status before doing anything).
 *
 * Always re-verifies with PhonePe's own status API rather than trusting the
 * caller — a webhook payload or a redirect query string can be spoofed,
 * PhonePe's server-to-server status response cannot.
 */
export async function confirmOrderPaid(merchantOrderId: string): Promise<ConfirmOrderResult> {
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, payment_status, status")
    .eq("merchant_order_id", merchantOrderId)
    .maybeSingle();

  if (!order) return { status: "not_found" };

  if (order.payment_status === "completed") {
    return { status: "paid" };
  }

  const { state, transactionId } = await checkPhonePeOrderStatus(merchantOrderId);

  if (state === "COMPLETED") {
    await admin
      .from("orders")
      .update({
        payment_status: "completed",
        status: "paid",
        phonepe_transaction_id: transactionId,
      })
      .eq("id", order.id);

    await fulfillOrderStock(admin, order.id);
    await clearPurchasedCartItems(admin, order.id);

    return { status: "paid" };
  }

  if (state === "FAILED") {
    await admin.from("orders").update({ payment_status: "failed", status: "failed" }).eq("id", order.id);
    return { status: "failed" };
  }

  return { status: "pending" };
}

async function fulfillOrderStock(admin: ReturnType<typeof createAdminClient>, orderId: string) {
  const { data: items } = await admin
    .from("order_items")
    .select("id, product_id, quantity")
    .eq("order_id", orderId);

  if (!items) return;

  let anyStockIssue = false;

  for (const item of items) {
    if (!item.product_id) continue;

    const { data: fulfilled, error } = await admin.rpc("decrement_product_stock", {
      p_product_id: item.product_id,
      p_quantity: item.quantity,
    });

    if (error) {
      console.error("decrement_product_stock failed:", error);
      anyStockIssue = true;
      continue;
    }

    if (fulfilled) {
      await admin.from("order_items").update({ stock_fulfilled: true }).eq("id", item.id);
    } else {
      // Stock ran out between checkout and payment confirmation — the
      // order is still paid, but this item needs a manual decision
      // (partial refund, backorder, substitution) from the admin.
      anyStockIssue = true;
    }
  }

  if (anyStockIssue) {
    await admin.from("orders").update({ stock_issue: true }).eq("id", orderId);
  }
}

async function clearPurchasedCartItems(admin: ReturnType<typeof createAdminClient>, orderId: string) {
  const { data: order } = await admin.from("orders").select("user_id").eq("id", orderId).maybeSingle();
  const { data: items } = await admin
    .from("order_items")
    .select("product_id, size, color")
    .eq("order_id", orderId);

  if (!order || !items) return;

  for (const item of items) {
    if (!item.product_id) continue;
    let query = admin
      .from("cart_items")
      .delete()
      .eq("user_id", order.user_id)
      .eq("product_id", item.product_id);
    query = item.size ? query.eq("size", item.size) : query.is("size", null);
    query = item.color ? query.eq("color", item.color) : query.is("color", null);
    await query;
  }
}
