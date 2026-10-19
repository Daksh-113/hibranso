import { formatPrice } from "./format";
import type { Order, OrderItem, Product } from "./types";

/** Digits-only WhatsApp number (with country code), configured per deployment. */
export function getWhatsAppNumber(): string {
  return (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/[^\d]/g, "");
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export function buildProductWhatsAppMessage(
  product: Pick<Product, "name" | "mrp" | "selling_price" | "slug">,
  options?: { size?: string | null; color?: string | null; customerName?: string | null }
): string {
  const lines = [
    "Hi Hibranso, I am interested in purchasing:",
    `Product: ${product.name}`,
    `Price: ${formatPrice(product.selling_price)}`,
    `MRP: ${formatPrice(product.mrp)}`,
  ];

  if (siteUrl) lines.push(`Link: ${siteUrl}/product/${product.slug}`);
  if (options?.size) lines.push(`Size: ${options.size}`);
  if (options?.color) lines.push(`Colour: ${options.color}`);
  if (options?.customerName) lines.push(`Name: ${options.customerName}`);

  return lines.join("\n");
}

export function buildWhatsAppLink(message: string): string {
  const number = getWhatsAppNumber();
  const base = number ? `https://wa.me/${number}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function buildProductWhatsAppLink(
  product: Pick<Product, "name" | "mrp" | "selling_price" | "slug">,
  options?: { size?: string | null; color?: string | null; customerName?: string | null }
): string {
  return buildWhatsAppLink(buildProductWhatsAppMessage(product, options));
}

export function buildGeneralWhatsAppLink(message = "Hi Hibranso, I have a question about your products."): string {
  return buildWhatsAppLink(message);
}

export function buildOrderWhatsAppMessage(order: Order, items: OrderItem[]): string {
  const lines = [
    "Hi Hibranso, I've just paid for an order on your website:",
    `Order ID: ${order.merchant_order_id}`,
    "",
    "Items:",
    ...items.map((item) => {
      const variant = [item.size, item.color].filter(Boolean).join(" / ");
      return `- ${item.product_name}${variant ? ` (${variant})` : ""} x${item.quantity} — ${formatPrice(item.line_total)}`;
    }),
    "",
    `Subtotal: ${formatPrice(order.subtotal)}`,
    `Delivery: ${formatPrice(order.delivery_charge)}`,
    `Total paid: ${formatPrice(order.total_amount)}`,
    "",
    "Delivery address:",
    order.delivery_name,
    order.delivery_phone,
    [order.delivery_address_line1, order.delivery_address_line2].filter(Boolean).join(", "),
    `${order.delivery_city}, ${order.delivery_state} - ${order.delivery_pincode}`,
  ];

  return lines.join("\n");
}

export function buildOrderWhatsAppLink(order: Order, items: OrderItem[]): string {
  return buildWhatsAppLink(buildOrderWhatsAppMessage(order, items));
}
