import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import type { Category, Product, ShopSearchParams } from "@/lib/types";

const PRODUCT_SELECT = `
  *,
  category:categories(*),
  product_images(*),
  product_sizes(*),
  product_colors(*)
`;

function sortImages(product: Product): Product {
  return {
    ...product,
    product_images: [...(product.product_images ?? [])].sort(
      (a, b) => a.display_order - b.display_order
    ),
    product_sizes: [...(product.product_sizes ?? [])].sort(
      (a, b) => a.display_order - b.display_order
    ),
    product_colors: [...(product.product_colors ?? [])].sort(
      (a, b) => a.display_order - b.display_order
    ),
  };
}

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error("getCategories failed:", error);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("getCategoryBySlug failed:", error);
    return null;
  }
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_featured", true)
      .eq("is_available", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []).map(sortImages);
  } catch (error) {
    console.error("getFeaturedProducts failed:", error);
    return [];
  }
}

export async function getBestsellerProducts(limit = 8): Promise<Product[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_bestseller", true)
      .eq("is_available", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []).map(sortImages);
  } catch (error) {
    console.error("getBestsellerProducts failed:", error);
    return [];
  }
}

export async function getDiscountedProducts(limit = 8): Promise<Product[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_available", true)
      .gt("discount_percentage", 0)
      .order("discount_percentage", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []).map(sortImages);
  } catch (error) {
    console.error("getDiscountedProducts failed:", error);
    return [];
  }
}

export async function getProducts(params: ShopSearchParams = {}): Promise<Product[]> {
  try {
    const supabase = createPublicClient();
    let query = supabase.from("products").select(PRODUCT_SELECT);

    if (params.q) {
      query = query.ilike("name", `%${params.q}%`);
    }

    if (params.category) {
      const { data: category } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", params.category)
        .maybeSingle();
      if (category) {
        query = query.eq("category_id", category.id);
      } else {
        return [];
      }
    }

    if (params.min) {
      const min = Number(params.min);
      if (!Number.isNaN(min)) query = query.gte("selling_price", min);
    }

    if (params.max) {
      const max = Number(params.max);
      if (!Number.isNaN(max)) query = query.lte("selling_price", max);
    }

    if (params.availability === "in_stock") {
      query = query.eq("is_available", true);
    }

    switch (params.sort) {
      case "price_asc":
        query = query.order("selling_price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("selling_price", { ascending: false });
        break;
      case "discount_desc":
        query = query.order("discount_percentage", { ascending: false });
        break;
      case "name_asc":
        query = query.order("name", { ascending: true });
        break;
      case "newest":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(sortImages);
  } catch (error) {
    console.error("getProducts failed:", error);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    return data ? sortImages(data) : null;
  } catch (error) {
    console.error("getProductBySlug failed:", error);
    return null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data ? sortImages(data) : null;
  } catch (error) {
    console.error("getProductById failed:", error);
    return null;
  }
}

export async function getRelatedProducts(
  categoryId: string | null,
  excludeProductId: string,
  limit = 4
): Promise<Product[]> {
  if (!categoryId) return [];
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("category_id", categoryId)
      .neq("id", excludeProductId)
      .eq("is_available", true)
      .limit(limit);

    if (error) throw error;
    return (data ?? []).map(sortImages);
  } catch (error) {
    console.error("getRelatedProducts failed:", error);
    return [];
  }
}

export async function getAllProductSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.from("products").select("slug, updated_at");
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error("getAllProductSlugs failed:", error);
    return [];
  }
}

export async function getAllCategorySlugs(): Promise<{ slug: string; updated_at: string }[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.from("categories").select("slug, updated_at");
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error("getAllCategorySlugs failed:", error);
    return [];
  }
}

export type CategoryWithPreview = Category & { previewImage: string | null; productCount: number };

export async function getCategoriesWithPreview(): Promise<CategoryWithPreview[]> {
  try {
    const supabase = createPublicClient();
    const categories = await getCategories();

    const withPreview = await Promise.all(
      categories.map(async (category) => {
        const { data: products, count } = await supabase
          .from("products")
          .select("product_images(image_url, display_order)", { count: "exact" })
          .eq("category_id", category.id)
          .order("created_at", { ascending: false })
          .limit(1);

        const images = (products?.[0]?.product_images ?? []) as { image_url: string; display_order: number }[];
        const sorted = [...images].sort((a, b) => a.display_order - b.display_order);

        return {
          ...category,
          previewImage: sorted[0]?.image_url ?? null,
          productCount: count ?? 0,
        };
      })
    );

    return withPreview;
  } catch (error) {
    console.error("getCategoriesWithPreview failed:", error);
    return [];
  }
}

export type AdminProductFilters = {
  q?: string;
  category?: string;
  page?: number;
  pageSize?: number;
};

export async function getAdminProducts(
  filters: AdminProductFilters = {}
): Promise<{ products: Product[]; total: number }> {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    const supabase = createPublicClient();
    let query = supabase
      .from("products")
      .select(PRODUCT_SELECT, { count: "exact" })
      .order("created_at", { ascending: false });

    if (filters.q) {
      query = query.ilike("name", `%${filters.q}%`);
    }

    if (filters.category) {
      query = query.eq("category_id", filters.category);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    return { products: (data ?? []).map(sortImages), total: count ?? 0 };
  } catch (error) {
    console.error("getAdminProducts failed:", error);
    return { products: [], total: 0 };
  }
}

export async function getAdminStats() {
  try {
    const supabase = createPublicClient();
    const [{ count: totalProducts }, { count: totalCategories }, { count: outOfStock }, { count: featured }] =
      await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("is_available", false),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("is_featured", true),
      ]);

    return {
      totalProducts: totalProducts ?? 0,
      totalCategories: totalCategories ?? 0,
      outOfStock: outOfStock ?? 0,
      featured: featured ?? 0,
    };
  } catch (error) {
    console.error("getAdminStats failed:", error);
    return { totalProducts: 0, totalCategories: 0, outOfStock: 0, featured: 0 };
  }
}

export type PriceBounds = { min: number; max: number };

export async function getPriceBounds(): Promise<PriceBounds> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select("selling_price")
      .order("selling_price", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return { min: 0, max: 10000 };

    return {
      min: Math.floor(data[0].selling_price),
      max: Math.ceil(data[data.length - 1].selling_price),
    };
  } catch (error) {
    console.error("getPriceBounds failed:", error);
    return { min: 0, max: 10000 };
  }
}
