"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CartActionResult = { error: string | null };

export async function addToCartAction(
  productId: string,
  size: string | null,
  color: string | null,
  quantity: number
): Promise<CartActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "not_signed_in" };

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .filter("size", size === null ? "is" : "eq", size)
    .filter("color", color === null ? "is" : "eq", color)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("cart_items")
      .insert({ user_id: user.id, product_id: productId, size, color, quantity });
    if (error) return { error: error.message };
  }

  revalidatePath("/cart");
  return { error: null };
}

export async function updateCartItemQuantityAction(
  cartItemId: string,
  quantity: number
): Promise<CartActionResult> {
  const supabase = await createClient();

  if (quantity <= 0) {
    const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("cart_items").update({ quantity }).eq("id", cartItemId);
    if (error) return { error: error.message };
  }

  revalidatePath("/cart");
  return { error: null };
}

export async function removeFromCartAction(cartItemId: string): Promise<CartActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId);
  if (error) return { error: error.message };

  revalidatePath("/cart");
  return { error: null };
}
