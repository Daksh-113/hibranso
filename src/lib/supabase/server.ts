import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const rawSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// @supabase/ssr throws synchronously if given empty strings. Falling back to
// a placeholder lets pages render (and the admin layout redirect to /login)
// instead of crashing with a 500 before Supabase has been configured.
const supabaseUrl = rawSupabaseUrl || "https://placeholder.supabase.co";
const supabaseAnonKey = rawSupabaseAnonKey || "placeholder-anon-key";

/**
 * Server-side Supabase client bound to the current request's cookies.
 * Reads run as the visitor (anon); writes only succeed once the admin
 * has logged in, because that's what Row Level Security checks.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component without a response to write to.
          // Safe to ignore when middleware is refreshing the session.
        }
      },
    },
  });
}

export function isSupabaseConfigured() {
  return Boolean(rawSupabaseUrl && rawSupabaseAnonKey);
}
