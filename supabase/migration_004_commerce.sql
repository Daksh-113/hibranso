-- ============================================================================
-- Hibranso — migration 004: cart, checkout, orders, payment, stock
-- ============================================================================
-- Run this in the Supabase SQL editor AFTER schema.sql, migration_002, and
-- migration_003.
--
-- What this adds:
--   1. A `weight_grams` column on products, used to calculate Delhivery
--      shipping charges (defaults to 300g — update per product in the admin
--      product form).
--   2. `cart_items` — a signed-in customer's cart, persisted so it survives
--      across devices/sessions. Fully self-scoped (a customer only ever sees
--      their own cart).
--   3. `orders` and `order_items` — created when a customer starts checkout.
--      A customer can INSERT their own order (always starting as status
--      'created' — enforced by the RLS check, they cannot insert a
--      pre-marked-paid order) and can only ever SELECT their own orders.
--      Customers have NO update/delete access to orders at all: once
--      created, only the server (using the service-role key, after
--      independently re-verifying payment with PhonePe) can mark an order
--      paid and only admins (via admin_users) can update fulfillment status
--      afterwards. This is what stops a customer from marking their own
--      order "paid" without actually paying.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- products.weight_grams
-- ----------------------------------------------------------------------------
alter table public.products
  add column if not exists weight_grams integer not null default 300;

-- ----------------------------------------------------------------------------
-- cart_items
-- ----------------------------------------------------------------------------
create table if not exists public.cart_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  size       text,
  color      text,
  quantity   integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id, size, color)
);

create index if not exists cart_items_user_id_idx on public.cart_items (user_id);

alter table public.cart_items enable row level security;

drop policy if exists "Customers manage their own cart" on public.cart_items;
create policy "Customers manage their own cart" on public.cart_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop trigger if exists set_cart_items_updated_at on public.cart_items;
create trigger set_cart_items_updated_at
  before update on public.cart_items
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- orders
-- ----------------------------------------------------------------------------
create table if not exists public.orders (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users(id) on delete restrict,
  status                  text not null default 'created'
                            check (status in ('created', 'paid', 'failed', 'shipped', 'delivered', 'cancelled')),
  subtotal                numeric(10, 2) not null check (subtotal >= 0),
  delivery_charge         numeric(10, 2) not null default 0 check (delivery_charge >= 0),
  total_amount            numeric(10, 2) not null check (total_amount >= 0),
  delivery_name           text not null,
  delivery_phone          text not null,
  delivery_address_line1  text not null,
  delivery_address_line2  text,
  delivery_city           text not null,
  delivery_state          text not null,
  delivery_pincode        text not null,
  payment_provider        text not null default 'phonepe',
  merchant_order_id       text not null unique,
  phonepe_transaction_id  text,
  payment_status          text not null default 'pending'
                            check (payment_status in ('pending', 'completed', 'failed')),
  stock_issue             boolean not null default false,
  admin_notes             text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_merchant_order_id_idx on public.orders (merchant_order_id);
create index if not exists orders_status_idx on public.orders (status);

alter table public.orders enable row level security;

drop policy if exists "Customers can read their own orders" on public.orders;
create policy "Customers can read their own orders" on public.orders
  for select using (auth.uid() = user_id);

drop policy if exists "Customers can create their own pending orders" on public.orders;
create policy "Customers can create their own pending orders" on public.orders
  for insert with check (auth.uid() = user_id and status = 'created' and payment_status = 'pending');

drop policy if exists "Admins can read all orders" on public.orders;
create policy "Admins can read all orders" on public.orders
  for select using (exists (select 1 from public.admin_users au where au.id = auth.uid()));

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders" on public.orders
  for update
  using (exists (select 1 from public.admin_users au where au.id = auth.uid()))
  with check (exists (select 1 from public.admin_users au where au.id = auth.uid()));

-- Deliberately no customer UPDATE/DELETE policy, and no customer UPDATE path
-- at all for payment_status — only the server, using the service-role key
-- (which bypasses RLS entirely) after it has independently re-verified the
-- payment with PhonePe, can move an order from pending to paid.

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- order_items
-- ----------------------------------------------------------------------------
create table if not exists public.order_items (
  id                   uuid primary key default gen_random_uuid(),
  order_id             uuid not null references public.orders(id) on delete cascade,
  product_id           uuid references public.products(id) on delete set null,
  product_name         text not null,
  size                 text,
  color                text,
  quantity             integer not null check (quantity > 0),
  unit_price           numeric(10, 2) not null check (unit_price >= 0),
  line_total           numeric(10, 2) not null check (line_total >= 0),
  stock_fulfilled      boolean not null default false,
  created_at           timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.order_items enable row level security;

drop policy if exists "Customers can read their own order items" on public.order_items;
create policy "Customers can read their own order items" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

drop policy if exists "Customers can add items to their own pending order" on public.order_items;
create policy "Customers can add items to their own pending order" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid() and o.status = 'created'
    )
  );

drop policy if exists "Admins can read all order items" on public.order_items;
create policy "Admins can read all order items" on public.order_items
  for select using (exists (select 1 from public.admin_users au where au.id = auth.uid()));

-- ----------------------------------------------------------------------------
-- decrement_product_stock — atomically reduce stock and auto-flip
-- is_available to false once it hits zero. Only ever called from the
-- server's service-role client (the PhonePe payment-confirmation route),
-- never directly by a customer — so execute is revoked from anon/
-- authenticated and granted only to the service_role.
-- ----------------------------------------------------------------------------
create or replace function public.decrement_product_stock(p_product_id uuid, p_quantity integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_remaining integer;
begin
  update public.products
  set stock_quantity = stock_quantity - p_quantity,
      is_available = case when (stock_quantity - p_quantity) <= 0 then false else is_available end
  where id = p_product_id
    and stock_quantity is not null
    and stock_quantity >= p_quantity
  returning stock_quantity into v_remaining;

  return v_remaining is not null;
end;
$$;

revoke all on function public.decrement_product_stock(uuid, integer) from public;
revoke all on function public.decrement_product_stock(uuid, integer) from anon, authenticated;
grant execute on function public.decrement_product_stock(uuid, integer) to service_role;
