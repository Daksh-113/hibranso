"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileFormState = { error: string | null; saved: boolean };

export async function saveProfileAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Please sign in first.", saved: false };

  const name = String(formData.get("name") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;

  const { error } = await supabase
    .from("customer_profiles")
    .upsert({ id: user.id, name, phone }, { onConflict: "id" });

  if (error) return { error: "Could not save your details. Please try again.", saved: false };

  revalidatePath("/account");
  return { error: null, saved: true };
}

export async function toggleWishlistAction(productId: string, isWishlisted: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "not_signed_in" as const };

  if (isWishlisted) {
    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("wishlists")
      .insert({ user_id: user.id, product_id: productId });
    if (error) return { error: error.message };
  }

  revalidatePath("/account");
  revalidatePath("/shop");
  revalidatePath("/");
  return { error: null };
}
