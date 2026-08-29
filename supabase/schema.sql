-- ============================================================================
-- Hibranso — Supabase database schema
-- ============================================================================
-- Run this once in the Supabase SQL editor (or via `supabase db push`) on a
-- freshly created project. It creates the catalogue tables, indexes, a
-- generated discount-percentage column, and Row Level Security policies that:
--   - allow anyone (anon + authenticated) to READ the catalogue, and
--   - only allow an authenticated user (i.e. a logged-in admin) to WRITE.
--
-- There is no separate "admins" table: every user that exists in Supabase
-- Auth for this project IS an admin. Because there is no public sign-up
-- page anywhere in the app, the only way to create a user is from the
-- Supabase Dashboard (Authentication -> Users -> Add user), which keeps the
-- admin dashboard closed to the public. See the README for step-by-step
-- instructions.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- categories
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  description  text,
  display_order integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.categories is 'Product categories (Bags, Clothing, Other, and any the admin creates later).';

-- ----------------------------------------------------------------------------
-- products
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  description      text,
  category_id      uuid references public.categories(id) on delete set null,
  mrp              numeric(10, 2) not null check (mrp >= 0),
  selling_price    numeric(10, 2) not null check (selling_price >= 0),
  discount_percentage integer generated always as (
    case
      when mrp > 0 and mrp > selling_price
        then round(((mrp - selling_price) / mrp) * 100)::integer
      else 0
    end
  ) stored,
  sku              text,
  is_available     boolean not null default true,
  is_featured      boolean not null default false,
  is_bestseller    boolean not null default false,
  stock_quantity   integer,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint selling_price_not_greater_than_mrp check (selling_price <= mrp)
);

comment on table public.products is 'Hibranso catalogue products.';
comment on column public.products.discount_percentage is 'Auto-calculated from MRP and selling price. Never set manually.';

create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_is_featured_idx on public.products (is_featured) where is_featured = true;
create index if not exists products_is_bestseller_idx on public.products (is_bestseller) where is_bestseller = true;
create index if not exists products_is_available_idx on public.products (is_available);
create index if not exists products_created_at_idx on public.products (created_at desc);
create index if not exists products_name_search_idx on public.products using gin (to_tsvector('english', name || ' ' || coalesce(description, '')));

-- ----------------------------------------------------------------------------
-- product_images
-- ----------------------------------------------------------------------------
create table if not exists public.product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  image_url     text not null,
  alt_text      text,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists product_images_product_id_idx on public.product_images (product_id, display_order);

-- ----------------------------------------------------------------------------
-- product_sizes
-- ----------------------------------------------------------------------------
create table if not exists public.product_sizes (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  size          text not null,
  is_available  boolean not null default true,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists product_sizes_product_id_idx on public.product_sizes (product_id, display_order);

-- ----------------------------------------------------------------------------
-- product_colors
-- ----------------------------------------------------------------------------
create table if not exists public.product_colors (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  name          text not null,
  hex_code      text,
  is_available  boolean not null default true,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists product_colors_product_id_idx on public.product_colors (product_id, display_order);

-- ----------------------------------------------------------------------------
-- updated_at triggers
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.product_images enable row level security;
alter table public.product_sizes  enable row level security;
alter table public.product_colors enable row level security;

-- Public (storefront) read access -------------------------------------------
drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories" on public.categories
  for select using (true);

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products" on public.products
  for select using (true);

drop policy if exists "Public can read product images" on public.product_images;
create policy "Public can read product images" on public.product_images
  for select using (true);

drop policy if exists "Public can read product sizes" on public.product_sizes;
create policy "Public can read product sizes" on public.product_sizes
  for select using (true);

drop policy if exists "Public can read product colors" on public.product_colors;
create policy "Public can read product colors" on public.product_colors
  for select using (true);

-- Admin (any authenticated Supabase user) write access -----------------------
drop policy if exists "Admins can manage categories" on public.categories;
create policy "Admins can manage categories" on public.categories
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products" on public.products
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Admins can manage product images" on public.product_images;
create policy "Admins can manage product images" on public.product_images
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Admins can manage product sizes" on public.product_sizes;
create policy "Admins can manage product sizes" on public.product_sizes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Admins can manage product colors" on public.product_colors;
create policy "Admins can manage product colors" on public.product_colors
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================================
-- Storage bucket for product images
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images" on storage.objects
  for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images" on storage.objects
  for update using (bucket_id = 'product-images' and auth.role() = 'authenticated');

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images" on storage.objects
  for delete using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- Seed the three starter categories the brief calls out explicitly.
-- The admin can add more from the dashboard at any time.
-- ----------------------------------------------------------------------------
insert into public.categories (name, slug, description, display_order)
values
  ('Bags', 'bags', 'Structured totes, slings and everyday carry.', 1),
  ('Clothing', 'clothing', 'Apparel for everyday and occasion wear.', 2),
  ('Other', 'other', 'Accessories and other lifestyle pieces.', 3)
on conflict (slug) do nothing;
