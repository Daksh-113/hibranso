const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Formats a number as an Indian Rupee amount, e.g. 4199 -> "₹4,199". */
export function formatPrice(amount: number): string {
  return inr.format(amount);
}

/** Whole-number percentage off, derived from MRP and selling price. */
export function calculateDiscountPercentage(mrp: number, sellingPrice: number): number {
  if (!mrp || mrp <= sellingPrice) return 0;
  return Math.round(((mrp - sellingPrice) / mrp) * 100);
}
