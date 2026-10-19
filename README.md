# Hibranso

A premium product-catalogue website for **Hibranso** — bags, clothing and
lifestyle accessories. Customers browse the catalogue and either message
Hibranso directly on WhatsApp, or add items to a cart and pay online via UPI
(through PhonePe) with a live, weight/location-based delivery charge
(through Delhivery).

Built with Next.js (App Router), TypeScript, Tailwind CSS v4 and Supabase
(Postgres, Auth, Storage).

> **Demo data notice.** The seed data in `supabase/seed.sql` creates six
> products whose names are all prefixed `[DEMO]`. These are placeholders to
> preview the site working — they are **not** real Hibranso products. Delete
> them from the admin dashboard once you start adding real inventory.

---

## 1. What's included

- **Storefront**: Home, Shop (search/sort/filter), Category pages, Product
  detail pages, About, Contact.
- **WhatsApp ordering**: every product's "Buy on WhatsApp" button opens
  WhatsApp with a pre-filled message (product, price, MRP, link, size,
  colour) — no account needed for this path.
- **Cart & online payment (UPI via PhonePe)**: signed-in customers can add
  multiple products to a cart, check out with a delivery address, see a
  live delivery charge (via Delhivery, based on destination pincode and
  product weight), and pay by UPI through PhonePe. Stock is automatically
  reduced on confirmed payment, and a product auto-flips to "Sold Out" once
  its stock hits zero. See section 6b.
- **Admin dashboard** at `/admin`: secure login, product CRUD (multiple
  images, sizes, colours, weight, MRP/selling price with auto-calculated
  discount, availability, featured/bestseller flags), category CRUD, order
  management (view orders, delivery addresses, update fulfillment status),
  search & filter.
- **Customer accounts & wishlist**: passwordless (magic link) sign-in at
  `/account/login`; customers can save products to a wishlist and store a
  name/phone that's pre-filled into future WhatsApp messages. Fully separate
  from admin access — see section 6a.
- **Database**: Supabase Postgres schema with Row Level Security — anyone
  can read the catalogue, only users in `admin_users` can write to it, and
  each customer can only see/edit their own profile and wishlist.
- **SEO**: per-page metadata, Open Graph tags, product JSON-LD,
  `sitemap.xml`, `robots.txt`.

---

## 2. Requirements

