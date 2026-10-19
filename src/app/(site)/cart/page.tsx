import { redirect } from "next/navigation";

// Cart/checkout/payment is currently disabled — customers buy via WhatsApp
// instead (see ProductPurchasePanel). The backend (lib/cart.ts,
// lib/actions/cart.ts, the cart_items table) is left in place so this can
// be switched back on later without rebuilding it.
export default function CartPage() {
  redirect("/shop");
}
