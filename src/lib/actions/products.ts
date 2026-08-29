"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

export type ProductFormState = { error: string | null };

const IMAGE_BUCKET = "product-images";

type ColorInput = { name: string; hex_code: string | null };

function parseColors(raw: string | null): ColorInput[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ColorInput[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((c) => c && typeof c.name === "string" && c.name.trim())
      .map((c) => ({ name: c.name.trim(), hex_code: c.hex_code || null }));
  } catch {
    return [];
  }
}

function parseSizes(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractStoragePath(publicUrl: string): string | null {
  const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return null;
  return publicUrl.slice(index + marker.length);
}

export async function saveProductAction(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "").trim() || null;
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "").trim() || null;
  const mrp = Number(formData.get("mrp"));
  const sellingPrice = Number(formData.get("selling_price"));
  const sku = String(formData.get("sku") ?? "").trim() || null;
  const stockQuantityRaw = String(formData.get("stock_quantity") ?? "").trim();
  const stockQuantity = stockQuantityRaw ? Number(stockQuantityRaw) : null;
  const isAvailable = formData.get("is_available") === "on";
  const isFeatured = formData.get("is_featured") === "on";
  const isBestseller = formData.get("is_bestseller") === "on";

  if (!name) return { error: "Product name is required." };
  if (Number.isNaN(mrp) || mrp < 0) return { error: "Enter a valid MRP." };
  if (Number.isNaN(sellingPrice) || sellingPrice < 0) return { error: "Enter a valid selling price." };
  if (sellingPrice > mrp) return { error: "Selling price cannot be greater than MRP." };

  const slug = slugify(slugInput || name);
  if (!slug) return { error: "Could not generate a valid slug from the product name." };

  const productPayload = {
    name,
    slug,
    description: description || null,
    category_id: categoryId,
    mrp,
    selling_price: sellingPrice,
    sku,
    stock_quantity: stockQuantity,
    is_available: isAvailable,
    is_featured: isFeatured,
    is_bestseller: isBestseller,
  };

  let productId = id;

  if (id) {
    const { error } = await supabase.from("products").update(productPayload).eq("id", id);
    if (error) return { error: `Could not update product: ${error.message}` };
  } else {
    const { data, error } = await supabase
      .from("products")
      .insert(productPayload)
      .select("id")
      .single();
    if (error) return { error: `Could not create product: ${error.message}` };
    productId = data.id;
  }

  if (!productId) return { error: "Something went wrong saving the product." };

  // ---- Sizes: replace all -------------------------------------------------
  const sizes = parseSizes(String(formData.get("sizes") ?? ""));
  await supabase.from("product_sizes").delete().eq("product_id", productId);
  if (sizes.length > 0) {
    await supabase.from("product_sizes").insert(
      sizes.map((size, index) => ({
        product_id: productId,
        size,
        display_order: index,
      }))
    );
  }

  // ---- Colors: replace all --------------------------------------------------
  const colors = parseColors(String(formData.get("colors") ?? ""));
  await supabase.from("product_colors").delete().eq("product_id", productId);
  if (colors.length > 0) {
    await supabase.from("product_colors").insert(
      colors.map((color, index) => ({
        product_id: productId,
        name: color.name,
        hex_code: color.hex_code,
        display_order: index,
      }))
    );
  }

  // ---- Images: remove selected, upload new ----------------------------------
  const removeImageIds = formData.getAll("removeImageIds").map(String).filter(Boolean);
  if (removeImageIds.length > 0) {
    const { data: imagesToRemove } = await supabase
      .from("product_images")
      .select("id, image_url")
      .in("id", removeImageIds);

    await supabase.from("product_images").delete().in("id", removeImageIds);

    const storagePaths = (imagesToRemove ?? [])
      .map((img) => extractStoragePath(img.image_url))
      .filter((p): p is string => Boolean(p));
    if (storagePaths.length > 0) {
      await supabase.storage.from(IMAGE_BUCKET).remove(storagePaths);
    }
  }

  const newImages = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (newImages.length > 0) {
    const { count } = await supabase
      .from("product_images")
      .select("id", { count: "exact", head: true })
      .eq("product_id", productId);

    let nextOrder = count ?? 0;

    for (const file of newImages) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${productId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
        await supabase.from("product_images").insert({
          product_id: productId,
          image_url: publicUrlData.publicUrl,
          alt_text: name,
          display_order: nextOrder,
        });
        nextOrder += 1;
      }
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function deleteProductAction(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { data: images } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("product_id", id);

  await supabase.from("products").delete().eq("id", id);

  const storagePaths = (images ?? [])
    .map((img) => extractStoragePath(img.image_url))
    .filter((p): p is string => Boolean(p));
  if (storagePaths.length > 0) {
    await supabase.storage.from(IMAGE_BUCKET).remove(storagePaths);
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}
