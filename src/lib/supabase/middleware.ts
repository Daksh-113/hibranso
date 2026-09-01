import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Refreshes the Supabase auth session on every request and blocks
 * unauthenticated visitors from every /admin route except /admin/login.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname.startsWith("/admin/login");

  // Customers can also be signed in (for wishlists), so being "signed in" is
  // no longer enough for admin access — only users listed in admin_users are
  // admins. See supabase/migration_002_accounts.sql.
  let isAdmin = false;
  if (user && isAdminRoute) {
    const { data } = await supabase.from("admin_users").select("id").eq("id", user.id).maybeSingle();
    isAdmin = Boolean(data);
  }

  if (isAdminRoute && !isLoginRoute && !isAdmin) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginRoute && isAdmin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}
