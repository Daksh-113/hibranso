export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CategoryWithChildren = Category & { children: Category[] };

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
  weight_grams: number;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  product_images?: ProductImage[];
  product_sizes?: ProductSize[];
  product_colors?: ProductColor[];
};

export type CustomerProfile = {
  id: string;
  name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
};

export type OrderStatus = "created" | "paid" | "failed" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "completed" | "failed";

export type Order = {
  id: string;
  user_id: string;
  status: OrderStatus;
  subtotal: number;
  delivery_charge: number;
  total_amount: number;
  delivery_name: string;
  delivery_phone: string;
  delivery_address_line1: string;
  delivery_address_line2: string | null;
  delivery_city: string;
  delivery_state: string;
  delivery_pincode: string;
  payment_provider: string;
  merchant_order_id: string;
  phonepe_transaction_id: string | null;
  payment_status: PaymentStatus;
  stock_issue: boolean;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  size: string | null;
  color: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  stock_fulfilled: boolean;
  created_at: string;
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
