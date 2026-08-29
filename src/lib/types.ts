export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
};

export type ProductSize = {
  id: string;
  product_id: string;
  size: string;
  is_available: boolean;
  display_order: number;
};

export type ProductColor = {
  id: string;
  product_id: string;
  name: string;
  hex_code: string | null;
  is_available: boolean;
  display_order: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  mrp: number;
  selling_price: number;
  discount_percentage: number;
  sku: string | null;
  is_available: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  stock_quantity: number | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  product_images?: ProductImage[];
  product_sizes?: ProductSize[];
  product_colors?: ProductColor[];
};

export type ProductSortOption =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "discount_desc"
  | "name_asc";

export type ShopSearchParams = {
  q?: string;
  category?: string;
  sort?: ProductSortOption;
  min?: string;
  max?: string;
  availability?: "in_stock" | "all";
};
