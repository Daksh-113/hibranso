"use client";

import { useMemo, useState } from "react";
import { clsx } from "clsx";
import type { ProductColor, ProductSize } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { buildProductWhatsAppLink } from "@/lib/whatsapp";

export function ProductPurchasePanel({
  product,
  sizes,
  colors,
  customerName = null,
}: {
  product: { name: string; mrp: number; selling_price: number; is_available: boolean };
  sizes: ProductSize[];
  colors: ProductColor[];
  customerName?: string | null;
}) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const needsSize = sizes.length > 0 && !selectedSize;
  const needsColor = colors.length > 0 && !selectedColor;
  const canBuy = product.is_available && !needsSize && !needsColor;

  const whatsappHref = useMemo(
    () =>
      buildProductWhatsAppLink(product, {
        size: selectedSize,
        color: selectedColor,
        customerName,
      }),
    [product, selectedSize, selectedColor, customerName]
  );

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

      <div className="space-y-2">
        {!product.is_available ? (
          <Button variant="primary" size="lg" className="w-full bg-stone-light" disabled>
            Currently Sold Out
          </Button>
        ) : (
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
        )}
        {(needsSize || needsColor) && product.is_available && (
          <p className="text-center text-xs text-stone">
            Please select a {needsSize ? "size" : "colour"} to continue.
          </p>
        )}
      </div>
    </div>
  );
}
