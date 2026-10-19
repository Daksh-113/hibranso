"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveDeliveryCharge } from "@/lib/delhivery";
import { createPhonePePayment } from "@/lib/phonepe";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export type DeliveryRateState = {
  error: string | null;
  charge: number | null;
};

/** Called when the customer enters/changes their delivery pincode at checkout. */
export async function getDeliveryRateAction(pincode: string): Promise<DeliveryRateState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in first.", charge: null };

  const { data: cartItems } = await supabase
    .from("cart_items")
    .select("quantity, product:products(weight_grams, is_available)")
    .eq("user_id", user.id);

  const totalWeight = (cartItems ?? []).reduce((sum, item) => {
    const product = item.product as unknown as { weight_grams: number; is_available: boolean } | null;
    if (!product?.is_available) return sum;
    return sum + product.weight_grams * item.quantity;
  }, 0);

  if (totalWeight === 0) return { error: "Your cart is empty.", charge: null };

  const result = await resolveDeliveryCharge(pincode, totalWeight);
  if (!result.ok) return { error: result.error, charge: null };
  return { error: null, charge: result.charge };
}

export type CheckoutFormState = { error: string | null };

export async function initiateCheckoutAction(
  _prevState: CheckoutFormState,
  formData: FormData
): Promise<CheckoutFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Please sign in first." };

  const deliveryName = String(formData.get("delivery_name") ?? "").trim();
  const deliveryPhone = String(formData.get("delivery_phone") ?? "").trim();
  const line1 = String(formData.get("delivery_address_line1") ?? "").trim();
  const line2 = String(formData.get("delivery_address_line2") ?? "").trim();
  const city = String(formData.get("delivery_city") ?? "").trim();
  const state = String(formData.get("delivery_state") ?? "").trim();
  const pincode = String(formData.get("delivery_pincode") ?? "").trim();

  if (!deliveryName || !deliveryPhone || !line1 || !city || !state || !/^\d{6}$/.test(pincode)) {
    return { error: "Please fill in all delivery details with a valid 6-digit pincode." };
  }

  // Re-fetch the cart server-side — never trust client-submitted prices or quantities.
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select("id, product_id, size, color, quantity, product:products(name, selling_price, is_available, stock_quantity, weight_grams)")
    .eq("user_id", user.id);

  if (!cartItems || cartItems.length === 0) {
    return { error: "Your cart is empty." };
  }

  type CartRow = (typeof cartItems)[number] & {
    product: { name: string; selling_price: number; is_available: boolean; stock_quantity: number | null; weight_grams: number } | null;
  };

  const sellable = (cartItems as unknown as CartRow[]).filter(
    (item) =>
      item.product &&
      item.product.is_available &&
      (item.product.stock_quantity === null || item.product.stock_quantity >= item.quantity)
  );

  if (sellable.length === 0) {
    return { error: "The items in your cart are no longer available. Please update your cart." };
  }

  const subtotal = sellable.reduce((sum, item) => sum + item.product!.selling_price * item.quantity, 0);
  const totalWeight = sellable.reduce((sum, item) => sum + item.product!.weight_grams * item.quantity, 0);

  const rate = await resolveDeliveryCharge(pincode, totalWeight);
  const deliveryCharge = rate.ok ? rate.charge : 0;
  const totalAmount = subtotal + deliveryCharge;

  const merchantOrderId = `HIB${Date.now()}${Math.floor(Math.random() * 1000)}`;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      subtotal,
      delivery_charge: deliveryCharge,
      total_amount: totalAmount,
      delivery_name: deliveryName,
      delivery_phone: deliveryPhone,
      delivery_address_line1: line1,
      delivery_address_line2: line2 || null,
      delivery_city: city,
      delivery_state: state,
      delivery_pincode: pincode,
      merchant_order_id: merchantOrderId,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("Order creation failed:", orderError);
    return { error: "Could not create your order. Please try again." };
  }

  const orderItemsPayload = sellable.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: item.product!.name,
    size: item.size,
    color: item.color,
    quantity: item.quantity,
    unit_price: item.product!.selling_price,
    line_total: item.product!.selling_price * item.quantity,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItemsPayload);
  if (itemsError) {
    console.error("Order items creation failed:", itemsError);
    return { error: "Could not create your order. Please try again." };
  }

  const payment = await createPhonePePayment({
    merchantOrderId,
    amountRupees: totalAmount,
    redirectUrl: `${siteUrl}/checkout/return?merchantOrderId=${merchantOrderId}`,
    message: `Hibranso order ${merchantOrderId}`,
  });

  if (!payment.ok) {
    return { error: payment.error };
  }

  redirect(payment.redirectUrl);
}