- Node.js 20+
- A free [Supabase](https://supabase.com) project
- A WhatsApp Business (or personal) number to receive orders
- A [PhonePe Business](https://business.phonepe.com) account with Payment
  Gateway (Standard Checkout) access, for UPI payments
- A [Delhivery](https://www.delhivery.com) business/API account, for
  delivery-charge calculation

---

## 3. Environment variables

Copy `.env.local.example` to `.env.local` and fill in real values:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase project's public **anon** key |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Digits-only WhatsApp number with country code, e.g. `919876543210` for a `+91 98765 43210` India number. No `+`, spaces or dashes. |
| `NEXT_PUBLIC_SITE_URL` | The public URL the site is deployed at (used for SEO tags, the sitemap, and PhonePe's redirect URL). Use `http://localhost:3000` locally. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret.** Server-only. Used in exactly one place — see "The one service-role-key exception" below. |
| `DELHIVERY_API_TOKEN` | **Secret.** Server-only. Your Delhivery API token, from your Delhivery business account. |
| `DELHIVERY_ORIGIN_PINCODE` | The pincode you ship from (e.g. `123106`). Not secret, but server-only — no need to expose it to the browser. |
| `PHONEPE_CLIENT_ID` | **Secret.** Server-only. From the PhonePe Business Dashboard's developer/API settings. |
| `PHONEPE_CLIENT_SECRET` | **Secret.** Server-only. |
| `PHONEPE_CLIENT_VERSION` | From the same dashboard page; usually `1`. |
| `PHONEPE_ENV` | `sandbox` while testing, `production` once live. |
| `PHONEPE_WEBHOOK_USERNAME` / `PHONEPE_WEBHOOK_PASSWORD` | **Secret.** A username/password pair you invent and set in two places: here, and in the PhonePe dashboard's webhook configuration (see section 6c) — they must match exactly. |

### The one service-role-key exception

Every write in this app goes through the signed-in user's own session and
Row Level Security — **except one**. When PhonePe confirms a payment, it
calls your server directly (a server-to-server webhook); there's no
customer browser session to authenticate that call. That one code path
(`src/lib/orders.ts`, used only from `src/app/api/phonepe/webhook/route.ts`
and the checkout-return page) uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS
and record the payment. It is never imported anywhere else, and the key
itself is a plain server environment variable — it never has a
`NEXT_PUBLIC_` prefix, so it's never sent to the browser.

Get this key from Supabase Dashboard → **Project Settings → API** →
**service_role** key (keep it secret — anyone with it has full database
access, bypassing every RLS policy).

---

## 4. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Once it's provisioned, open **Project Settings → API** and copy the
   **Project URL** and **anon public** key into `.env.local`.

---

## 5. Configure the database

1. Open the Supabase Dashboard → **SQL Editor**.
2. Paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) and
   run it. This creates:
   - `categories`, `products`, `product_images`, `product_sizes`,
     `product_colors` tables (with indexes and an auto-calculated
     `discount_percentage` column on `products`)
   - Row Level Security policies: public read access on every table,
     write access restricted to authenticated (admin) users
   - A public `product-images` Storage bucket with matching policies
   - The three starter categories: **Bags**, **Clothing**, **Other**
3. (Optional but recommended for first run) Paste and run
   [`supabase/seed.sql`](./supabase/seed.sql) to add six clearly-labelled
   demo products so you can see the site working end to end.
4. Paste and run [`supabase/migration_002_accounts.sql`](./supabase/migration_002_accounts.sql).
   This adds customer accounts and wishlists (see section 6a) and, importantly,
   **locks down catalogue writes to admins only** — do not skip this step.
   It automatically promotes whichever Supabase Auth user(s) already exist at
   the time you run it (i.e. the admin account you created) to admin status,
   so nothing breaks.
5. Paste and run [`supabase/migration_003_subcategories.sql`](./supabase/migration_003_subcategories.sql).
   This adds an optional `parent_id` to categories so you can nest them one
   level deep (e.g. Bags → Totes, Bags → Slings) from `/admin/categories`.
6. Paste and run [`supabase/migration_004_commerce.sql`](./supabase/migration_004_commerce.sql).
   This adds `weight_grams` to products, plus `cart_items`, `orders`, and
   `order_items` tables (with RLS designed so a customer can never mark
   their own order "paid" — only the server can, after independently
   re-checking with PhonePe) and the `decrement_product_stock` function
   that auto-reduces stock and flips a product to "Sold Out" at zero.

You can re-run `schema.sql`, `migration_002_accounts.sql`,
`migration_003_subcategories.sql`, and `migration_004_commerce.sql` safely —
all four use `if not exists` / `drop policy if exists` guards. `seed.sql` is
not idempotent; running it twice will create duplicate demo products (their
slugs will conflict and the insert will fail for those rows only).

The admin can create additional categories (and subcategories) at any time
from `/admin/categories` — you are not limited to Bags/Clothing/Other.

---

## 6. Configure storage

`schema.sql` already creates a public bucket called `product-images` with
the correct policies (public read, authenticated write). Nothing else to
configure — when the admin uploads images through the dashboard, they're
stored there automatically and served via Supabase's CDN.

---

## 6a. Customer accounts & wishlist (magic link login)

Customers can create a free account to save products to a personal wishlist
and store their name/phone so it's pre-filled into future WhatsApp order
messages. Sign-in uses a **passwordless magic link** — the customer enters
their email at `/account/login` and gets a one-click login link, no
password to remember. Signing in is also required to use the cart/checkout.

This is a completely separate account system from the admin login (see
section 7) — customer accounts can never access `/admin`, enforced by the
`admin_users` table from `migration_002_accounts.sql`.

**One-time setup required** for the magic link emails to redirect back to
your site correctly:

1. Supabase Dashboard → **Authentication → URL Configuration**.
2. Set **Site URL** to your production URL, e.g. `https://hibranso.com`.
3. Under **Redirect URLs**, add:
   - `https://hibranso.com/auth/callback` (your production domain)
   - `http://localhost:3000/auth/callback` (for local development)
4. Save.

No SMTP setup is required — Supabase sends the magic link email for you out
of the box (fine for normal traffic levels; for high volume you can later
configure your own SMTP provider in the same settings page).

---

## 6b. Delhivery delivery-charge calculation (or a flat fee)

Delivery charges are calculated live at checkout from your Delhivery
account's rate calculator, using the customer's destination pincode and the
shipment's total weight (each product has a `weight_grams` field in the
admin form, defaulting to 300g).

**If you haven't activated a Delhivery business account yet** (or don't
want to), you don't need one to launch — leave `DELHIVERY_API_TOKEN` and
`DELHIVERY_ORIGIN_PINCODE` unset, and every order gets a flat delivery fee
instead (`FLAT_DELIVERY_FEE`, defaults to ₹149 if not set). The moment you
add both Delhivery variables later, live rate calculation takes over
automatically — nothing else to change.

To use live Delhivery rates instead:

1. In your Delhivery business account, find your **API token** (Delhivery
   dashboard → API / Integration settings) — this requires your account to
   be activated (business details, pickup address, bank details) first.
2. Set `DELHIVERY_API_TOKEN` to that token, and `DELHIVERY_ORIGIN_PINCODE`
   to the pincode you ship from.

**Important — this could not be tested against a live Delhivery account
from the environment that built it** (no outbound network access to
external services there). The integration (`src/lib/delhivery.ts`) is built
against Delhivery's publicly documented "Invoice Charges" rate-calculator
endpoint, but you should treat your first real checkout as the actual test:

- Add a product to your cart and go to checkout with a real address.
- If the delivery charge doesn't appear (an error shows instead), check
  your server logs — the raw Delhivery response is logged on failure. The
  response shape can vary by account; if the charge amount is in a
  differently-named field, update `parseChargeFromResponse` in
  `src/lib/delhivery.ts` to match.

---

## 6c. PhonePe UPI payment setup

Online payments are collected via **PhonePe's Standard Checkout (v2)**
integration — the customer is redirected to a PhonePe-hosted page to pay by
UPI, then redirected back to your site.

1. Log into the [PhonePe Business Dashboard](https://business.phonepe.com)
   and open **Developer Settings** (or **API keys**) under Payment Gateway.
2. Copy your **Client ID**, **Client Secret**, and **Client Version** into
   `PHONEPE_CLIENT_ID`, `PHONEPE_CLIENT_SECRET`, `PHONEPE_CLIENT_VERSION`.
3. Set `PHONEPE_ENV=sandbox` for testing (switch to `production` only once
   you've tested a real payment end to end).
4. In the dashboard's payment-method settings, **restrict accepted payment
   methods to UPI only** (this is usually an account-level setting rather
   than something the API can force per request).
5. Under **Webhooks** (or **Server callbacks**), add this URL:
   ```
   https://hibranso.com/api/phonepe/webhook
   ```
   and set a username/password there — put the exact same values in
   `PHONEPE_WEBHOOK_USERNAME` and `PHONEPE_WEBHOOK_PASSWORD`.

**Important — this could not be tested against a live PhonePe account from
the environment that built it** either, for the same reason as Delhivery
above. The integration (`src/lib/phonepe.ts`) is built exactly to PhonePe's
documented Standard Checkout v2 API contract (OAuth token → create payment
→ redirect → re-verify status), but PhonePe's exact endpoint paths have
shifted across API generations and merchant plans. Before relying on it:

- Run one full test purchase in sandbox mode end to end.
- If payment creation or status-checking fails, check your server logs
  (the raw PhonePe response is logged) and compare the URLs in
  `src/lib/phonepe.ts`'s `DEFAULT_URLS` against what your dashboard's
  integration guide shows for your account. You can override any of them
  without touching code via `PHONEPE_AUTH_URL`, `PHONEPE_PAY_URL`, and
  `PHONEPE_STATUS_URL_BASE`.
- Never trust a successful browser redirect alone — `confirmOrderPaid()` in
  `src/lib/orders.ts` always re-checks payment status directly with PhonePe
  before marking an order paid or touching stock, precisely because a
  redirect can be spoofed.

---

## 7. Create the admin account

There is intentionally **no public sign-up page** for admins — only users
listed in the `admin_users` table (added by `migration_002_accounts.sql`,
section 5) can access `/admin`. A regular customer account (section 6a)
never gets admin access, even if they're logged in.

To create an admin:

1. Supabase Dashboard → **Authentication → Users → Add user**.
2. Enter an email and password (choose "Auto Confirm User" so it's usable
   immediately).
3. Run this once in the SQL editor to grant admin access to that user
   (replace the email):
   ```sql
   insert into public.admin_users (id)
   select id from auth.users where email = 'you@example.com'
   on conflict (id) do nothing;
   ```
   (If you ran `migration_002_accounts.sql` *after* already creating your
   first admin user, this step was already done for you automatically —
   only needed for admins added afterwards.)
4. Go to `/admin/login` on your site and sign in with those credentials.

Repeat to add more admin users. To revoke access, either delete the user
from the Supabase Dashboard, or just delete their row from `admin_users`
(their customer account, if any, keeps working — they just lose admin
access).

---

## 8. Run the project locally

```bash
npm install
cp .env.local.example .env.local   # then fill in real values
npm run dev
```

Visit `http://localhost:3000` for the storefront and
`http://localhost:3000/admin/login` for the admin dashboard.

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build locally
npm run lint    # ESLint
```

---

## 9. Deploy to Vercel

1. Push this repository to GitHub (or GitLab/Bitbucket).
2. In [Vercel](https://vercel.com), **Add New Project** and import the repo.
3. Vercel auto-detects Next.js — no build settings need to change.
4. Under **Environment Variables**, add every variable from `.env.local`
   (use your real production `NEXT_PUBLIC_SITE_URL`, e.g.
   `https://hibranso.com`) — all of them, including the PhonePe, Delhivery,
   and `SUPABASE_SERVICE_ROLE_KEY` ones from section 3. Mark the secret ones
   (service-role key, PhonePe client secret, Delhivery token, webhook
   password) as **Sensitive** in Vercel's UI so they're write-only.
5. Deploy.
6. In Supabase, no extra CORS/config is needed — the anon key and
   Storage/Auth endpoints work from any origin by default.

If you later add a custom domain in Vercel, update `NEXT_PUBLIC_SITE_URL`
to match and redeploy so SEO metadata and the sitemap use the right domain.

---

## 10. Project structure

```
src/
  app/
    (site)/            Storefront pages (Home, Shop, Category, Product, About, Contact,
                        account, account/login, cart, checkout, checkout/return)
                        — share the customer Header/Footer/WhatsApp button layout
    admin/
      login/            Admin login (no sidebar)
      (dashboard)/       Overview, Products (list/new/edit), Categories, Orders
                          — protected: requires an admin_users-listed Supabase user
    api/phonepe/webhook/ PhonePe server-to-server payment callback
    auth/callback/       Exchanges a magic-link code for a customer session
    sitemap.ts, robots.ts
  components/
    site/               Header (nav + search/wishlist/account/cart icons), MobileNav,
                        Footer, Logo, WhatsApp floating button
    home/               Hero, CategoryGrid, ProductRail, PromoBanner, AboutTeaser
    shop/                ProductCard, ProductGrid, ShopFilters, CategorySortSelect
    product/            ImageGallery, PriceBlock, ProductPurchasePanel (size/colour/qty,
                        Add to Cart + WhatsApp buttons), WishlistButton
    cart/               CartItemRow
    checkout/           CheckoutForm (delivery address + live Delhivery rate)
    account/            MagicLinkForm, ProfileForm
    admin/               LoginForm, AdminSidebar, ProductForm, CategoryForm,
                        CategoriesManager, DeleteProductButton, OrderStatusSelect
    ui/                 Button, Badge, Container
  lib/
    supabase/           client.ts (browser), server.ts (cookie-bound, used by admin/
                        customer auth & server actions), public.ts (stateless anon
                        client for storefront reads), admin.ts (service-role client —
                        payment confirmation ONLY), middleware.ts
    actions/            Server Actions: products, categories, auth, customerAuth,
                        customer (profile/wishlist), cart, checkout, orders (admin)
    products.ts          Catalogue data-fetching (storefront + admin)
    customer.ts, cart.ts, adminOrders.ts  Account/cart/order data-fetching
    orders.ts            confirmOrderPaid() — the single source of truth for marking
                        an order paid and decrementing stock (idempotent)
    phonepe.ts           PhonePe Standard Checkout v2 integration
    delhivery.ts         Delhivery rate-calculator integration
    whatsapp.ts, format.ts, slug.ts, types.ts
  middleware.ts          Protects every /admin route (admin_users check) and
                        refreshes the session on /account routes
supabase/
  schema.sql             Catalogue DDL + RLS policies + storage bucket + starter categories
  migration_002_accounts.sql     admin_users, customer_profiles, wishlists
  migration_003_subcategories.sql  categories.parent_id
  migration_004_commerce.sql     weight_grams, cart_items, orders, order_items,
                        decrement_product_stock()
  seed.sql               Demo product data (clearly labelled, not real inventory)
public/demo/              Placeholder SVG images used only by the demo products
```

---

## 11. How WhatsApp ordering & checkout work

There are two ways a customer can buy, side by side:

**1. Buy on WhatsApp (no account needed)** — `NEXT_PUBLIC_WHATSAPP_NUMBER`
is read once in `src/lib/whatsapp.ts` and used everywhere a WhatsApp link
is built — it is never hard-coded elsewhere in the app. Every "Buy on
WhatsApp" button opens:

```
https://wa.me/<number>?text=<url-encoded message>
```

with a message in the format:

```
Hi Hibranso, I am interested in purchasing:
Product: [PRODUCT NAME]
Price: ₹[SELLING PRICE]
MRP: ₹[MRP]
Link: [PRODUCT PAGE URL]
Size: [SELECTED SIZE]      (only if the product has sizes)
Colour: [SELECTED COLOUR]  (only if the product has colours)
Name: [CUSTOMER NAME]      (only if signed in with a saved name)
```

**2. Cart + online payment (UPI, signed in)** — add to cart from the
product page, check out with a delivery address, pay via PhonePe. On
confirmed payment: stock is decremented (auto sold-out at zero), the order
appears in `/admin/orders`, and the customer's confirmation page offers a
one-tap **"Notify us on WhatsApp"** button with a message summarising the
order and delivery address — true fully-automatic WhatsApp messages *to*
Hibranso aren't possible without separately integrating Meta's WhatsApp
Business Platform API (a much larger, business-verification-gated
integration), so this keeps a human in the loop with one tap instead.

If a product has sizes and/or colours defined, the customer must pick one
of each before either path becomes available, so every message/order is
accurate.

---

## 12. Security notes

- Every table has Row Level Security enabled. Public (anon) role can only
  `SELECT` the catalogue; catalogue `INSERT`/`UPDATE`/`DELETE` require the
  user to be listed in `admin_users` (not just "any logged-in user" — that
  changed once customer accounts were added, see `migration_002_accounts.sql`).
- `customer_profiles`, `wishlists`, and `cart_items` are scoped per-user
  (`auth.uid() = id` / `auth.uid() = user_id`), so a customer can never see
  or edit another customer's data.
- `orders`/`order_items`: a customer can create their own order (always
  starting `status = 'created'`, `payment_status = 'pending'` — enforced by
  the RLS check, not just application code) and can only ever read their
  own orders. There is **no customer UPDATE policy on `orders` at all** —
  a customer cannot mark their own order "paid" by any client-side request,
  no matter what they send. Only the server, using
  `SUPABASE_SERVICE_ROLE_KEY` after independently re-verifying payment with
  PhonePe, can do that (see "The one service-role-key exception" in
  section 3). Admins (via `admin_users`) can read and update all orders,
  for fulfillment tracking.
- `decrement_product_stock` (the function that reduces stock and auto-flips
  `is_available`) has `EXECUTE` revoked from `anon`/`authenticated` and
  granted only to `service_role` — a customer cannot call it directly.
- `/admin/*` (except `/admin/login`) is protected by `src/middleware.ts`,
  which checks both "is logged in" AND "is in `admin_users`" before letting
  a request through — a logged-in customer is redirected just like a
  logged-out visitor. The admin dashboard layout
  (`src/app/admin/(dashboard)/layout.tsx`) re-checks the same thing
  server-side as a second layer of defence.
- The PhonePe webhook (`/api/phonepe/webhook`) verifies PhonePe's
  Authorization header against `PHONEPE_WEBHOOK_USERNAME`/`PASSWORD` before
  trusting a payload, and even then re-checks payment status directly with
  PhonePe rather than trusting the webhook body — a spoofed webhook call
  cannot mark an order paid.
- `robots.txt` disallows crawling `/admin`, and every admin page sets
  `robots: { index: false }`.

---

## 13. What's left to configure (next steps for you)

This app is fully built and functional, but it ships **unconfigured** —
you need to:

1. Create a Supabase project and add its URL/anon key to `.env.local`
   (and to Vercel once deployed) — see sections 4–6.
2. Run `supabase/schema.sql`, `migration_002_accounts.sql`,
   `migration_003_subcategories.sql`, and `migration_004_commerce.sql` (and
   optionally `seed.sql`) in the Supabase SQL editor — see section 5.
3. Create your first admin user in Supabase Auth — see section 7.
4. Configure the magic-link redirect URLs in Supabase Auth — see section 6a.
5. Set `NEXT_PUBLIC_WHATSAPP_NUMBER` to Hibranso's real WhatsApp number.
6. Set up Delhivery (API token + origin pincode) — see section 6b. **Test
   a real checkout's delivery-charge calculation before relying on it.**
7. Set up PhonePe (client ID/secret, webhook) — see section 6c. **Run at
   least one full sandbox purchase end to end before going live.**
8. Set `NEXT_PUBLIC_SITE_URL` to your real production domain once deployed.
9. Log into `/admin`, delete the `[DEMO]` products, and add real Hibranso
   products — including setting each one's weight (used for delivery
   pricing) and stock quantity (used for auto sold-out).
10. Deploy to Vercel — see section 9.
