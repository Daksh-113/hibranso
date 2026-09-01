-- ============================================================================
-- Hibranso — migration 003: subcategories
-- ============================================================================
-- Run this in the Supabase SQL editor AFTER schema.sql and
-- migration_002_accounts.sql. Adds an optional parent category, so you can
-- nest categories one level deep (e.g. Bags -> Totes, Bags -> Slings).
--
-- A category with parent_id = null is a top-level category (shown in the
-- main navigation). A category with parent_id set is a subcategory of that
-- parent (shown nested under it, and its products also appear when browsing
-- the parent category).
-- ============================================================================

alter table public.categories
  add column if not exists parent_id uuid references public.categories(id) on delete set null;

create index if not exists categories_parent_id_idx on public.categories (parent_id);
