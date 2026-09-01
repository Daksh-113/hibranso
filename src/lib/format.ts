const inrCurrency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrPlain = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats a number as an Indian Rupee amount, e.g. 4199 -> "₹4,199".
 * Used for the WhatsApp order message, which must use the ₹ symbol.
 */
export function formatPrice(amount: number): string {
  return inrCurrency.format(amount);
}

/** On-page display style, e.g. 4199 -> "Rs. 4,199.00". */
export function formatPriceDisplay(amount: number): string {
  return `Rs. ${inrPlain.format(amount)}`;
}

/** Whole-number percentage off, derived from MRP and selling price. */
export function calculateDiscountPercentage(mrp: number, sellingPrice: number): number {
  if (!mrp || mrp <= sellingPrice) return 0;
  return Math.round(((mrp - sellingPrice) / mrp) * 100);
}
