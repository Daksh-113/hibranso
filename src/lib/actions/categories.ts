"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

export type CategoryFormState = { error: string | null };

export async function saveCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "").trim() || null;
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const displayOrderRaw = String(formData.get("display_order") ?? "").trim();
  const parentId = String(formData.get("parent_id") ?? "").trim() || null;

  if (!name) return { error: "Category name is required." };

  const slug = slugify(slugInput || name);
  if (!slug) return { error: "Could not generate a valid slug from the category name." };

  if (parentId) {
    if (parentId === id) {
      return { error: "A category cannot be its own parent." };
    }
    const { data: parent } = await supabase
      .from("categories")
      .select("parent_id")
      .eq("id", parentId)
      .maybeSingle();
    if (parent?.parent_id) {
      return { error: "Subcategories can only be one level deep — pick a top-level category as the parent." };
    }
  }

  const payload = {
    name,
    slug,
    description: description || null,
    display_order: displayOrderRaw ? Number(displayOrderRaw) : 0,
    parent_id: parentId,
  };

  if (id) {
    const { error } = await supabase.from("categories").update(payload).eq("id", id);
    if (error) return { error: `Could not update category: ${error.message}` };
  } else {
    const { error } = await supabase.from("categories").insert(payload);
    if (error) return { error: `Could not create category: ${error.message}` };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/");
  return { error: null };
}

export async function deleteCategoryAction(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase.from("categories").delete().eq("id", id);

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/");
}
