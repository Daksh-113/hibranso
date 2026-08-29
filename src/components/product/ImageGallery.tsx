"use client";

import { useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";
import type { ProductImage } from "@/lib/types";

export function ImageGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center bg-cream text-stone-light">
        <span className="text-sm uppercase tracking-wider">No image available</span>
      </div>
    );
  }

  const active = images[activeIndex];

  return (
    <div className="flex flex-col gap-4 sm:flex-row-reverse">
      <div className="relative aspect-[4/5] flex-1 overflow-hidden bg-cream">
        <Image
          key={active.id}
          src={active.image_url}
          alt={active.alt_text ?? productName}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="animate-fade-in object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto sm:w-24 sm:flex-col sm:overflow-visible">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
              className={clsx(
                "relative aspect-square w-20 shrink-0 overflow-hidden border transition-colors sm:w-full",
                index === activeIndex ? "border-charcoal" : "border-line hover:border-stone"
              )}
            >
              <Image
                src={image.image_url}
                alt={image.alt_text ?? productName}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
