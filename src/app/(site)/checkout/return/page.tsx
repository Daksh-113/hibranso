import { redirect } from "next/navigation";

// Cart/checkout/payment is currently disabled — see /checkout/page.tsx.
export default function CheckoutReturnPage() {
  redirect("/shop");
}
