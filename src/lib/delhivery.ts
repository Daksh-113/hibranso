import "server-only";

const DELHIVERY_BASE_URL = "https://track.delhivery.com";

export type DeliveryRateResult =
  | { ok: true; charge: number }
  | { ok: false; error: string };

/**
 * Calls Delhivery's Invoice Charges (rate calculator) API to estimate the
 * delivery charge for a shipment, given the destination pincode and total
 * shipment weight.
 *
 * IMPORTANT: this is implemented against Delhivery's publicly documented
 * "Invoice Charges" endpoint from reference knowledge — it could not be
 * tested against a live Delhivery account from this environment (no network
 * access to external hosts here). The query parameters and the shape of a
 * successful response are implemented as documented, but you should verify
 * this against your real Delhivery account during your first live checkout
 * test, and adjust `parseChargeFromResponse` below if your account's
 * response looks different. Check your server logs (the raw response is
 * logged on both success and failure) if the charge looks wrong or missing.
 */
export async function calculateDeliveryCharge(
  destinationPincode: string,
  totalWeightGrams: number
): Promise<DeliveryRateResult> {
  const token = process.env.DELHIVERY_API_TOKEN;
  const originPincode = process.env.DELHIVERY_ORIGIN_PINCODE;

  if (!token || !originPincode) {
    return { ok: false, error: "Delivery rate calculation is not configured yet." };
  }

  if (!/^\d{6}$/.test(destinationPincode)) {
    return { ok: false, error: "Please enter a valid 6-digit pincode." };
  }

  const weight = Math.max(1, Math.round(totalWeightGrams));

  const params = new URLSearchParams({
    md: "E", // Express mode
    ss: "Delivered",
    d_pin: destinationPincode,
    o_pin: originPincode,
    cgm: String(weight), // weight in grams
    pt: "Pre-paid", // payment already collected via PhonePe before shipping
  });

  try {
    const response = await fetch(`${DELHIVERY_BASE_URL}/api/kinko/v1/invoice/charges/.json?${params.toString()}`, {
      headers: {
        Authorization: `Token ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const rawText = await response.text();

    if (!response.ok) {
      console.error("Delhivery rate calculation failed:", response.status, rawText);
      return { ok: false, error: "Could not calculate delivery charge right now." };
    }

    let data: unknown;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("Delhivery rate response was not JSON:", rawText);
      return { ok: false, error: "Could not calculate delivery charge right now." };
    }

    const charge = parseChargeFromResponse(data);
    if (charge === null) {
      console.error("Could not find a charge amount in Delhivery response:", JSON.stringify(data));
      return { ok: false, error: "Could not calculate delivery charge for this pincode." };
    }

    return { ok: true, charge };
  } catch (error) {
    console.error("Delhivery rate calculation request failed:", error);
    return { ok: false, error: "Could not reach the delivery rate service." };
  }
}

/**
 * Delhivery's documented response is a JSON array of charge breakdowns. Each
 * entry commonly includes a `total_amount` (sometimes `gross_amount`) field.
 * This defensively checks a few likely shapes; update this if your account's
 * real response differs (log it and compare — see the module comment above).
 */
function parseChargeFromResponse(data: unknown): number | null {
  const entries = Array.isArray(data) ? data : [data];

  for (const entry of entries) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;

    for (const key of ["total_amount", "gross_amount", "charged_weight_amount", "total_charge"]) {
      const value = record[key];
      if (typeof value === "number" && Number.isFinite(value)) return value;
      if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
        return Number(value);
      }
    }
  }

  return null;
}
