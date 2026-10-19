"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatPriceDisplay } from "@/lib/format";
import { updateCartItemQuantityAction, removeFromCartAction } from "@/lib/actions/cart";
import type { CartItem } from "@/lib/types";

export function CartItemRow({ item }: { item: CartItem }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(item.quantity);
  const [pending, startTransition] = useTransition();
  const product = item.product;

  if (!product) return null;

  const image = product.product_images?.[0];
  const maxQuantity = product.stock_quantity ?? 99;

  function changeQuantity(next: number) {
    const clamped = Math.max(0, Math.min(maxQuantity, next));
    setQuantity(clamped);
    startTransition(async () => {
      await updateCartItemQuantityAction(item.id, clamped);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-4 border-b border-line py-6">
      <Link href={`/product/${product.slug}`} className="relative h-28 w-24 shrink-0 overflow-hidden bg-cream">
        {image && (
          <Image src={image.image_url} alt={image.alt_text ?? product.name} fill className="object-cover" />
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link href={`/product/${product.slug}`} className="font-serif-display text-base text-charcoal hover:text-gold">
            {product.name}
          </Link>
          <p className="mt-1 text-xs uppercase tracking-wide text-stone">
            {[item.size, item.color].filter(Boolean).join(" / ")}
          </p>
          <p className="mt-1 text-sm text-charcoal">{formatPriceDisplay(product.selling_price)}</p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="inline-flex items-center border border-line">
            <button
              type="button"
              onClick={() => changeQuantity(quantity - 1)}
              disabled={pending}
              className="px-3 py-1.5 text-charcoal hover:bg-cream"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-8 text-center text-sm">{quantity}</span>
            <button
              type="button"
              onClick={() => changeQuantity(quantity + 1)}
              disabled={pending}
              className="px-3 py-1.5 text-charcoal hover:bg-cream"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              startTransition(async () => {
                await removeFromCartAction(item.id);
                router.refresh();
              });
            }}
            disabled={pending}
            className="text-xs uppercase tracking-wide text-danger underline underline-offset-4"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
