import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key";

/**
 * Supabase client authenticated with the service-role key — bypasses Row
 * Level Security entirely. This is a deliberate, narrow exception to the
 * rest of this codebase's "no service-role key" rule.
 *
 * It exists for exactly one reason: confirming a PhonePe payment happens on
 * a server-to-server call from PhonePe, with no customer browser session to
 * authenticate as. There is no legitimate way to let that call update
 * `orders.payment_status` under RLS, so this client — used ONLY inside the
 * PhonePe webhook/status-confirmation route — does it instead.
 *
 * Never import this anywhere else. It must never reach the browser; the
 * underlying key is a plain server environment variable (no NEXT_PUBLIC_
 * prefix) for exactly that reason.
 */
export function createAdminClient() {
  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export function isServiceRoleConfigured() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}
