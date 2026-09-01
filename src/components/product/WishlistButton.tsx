"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { clsx } from "clsx";
import { toggleWishlistAction } from "@/lib/actions/customer";

export function WishlistButton({
  productId,
  initialWishlisted,
  isLoggedIn,
  className,
}: {
  productId: string;
  initialWishlisted: boolean;
  isLoggedIn: boolean;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [pending, startTransition] = useTransition();

  function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (!isLoggedIn) {
      router.push(`/account/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    const wasWishlisted = wishlisted;
    setWishlisted(!wasWishlisted);

    startTransition(async () => {
      const result = await toggleWishlistAction(productId, wasWishlisted);
      if (result.error) {
        setWishlisted(wasWishlisted);
        if (result.error === "not_signed_in") {
          router.push(`/account/login?next=${encodeURIComponent(pathname)}`);
        }
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wishlisted}
      className={clsx(
        "flex h-9 w-9 items-center justify-center rounded-full bg-ivory/90 text-charcoal shadow-sm transition-transform hover:scale-105 disabled:opacity-60",
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[18px] w-[18px]"
        fill={wishlisted ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.6}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 20.5s-7.5-4.6-10-9.2C.5 8.1 2 4.5 5.6 4c2.1-.3 4 .8 5 2.4C11.6 4.8 13.5 3.7 15.6 4c3.6.5 5.1 4.1 3.6 7.3-2.5 4.6-10 9.2-10 9.2Z"
        />
      </svg>
    </button>
  );
}
