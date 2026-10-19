import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { CartItem } from "@/lib/types";

const PRODUCT_SELECT = `
  *,
  category:categories(*),
  product_images(*),
  product_sizes(*),
  product_colors(*)
`;

export async function getCart(userId: string): Promise<CartItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cart_items")
      .select(`*, product:products(${PRODUCT_SELECT})`)
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data ?? []) as unknown as CartItem[];
  } catch (error) {
    console.error("getCart failed:", error);
    return [];
  }
}

export async function getCartCount(userId: string): Promise<number> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("cart_items").select("quantity").eq("user_id", userId);
    if (error) throw error;
    return (data ?? []).reduce((sum, row) => sum + row.quantity, 0);
  } catch (error) {
    console.error("getCartCount failed:", error);
    return 0;
  }
}
