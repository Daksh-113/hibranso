-- ============================================================================
-- Hibranso — migration 002: admin roles, customer accounts, wishlist
-- ============================================================================
-- Run this in the Supabase SQL editor AFTER schema.sql (and seed.sql, if you
-- ran it). It is safe to run once on top of an existing Hibranso database.
--
-- What this changes:
--   1. Introduces an explicit `admin_users` table. Previously, ANY logged-in
--      Supabase user was treated as an admin. Now that customers can also
--      create accounts (for wishlists), that would let a customer edit your
--      catalogue — so write access to products/categories/images/sizes/
--      colours/storage is now restricted to users listed in `admin_users`.
--   2. Every user that already exists in Supabase Auth at the moment you run
--      this migration (i.e. the admin account(s) you created earlier) is
--      automatically added to `admin_users`, so your existing admin login
--      keeps working with no extra steps.
--   3. Adds `customer_profiles` (name/phone a customer can save) and
--      `wishlists` (their saved products) — both scoped so a customer can
--      only ever see/edit their own data.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- admin_users
-- ----------------------------------------------------------------------------
create table if not exists public.admin_users (
  id         uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.admin_users is 'Users allowed to manage the Hibranso catalogue. Add rows only via the SQL editor.';

alter table public.admin_users enable row level security;

drop policy if exists "Users can check their own admin status" on public.admin_users;
create policy "Users can check their own admin status" on public.admin_users
  for select using (auth.uid() = id);

-- Promote every Supabase Auth user that exists right now (your existing
-- admin account(s)) to admin. Anyone who signs up AFTER this point (e.g. a
-- customer via the wishlist magic-link login) will NOT be added here.
insert into public.admin_users (id)
select id from auth.users
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Replace "any authenticated user" write policies with "admin_users only"
-- ----------------------------------------------------------------------------
drop policy if exists "Admins can manage categories" on public.categories;
create policy "Admins can manage categories" on public.categories
  for all
  using (exists (select 1 from public.admin_users au where au.id = auth.uid()))
  with check (exists (select 1 from public.admin_users au where au.id = auth.uid()));

drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products" on public.products
  for all
  using (exists (select 1 from public.admin_users au where au.id = auth.uid()))
  with check (exists (select 1 from public.admin_users au where au.id = auth.uid()));

drop policy if exists "Admins can manage product images" on public.product_images;
create policy "Admins can manage product images" on public.product_images
  for all
  using (exists (select 1 from public.admin_users au where au.id = auth.uid()))
  with check (exists (select 1 from public.admin_users au where au.id = auth.uid()));

drop policy if exists "Admins can manage product sizes" on public.product_sizes;
create policy "Admins can manage product sizes" on public.product_sizes
  for all
  using (exists (select 1 from public.admin_users au where au.id = auth.uid()))
  with check (exists (select 1 from public.admin_users au where au.id = auth.uid()));

drop policy if exists "Admins can manage product colors" on public.product_colors;
create policy "Admins can manage product colors" on public.product_colors
  for all
  using (exists (select 1 from public.admin_users au where au.id = auth.uid()))
  with check (exists (select 1 from public.admin_users au where au.id = auth.uid()));

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images" on storage.objects
  for insert
  with check (
    bucket_id = 'product-images'
    and exists (select 1 from public.admin_users au where au.id = auth.uid())
  );

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images" on storage.objects
  for update
  using (
    bucket_id = 'product-images'
    and exists (select 1 from public.admin_users au where au.id = auth.uid())
  );

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images" on storage.objects
  for delete
  using (
    bucket_id = 'product-images'
    and exists (select 1 from public.admin_users au where au.id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- customer_profiles — optional name/phone a customer can save, so it can be
-- pre-filled into future WhatsApp order messages.
-- ----------------------------------------------------------------------------
create table if not exists public.customer_profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  phone      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customer_profiles enable row level security;

drop policy if exists "Customers can read their own profile" on public.customer_profiles;
create policy "Customers can read their own profile" on public.customer_profiles
  for select using (auth.uid() = id);

drop policy if exists "Customers can upsert their own profile" on public.customer_profiles;
create policy "Customers can upsert their own profile" on public.customer_profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Customers can update their own profile" on public.customer_profiles;
create policy "Customers can update their own profile" on public.customer_profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop trigger if exists set_customer_profiles_updated_at on public.customer_profiles;
create trigger set_customer_profiles_updated_at
  before update on public.customer_profiles
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- wishlists — a customer's saved products
-- ----------------------------------------------------------------------------
create table if not exists public.wishlists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists wishlists_user_id_idx on public.wishlists (user_id);

alter table public.wishlists enable row level security;

drop policy if exists "Customers can read their own wishlist" on public.wishlists;
create policy "Customers can read their own wishlist" on public.wishlists
  for select using (auth.uid() = user_id);

drop policy if exists "Customers can add to their own wishlist" on public.wishlists;
create policy "Customers can add to their own wishlist" on public.wishlists
  for insert with check (auth.uid() = user_id);

drop policy if exists "Customers can remove from their own wishlist" on public.wishlists;
create policy "Customers can remove from their own wishlist" on public.wishlists
  for delete using (auth.uid() = user_id);
