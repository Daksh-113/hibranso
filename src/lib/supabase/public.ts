import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Falls back to a syntactically valid placeholder when Supabase hasn't been
// configured yet, so the client can always be constructed. Callers still
// wrap every query in try/catch, so an unconfigured project simply fails at
// the network call (returning empty data) instead of throwing during render
// or build.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

/**
 * Stateless Supabase client for public, unauthenticated reads (catalogue
 * browsing, sitemap, generateStaticParams). Every table it touches has an
 * RLS policy that allows anyone to SELECT, so this never needs the visitor's
 * cookies — which means pages using it can be statically generated / ISR'd
 * instead of forced into fully dynamic rendering on every request.
 */
export function createPublicClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
}
