-- ============================================================================
-- Hibranso — demo catalogue data
-- ============================================================================
-- These are NOT real Hibranso products. They exist only so the freshly
-- built site has something to show. Every name is prefixed "[DEMO]" and the
-- description says so explicitly. Delete them from the admin dashboard
-- whenever you're ready to add real products.
--
-- Run this AFTER schema.sql, in the Supabase SQL editor.
-- ============================================================================

do $$
declare
  v_bags_id      uuid;
  v_clothing_id  uuid;
  v_other_id     uuid;
  v_product_id   uuid;
begin
  select id into v_bags_id     from public.categories where slug = 'bags';
  select id into v_clothing_id from public.categories where slug = 'clothing';
  select id into v_other_id    from public.categories where slug = 'other';

  -- ------------------------------------------------------------------------
  -- DEMO 1: Bag, featured + bestseller
  -- ------------------------------------------------------------------------
  insert into public.products (name, slug, description, category_id, mrp, selling_price, sku, is_available, is_featured, is_bestseller, stock_quantity)
  values (
    '[DEMO] Heritage Tote Bag',
    'demo-heritage-tote-bag',
    'This is a placeholder demo product used to preview the Hibranso storefront. It is not a real Hibranso product. A spacious structured tote with a soft-grain finish, reinforced handles and an interior zip pocket — ready for daily carry.',
    v_bags_id, 6999.00, 4199.00, 'DEMO-BAG-001', true, true, true, 12
  )
  returning id into v_product_id;

  insert into public.product_images (product_id, image_url, alt_text, display_order) values
    (v_product_id, '/demo/bag-1.svg', 'Demo heritage tote bag — front', 1),
    (v_product_id, '/demo/bag-2.svg', 'Demo heritage tote bag — detail', 2);

  insert into public.product_colors (product_id, name, hex_code, display_order) values
    (v_product_id, 'Espresso Brown', '#3b2a20', 1),
    (v_product_id, 'Jet Black', '#111111', 2);

  -- ------------------------------------------------------------------------
  -- DEMO 2: Bag, available, not featured
  -- ------------------------------------------------------------------------
  insert into public.products (name, slug, description, category_id, mrp, selling_price, sku, is_available, is_featured, is_bestseller, stock_quantity)
  values (
    '[DEMO] Everyday Sling Bag',
    'demo-everyday-sling-bag',
    'This is a placeholder demo product used to preview the Hibranso storefront. It is not a real Hibranso product. A compact crossbody sling with an adjustable strap, sized for essentials on the go.',
    v_bags_id, 3499.00, 2799.00, 'DEMO-BAG-002', true, false, false, 20
  )
  returning id into v_product_id;

  insert into public.product_images (product_id, image_url, alt_text, display_order) values
    (v_product_id, '/demo/bag-2.svg', 'Demo everyday sling bag', 1);

  insert into public.product_colors (product_id, name, hex_code, display_order) values
    (v_product_id, 'Tan', '#c8a574', 1),
    (v_product_id, 'Jet Black', '#111111', 2);

  -- ------------------------------------------------------------------------
  -- DEMO 3: Clothing, featured
  -- ------------------------------------------------------------------------
  insert into public.products (name, slug, description, category_id, mrp, selling_price, sku, is_available, is_featured, is_bestseller, stock_quantity)
  values (
    '[DEMO] Tailored Overshirt',
    'demo-tailored-overshirt',
    'This is a placeholder demo product used to preview the Hibranso storefront. It is not a real Hibranso product. A relaxed-fit overshirt in a heavyweight cotton blend, finished with corozo buttons and a clean collar.',
    v_clothing_id, 4499.00, 3149.00, 'DEMO-CLO-001', true, true, false, 8
  )
  returning id into v_product_id;

  insert into public.product_images (product_id, image_url, alt_text, display_order) values
    (v_product_id, '/demo/clothing-1.svg', 'Demo tailored overshirt — front', 1),
    (v_product_id, '/demo/clothing-2.svg', 'Demo tailored overshirt — detail', 2);

  insert into public.product_sizes (product_id, size, display_order) values
    (v_product_id, 'S', 1), (v_product_id, 'M', 2), (v_product_id, 'L', 3), (v_product_id, 'XL', 4);

  insert into public.product_colors (product_id, name, hex_code, display_order) values
    (v_product_id, 'Charcoal', '#3a3a3a', 1),
    (v_product_id, 'Olive', '#5c5a3f', 2);

  -- ------------------------------------------------------------------------
  -- DEMO 4: Clothing, bestseller, low stock
  -- ------------------------------------------------------------------------
  insert into public.products (name, slug, description, category_id, mrp, selling_price, sku, is_available, is_featured, is_bestseller, stock_quantity)
  values (
    '[DEMO] Classic Fit Shirt',
    'demo-classic-fit-shirt',
    'This is a placeholder demo product used to preview the Hibranso storefront. It is not a real Hibranso product. A wardrobe staple in breathable cotton poplin, cut for a classic, comfortable fit.',
    v_clothing_id, 2999.00, 2099.00, 'DEMO-CLO-002', true, false, true, 3
  )
  returning id into v_product_id;

  insert into public.product_images (product_id, image_url, alt_text, display_order) values
    (v_product_id, '/demo/clothing-2.svg', 'Demo classic fit shirt', 1);

  insert into public.product_sizes (product_id, size, display_order) values
    (v_product_id, 'S', 1), (v_product_id, 'M', 2), (v_product_id, 'L', 3);

  insert into public.product_colors (product_id, name, hex_code, display_order) values
    (v_product_id, 'White', '#f5f5f0', 1),
    (v_product_id, 'Sky Blue', '#a9c6da', 2);

  -- ------------------------------------------------------------------------
  -- DEMO 5: Other / accessories, out of stock example
  -- ------------------------------------------------------------------------
  insert into public.products (name, slug, description, category_id, mrp, selling_price, sku, is_available, is_featured, is_bestseller, stock_quantity)
  values (
    '[DEMO] Leather Belt',
    'demo-leather-belt',
    'This is a placeholder demo product used to preview the Hibranso storefront. It is not a real Hibranso product. A full-grain leather belt with a brushed metal buckle.',
    v_other_id, 1999.00, 1499.00, 'DEMO-OTH-001', false, false, false, 0
  )
  returning id into v_product_id;

  insert into public.product_images (product_id, image_url, alt_text, display_order) values
    (v_product_id, '/demo/other-1.svg', 'Demo leather belt', 1);

  insert into public.product_sizes (product_id, size, display_order) values
    (v_product_id, '32', 1), (v_product_id, '34', 2), (v_product_id, '36', 3);

  -- ------------------------------------------------------------------------
  -- DEMO 6: Other / accessories, featured + bestseller, high discount
  -- ------------------------------------------------------------------------
  insert into public.products (name, slug, description, category_id, mrp, selling_price, sku, is_available, is_featured, is_bestseller, stock_quantity)
  values (
    '[DEMO] Signature Sunglasses',
    'demo-signature-sunglasses',
    'This is a placeholder demo product used to preview the Hibranso storefront. It is not a real Hibranso product. UV-protected acetate sunglasses with a bold, contemporary silhouette.',
    v_other_id, 2499.00, 1249.00, 'DEMO-OTH-002', true, true, true, 15
  )
  returning id into v_product_id;

  insert into public.product_images (product_id, image_url, alt_text, display_order) values
    (v_product_id, '/demo/other-2.svg', 'Demo signature sunglasses', 1);

  insert into public.product_colors (product_id, name, hex_code, display_order) values
    (v_product_id, 'Tortoise', '#6b4a2f', 1),
    (v_product_id, 'Black', '#111111', 2);

end $$;
