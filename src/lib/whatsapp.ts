import { formatPrice } from "./format";
import type { Product } from "./types";

/** Digits-only WhatsApp number (with country code), configured per deployment. */
export function getWhatsAppNumber(): string {
  return (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/[^\d]/g, "");
}

export function buildProductWhatsAppMessage(
  product: Pick<Product, "name" | "mrp" | "selling_price">,
  options?: { size?: string | null; color?: string | null; customerName?: string | null }
): string {
  const lines = [
    "Hi Hibranso, I am interested in purchasing:",
    `Product: ${product.name}`,
    `Price: ${formatPrice(product.selling_price)}`,
    `MRP: ${formatPrice(product.mrp)}`,
  ];

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
  product: Pick<Product, "name" | "mrp" | "selling_price">,
  options?: { size?: string | null; color?: string | null; customerName?: string | null }
): string {
  return buildWhatsAppLink(buildProductWhatsAppMessage(product, options));
}

export function buildGeneralWhatsAppLink(message = "Hi Hibranso, I have a question about your products."): string {
  return buildWhatsAppLink(message);
}
