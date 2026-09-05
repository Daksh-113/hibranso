# Hibranso

A premium product-catalogue website for **Hibranso** — bags, clothing and
lifestyle accessories. Customers browse the catalogue and order directly on
WhatsApp; there is no cart, checkout or online payment.

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
  WhatsApp with a pre-filled message (product, price, MRP, size, colour) —
  no checkout flow anywhere.
- **Admin dashboard** at `/admin`: secure login, product CRUD (multiple
  images, sizes, colours, MRP/selling price with auto-calculated discount,
  availability, featured/bestseller flags), category CRUD, search & filter.
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
| `NEXT_PUBLIC_SITE_URL` | The public URL the site is deployed at (used for SEO tags and the sitemap). Use `http://localhost:3000` locally. |

**Never** create or expose a `SUPABASE_SERVICE_ROLE_KEY` in this app. It is
not used anywhere — every admin write goes through the logged-in admin's own
session, checked by Row Level Security. Only ever put the service-role key
in a trusted server context if you add one later, and never with a
`NEXT_PUBLIC_` prefix.

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

You can re-run `schema.sql`, `migration_002_accounts.sql`, and
`migration_003_subcategories.sql` safely — all three use `if not exists` /
`drop policy if exists` guards. `seed.sql` is not idempotent; running it
twice will create duplicate demo products (their slugs will conflict and
the insert will fail for those rows only).

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
password to remember.

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
4. Under **Environment Variables**, add the same four variables from
   `.env.local` (use your real production `NEXT_PUBLIC_SITE_URL`, e.g.
   `https://hibranso.com`).
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
    (site)/            Storefront pages (Home, Shop, Category, Product, About, Contact)
                        — share the customer Header/Footer/WhatsApp button layout
    admin/
      login/            Admin login (no sidebar)
      (dashboard)/       Overview, Products (list/new/edit), Categories
                          — protected: requires a logged-in Supabase user
    reel-editor/        Standalone audio-driven clip editor (see section 14)
                          — unauthenticated, not indexed, no Supabase dependency
    sitemap.ts, robots.ts
  components/
    site/               Header, MobileNav, Footer, Logo, WhatsApp floating button
    home/               Hero, CategoryGrid, ProductRail, PromoBanner, AboutTeaser
    shop/                ProductCard, ProductGrid, ShopFilters, CategorySortSelect
    product/            ImageGallery, PriceBlock, ProductPurchasePanel (size/colour + WhatsApp button)
    admin/               LoginForm, AdminSidebar, ProductForm, CategoryForm, CategoriesManager, DeleteProductButton
    ui/                 Button, Badge, Container
  lib/
    supabase/           client.ts (browser), server.ts (cookie-bound, used by admin auth & server actions),
                        public.ts (stateless anon client for storefront reads), middleware.ts
    actions/            Server Actions for product/category CRUD and admin auth
    products.ts          All data-fetching for the catalogue (storefront + admin)
    whatsapp.ts, format.ts, slug.ts, types.ts
  middleware.ts          Protects every /admin route except /admin/login
supabase/
  schema.sql             Full DDL + RLS policies + storage bucket + starter categories
  seed.sql               Demo product data (clearly labelled, not real inventory)
