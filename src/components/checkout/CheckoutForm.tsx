"use client";

import { useActionState, useState, useTransition } from "react";
import { initiateCheckoutAction, getDeliveryRateAction, type CheckoutFormState } from "@/lib/actions/checkout";
import { formatPriceDisplay } from "@/lib/format";
import type { CustomerProfile } from "@/lib/types";

const initialState: CheckoutFormState = { error: null };
const inputClass =
  "w-full border border-line bg-ivory px-4 py-2.5 text-sm outline-none focus:border-gold";

export function CheckoutForm({ profile, subtotal }: { profile: CustomerProfile | null; subtotal: number }) {
  const [state, formAction, pending] = useActionState(initiateCheckoutAction, initialState);
  const [pincode, setPincode] = useState("");
  const [rateError, setRateError] = useState<string | null>(null);
  const [deliveryCharge, setDeliveryCharge] = useState<number | null>(null);
  const [checkingRate, startRateCheck] = useTransition();

  function handlePincodeBlur() {
    if (!/^\d{6}$/.test(pincode)) {
      setDeliveryCharge(null);
      return;
    }
    setRateError(null);
    startRateCheck(async () => {
      const result = await getDeliveryRateAction(pincode);
      if (result.error) {
        setRateError(result.error);
        setDeliveryCharge(null);
      } else {
        setDeliveryCharge(result.charge);
      }
    });
  }

  const total = subtotal + (deliveryCharge ?? 0);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <h2 className="font-serif-display text-lg text-charcoal">Delivery Address</h2>

        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-stone">Full name</label>
          <input name="delivery_name" defaultValue={profile?.name ?? ""} required className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-stone">Phone number</label>
          <input name="delivery_phone" defaultValue={profile?.phone ?? ""} required className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-stone">Address line 1</label>
          <input name="delivery_address_line1" required className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-stone">
            Address line 2 (optional)
          </label>
          <input name="delivery_address_line2" className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-stone">City</label>
            <input name="delivery_city" required className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-stone">State</label>
            <input name="delivery_state" required className={inputClass} />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-stone">Pincode</label>
          <input
            name="delivery_pincode"
            inputMode="numeric"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            onBlur={handlePincodeBlur}
            required
            className={inputClass}
          />
          {checkingRate && <p className="mt-1 text-xs text-stone">Calculating delivery charge…</p>}
          {rateError && <p className="mt-1 text-xs text-danger">{rateError}</p>}
        </div>
      </div>

      <div className="h-fit border border-line bg-ivory p-6">
        <h2 className="font-serif-display text-lg text-charcoal">Order Summary</h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-stone">Subtotal</span>
            <span className="text-charcoal">{formatPriceDisplay(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone">Delivery</span>
            <span className="text-charcoal">
              {deliveryCharge !== null ? formatPriceDisplay(deliveryCharge) : "Enter pincode"}
            </span>
          </div>
          <div className="flex justify-between border-t border-line pt-2 font-semibold">
            <span className="text-charcoal">Total</span>
            <span className="text-charcoal">{formatPriceDisplay(total)}</span>
          </div>
        </div>

        {state.error && <p className="mt-4 text-sm text-danger">{state.error}</p>}

        <button
          type="submit"
          disabled={pending || deliveryCharge === null}
          className="mt-6 w-full bg-charcoal py-3 text-xs font-medium uppercase tracking-wide text-ivory transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Redirecting to PhonePe…" : "Pay with PhonePe (UPI)"}
        </button>
        <p className="mt-3 text-center text-xs text-stone-light">
          You&apos;ll be redirected to PhonePe to complete payment securely via UPI.
        </p>
      </div>
    </form>
  );
}
