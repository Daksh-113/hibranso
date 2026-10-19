import { redirect } from "next/navigation";

// Cart/checkout/payment is currently disabled — customers buy via WhatsApp
// instead (see ProductPurchasePanel). The backend (lib/actions/checkout.ts,
// lib/phonepe.ts, lib/delhivery.ts, the orders tables) is left in place so
// this can be switched back on later without rebuilding it.
export default function CheckoutPage() {
  redirect("/shop");
}