public/demo/              Placeholder SVG images used only by the demo products
```

---

## 11. How WhatsApp ordering works

`NEXT_PUBLIC_WHATSAPP_NUMBER` is read once in `src/lib/whatsapp.ts` and used
everywhere a WhatsApp link is built — it is never hard-coded elsewhere in
the app. Every "Buy on WhatsApp" button opens:

```
https://wa.me/<number>?text=<url-encoded message>
```

with a message in the format:

```
Hi Hibranso, I am interested in purchasing:
Product: [PRODUCT NAME]
Price: ₹[SELLING PRICE]
MRP: ₹[MRP]
Size: [SELECTED SIZE]      (only if the product has sizes)
Colour: [SELECTED COLOUR]  (only if the product has colours)
```

If a product has sizes and/or colours defined, the customer must pick one
of each before the button becomes active, so the message is always
accurate.

---

## 12. Security notes

- Every table has Row Level Security enabled. Public (anon) role can only
  `SELECT` the catalogue; catalogue `INSERT`/`UPDATE`/`DELETE` require the
  user to be listed in `admin_users` (not just "any logged-in user" — that
  changed once customer accounts were added, see `migration_002_accounts.sql`).
- `customer_profiles` and `wishlists` are scoped per-user (`auth.uid() = id` /
  `auth.uid() = user_id`), so a customer can never see or edit another
  customer's data.
- `/admin/*` (except `/admin/login`) is protected by `src/middleware.ts`,
  which checks both "is logged in" AND "is in `admin_users`" before letting
  a request through — a logged-in customer is redirected just like a
  logged-out visitor. The admin dashboard layout
  (`src/app/admin/(dashboard)/layout.tsx`) re-checks the same thing
  server-side as a second layer of defence.
- No service-role key is used anywhere in this codebase — admin writes rely
  entirely on the logged-in user's own session plus RLS, so there is
  nothing secret to leak to the browser.
- `robots.txt` disallows crawling `/admin`, and every admin page sets
  `robots: { index: false }`.

---

## 13. What's left to configure (next steps for you)

This app is fully built and functional, but it ships **unconfigured** —
you need to:

1. Create a Supabase project and add its URL/anon key to `.env.local`
   (and to Vercel once deployed) — see sections 4–6.
2. Run `supabase/schema.sql` (and optionally `supabase/seed.sql`) in the
   Supabase SQL editor.
3. Create your first admin user in Supabase Auth — see section 7.
4. Set `NEXT_PUBLIC_WHATSAPP_NUMBER` to Hibranso's real WhatsApp number.
5. Set `NEXT_PUBLIC_SITE_URL` to your real production domain once deployed.
6. Log into `/admin`, delete the `[DEMO]` products, and add real Hibranso
   products, images, categories, sizes and colours.
7. Deploy to Vercel — see section 9.

---

## 14. Reel Editor (`/reel-editor`)

A standalone, audio-driven clip editor for cutting Instagram/social reels —
unrelated to the product catalogue, has no Supabase dependency, and isn't
linked from site navigation or indexed by search engines.

Workflow:

1. **Upload audio** — the track for your reel. Beats are detected client-side
   with the Web Audio API (energy-based onset detection with an
   adaptive-sensitivity threshold, falling back to fixed-interval markers if
   too few onsets are found). A "cut density" control (every beat / every 2nd
   / 4th / 8th) determines how many of the detected beats become cuts.
2. **Upload video clips** — your raw footage, in any order; reorder or remove
   them with the controls on each thumbnail.
3. **Timeline** — auto-arranged by slicing the audio at each active beat and
   assigning clips to the slots in rotation (each clip continues from where
   it last left off, looping back to its start if it runs out of footage).
   Reassign the clip used for any cut, remove a cut (merging it into the
   previous one), or hit "Auto-arrange from beats" to regenerate from
   scratch.
4. **Preview** — synced playback using the audio element as the master clock,
   swapping/seeking the preview `<video>` to match the active segment.
5. **Export** — renders entirely in the browser with
   [`ffmpeg.wasm`](https://ffmpegwasm.netlify.app/) (nothing is uploaded to a
   server): each segment is trimmed and scaled to the chosen aspect ratio
   (Reel 9:16, Square 1:1, or Landscape 16:9), concatenated, and muxed with
   the audio track into a downloadable `.mp4`.

No configuration or environment variables are needed for this tool — it works
the moment the app is deployed. Rendering is CPU-bound and single-threaded
(no `SharedArrayBuffer`/COOP-COEP headers required), so longer reels take
longer to export; keep the tab open until it finishes.
