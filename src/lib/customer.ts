import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { CustomerProfile, Product } from "@/lib/types";

const PRODUCT_SELECT = `
  *,
  category:categories(*),
  product_images(*),
  product_sizes(*),
  product_colors(*)
`;

export type CurrentCustomer = {
  id: string;
  email: string | null;
  profile: CustomerProfile | null;
};

/**
 * The signed-in customer (or null), using the visitor's own session/cookies.
 * Wrapped in React's request-scoped cache so the many components on a page
 * (header, page body, etc.) that all need this share a single lookup.
 */
export const getCurrentCustomer = cache(async (): Promise<CurrentCustomer | null> => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from("customer_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    return { id: user.id, email: user.email ?? null, profile: profile ?? null };
  } catch (error) {
    console.error("getCurrentCustomer failed:", error);
    return null;
  }
});

export async function getWishlistProductIds(userId: string): Promise<Set<string>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("wishlists")
      .select("product_id")
      .eq("user_id", userId);

    if (error) throw error;
    return new Set((data ?? []).map((row) => row.product_id));
  } catch (error) {
    console.error("getWishlistProductIds failed:", error);
    return new Set();
  }
}

export async function getWishlistProducts(userId: string): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("wishlists")
      .select(`product:products(${PRODUCT_SELECT})`)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return ((data ?? []) as unknown as { product: Product | null }[])
      .map((row) => row.product)
      .filter((product): product is Product => Boolean(product));
  } catch (error) {
    console.error("getWishlistProducts failed:", error);
    return [];
  }
}
