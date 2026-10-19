import "server-only";

/**
 * PhonePe Standard Checkout (v2, OAuth-based) integration.
 *
 * IMPORTANT — this could not be tested against a live PhonePe account from
 * this environment (no network access to external hosts here). It is built
 * against PhonePe's publicly documented Standard Checkout v2 API contract
 * from reference knowledge, but PhonePe's exact endpoint paths have changed
 * across API generations and can vary by merchant plan. Before going live:
 *   1. Log into the PhonePe Business Dashboard, open the integration /
 *      developer settings for "Standard Checkout", and confirm the auth,
 *      pay, and status endpoint paths shown there match PHONEPE_ENV_URLS
 *      below. Override any of them with the matching PHONEPE_*_URL env var
 *      if they differ — no code change needed.
 *   2. Restrict the enabled payment methods to UPI only from the dashboard's
 *      payment settings — this is normally a merchant-account setting, not
 *      something the API request can force for every account tier.
 *   3. Run a full sandbox purchase end to end and check your server logs.
 */

type PhonePeEnv = "sandbox" | "production";

function getEnv(): PhonePeEnv {
  return process.env.PHONEPE_ENV === "production" ? "production" : "sandbox";
}

const DEFAULT_URLS: Record<PhonePeEnv, { auth: string; pay: string; statusBase: string }> = {
  sandbox: {
    auth: "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token",
    pay: "https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay",
    statusBase: "https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order",
  },
  production: {
    auth: "https://api.phonepe.com/apis/identity-manager/v1/oauth/token",
    pay: "https://api.phonepe.com/apis/pg/checkout/v2/pay",
    statusBase: "https://api.phonepe.com/apis/pg/checkout/v2/order",
  },
};

function getUrls() {
  const env = getEnv();
  return {
    auth: process.env.PHONEPE_AUTH_URL || DEFAULT_URLS[env].auth,
    pay: process.env.PHONEPE_PAY_URL || DEFAULT_URLS[env].pay,
    statusBase: process.env.PHONEPE_STATUS_URL_BASE || DEFAULT_URLS[env].statusBase,
  };
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token;
  }

  const clientId = process.env.PHONEPE_CLIENT_ID;
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
  const clientVersion = process.env.PHONEPE_CLIENT_VERSION || "1";

  if (!clientId || !clientSecret) {
    throw new Error("PhonePe is not configured (missing PHONEPE_CLIENT_ID/PHONEPE_CLIENT_SECRET).");
  }

  const response = await fetch(getUrls().auth, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      client_version: clientVersion,
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });

  const text = await response.text();
  if (!response.ok) {
    console.error("PhonePe auth failed:", response.status, text);
    throw new Error("Could not authenticate with PhonePe.");
  }

  const data = JSON.parse(text) as { access_token: string; expires_at?: number; expires_in?: number };
  const expiresAt = data.expires_at
    ? data.expires_at * 1000
    : Date.now() + (data.expires_in ?? 3000) * 1000;

  cachedToken = { token: data.access_token, expiresAt };
  return data.access_token;
}

export type CreatePhonePePaymentResult =
  | { ok: true; redirectUrl: string }
  | { ok: false; error: string };

/** Creates a PhonePe Standard Checkout payment and returns the hosted-page URL to redirect the customer to. */
export async function createPhonePePayment(params: {
  merchantOrderId: string;
  amountRupees: number;
  redirectUrl: string;
  message: string;
}): Promise<CreatePhonePePaymentResult> {
  try {
    const token = await getAccessToken();

    const response = await fetch(getUrls().pay, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `O-Bearer ${token}`,
      },
      body: JSON.stringify({
        merchantOrderId: params.merchantOrderId,
        amount: Math.round(params.amountRupees * 100), // paise
        expireAfter: 1200,
        metaInfo: { udf1: "hibranso" },
        paymentFlow: {
          type: "PG_CHECKOUT",
          message: params.message,
          merchantUrls: { redirectUrl: params.redirectUrl },
        },
      }),
      cache: "no-store",
    });

    const text = await response.text();
    if (!response.ok) {
      console.error("PhonePe create-payment failed:", response.status, text);
      return { ok: false, error: "Could not start the PhonePe payment." };
    }

    const data = JSON.parse(text) as { redirectUrl?: string };
    if (!data.redirectUrl) {
      console.error("PhonePe create-payment response missing redirectUrl:", text);
      return { ok: false, error: "Could not start the PhonePe payment." };
    }

    return { ok: true, redirectUrl: data.redirectUrl };
  } catch (error) {
    console.error("PhonePe create-payment error:", error);
    return { ok: false, error: "Could not reach PhonePe." };
  }
}

export type PhonePeOrderState = "PENDING" | "COMPLETED" | "FAILED" | "UNKNOWN";

/** Authoritative payment status check — always re-verify with this before marking an order paid. */
export async function checkPhonePeOrderStatus(merchantOrderId: string): Promise<{
  state: PhonePeOrderState;
  transactionId: string | null;
}> {
  try {
    const token = await getAccessToken();
    const response = await fetch(`${getUrls().statusBase}/${merchantOrderId}/status`, {
      headers: { Authorization: `O-Bearer ${token}` },
      cache: "no-store",
    });

    const text = await response.text();
    if (!response.ok) {
      console.error("PhonePe status check failed:", response.status, text);
      return { state: "UNKNOWN", transactionId: null };
    }

    const data = JSON.parse(text) as { state?: string; paymentDetails?: { transactionId?: string }[] };
    const state = data.state === "COMPLETED" || data.state === "FAILED" || data.state === "PENDING"
      ? data.state
      : "UNKNOWN";

    return {
      state,
      transactionId: data.paymentDetails?.[0]?.transactionId ?? null,
    };
  } catch (error) {
    console.error("PhonePe status check error:", error);
    return { state: "UNKNOWN", transactionId: null };
  }
}

/**
 * Verifies a PhonePe webhook callback's Authorization header, which PhonePe
 * sets to SHA256(username:password) using the username/password you configure
 * in the PhonePe dashboard's webhook settings (PHONEPE_WEBHOOK_USERNAME /
 * PHONEPE_WEBHOOK_PASSWORD here must match exactly what you set there).
 */
export async function verifyPhonePeWebhookAuth(authorizationHeader: string | null): Promise<boolean> {
  if (!authorizationHeader) return false;

  const username = process.env.PHONEPE_WEBHOOK_USERNAME;
  const password = process.env.PHONEPE_WEBHOOK_PASSWORD;
  if (!username || !password) return false;

  const encoder = new TextEncoder();
  const data = encoder.encode(`${username}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const expected = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return authorizationHeader.trim().toLowerCase() === expected.toLowerCase();
}
