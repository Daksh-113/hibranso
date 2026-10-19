"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { clsx } from "clsx";
import type { ProductColor, ProductSize } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { buildProductWhatsAppLink } from "@/lib/whatsapp";
import { addToCartAction } from "@/lib/actions/cart";

export function ProductPurchasePanel({
  product,
  sizes,
  colors,
  customerName = null,
  isLoggedIn = false,
}: {
  product: { id: string; name: string; slug: string; mrp: number; selling_price: number; is_available: boolean; stock_quantity: number | null };
  sizes: ProductSize[];
  colors: ProductColor[];
  customerName?: string | null;
  isLoggedIn?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const needsSize = sizes.length > 0 && !selectedSize;
  const needsColor = colors.length > 0 && !selectedColor;
  const canBuy = product.is_available && !needsSize && !needsColor;
  const maxQuantity = product.stock_quantity ?? 99;

  const whatsappHref = useMemo(
    () =>
      buildProductWhatsAppLink(product, {
        size: selectedSize,
        color: selectedColor,
        customerName,
      }),
    [product, selectedSize, selectedColor, customerName]
  );

  function handleAddToCart() {
    if (!canBuy) return;
    if (!isLoggedIn) {
      router.push(`/account/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setCartMessage(null);
    startTransition(async () => {
      const result = await addToCartAction(product.id, selectedSize, selectedColor, quantity);
      if (result.error === "not_signed_in") {
        router.push(`/account/login?next=${encodeURIComponent(pathname)}`);
      } else if (result.error) {
        setCartMessage("Could not add to cart. Please try again.");
      } else {
        setCartMessage("Added to cart.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {sizes.length > 0 && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-stone">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size.id}
                type="button"
                disabled={!size.is_available}
                onClick={() => setSelectedSize(size.size)}
                className={clsx(
                  "min-w-[3rem] border px-3 py-2 text-sm transition-colors",
                  selectedSize === size.size
                    ? "border-charcoal bg-charcoal text-ivory"
                    : "border-line text-charcoal hover:border-charcoal",
                  !size.is_available && "cursor-not-allowed opacity-40 line-through"
                )}
              >
                {size.size}
              </button>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-stone">
            Colour{selectedColor ? `: ${selectedColor}` : ""}
          </p>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => (
              <button
                key={color.id}
                type="button"
                disabled={!color.is_available}
                onClick={() => setSelectedColor(color.name)}
                aria-label={color.name}
                title={color.name}
                className={clsx(
                  "h-9 w-9 rounded-full border-2 transition-transform",
                  selectedColor === color.name ? "border-charcoal scale-110" : "border-line",
                  !color.is_available && "cursor-not-allowed opacity-30"
                )}
                style={{ backgroundColor: color.hex_code ?? "#cccccc" }}
              />
            ))}
          </div>
        </div>
      )}

      {product.is_available && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-stone">Quantity</p>
          <div className="inline-flex items-center border border-line">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-2 text-charcoal hover:bg-cream"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-10 text-center text-sm">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
              className="px-3 py-2 text-charcoal hover:bg-cream"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {!product.is_available ? (
          <Button variant="primary" size="lg" className="w-full bg-stone-light" disabled>
            Currently Sold Out
          </Button>
        ) : (
          <>
            <Button
              type="button"
              onClick={handleAddToCart}
              disabled={!canBuy || pending}
              variant="primary"
              size="lg"
              className={clsx("w-full", !canBuy && "pointer-events-none opacity-50")}
            >
              {pending ? "Adding…" : "Add to Cart"}
            </Button>
            <Button
              href={canBuy ? whatsappHref : "#"}
              target={canBuy ? "_blank" : undefined}
              rel={canBuy ? "noopener noreferrer" : undefined}
              variant="whatsapp"
              size="lg"
              className={clsx("w-full", !canBuy && "pointer-events-none opacity-50")}
            >
              Buy on WhatsApp
            </Button>
          </>
        )}
        {cartMessage && <p className="text-center text-xs text-stone">{cartMessage}</p>}
        {(needsSize || needsColor) && product.is_available && (
          <p className="text-center text-xs text-stone">
            Please select a {needsSize ? "size" : "colour"} to continue.
          </p>
        )}
      </div>
    </div>
  );
}
