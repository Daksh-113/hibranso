import { clsx } from "clsx";
import { formatPriceDisplay } from "@/lib/format";

export function PriceBlock({
  mrp,
  sellingPrice,
  discountPercentage,
  size = "md",
  className,
}: {
  mrp: number;
  sellingPrice: number;
  discountPercentage: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const hasDiscount = discountPercentage > 0 && mrp > sellingPrice;

  return (
    <div className={clsx("flex flex-wrap items-baseline gap-2", className)}>
      <span
        className={clsx(
          "font-semibold text-charcoal",
          size === "sm" && "text-sm",
          size === "md" && "text-lg",
          size === "lg" && "text-2xl sm:text-3xl"
        )}
      >
        {formatPriceDisplay(sellingPrice)}
      </span>
      {hasDiscount && (
        <>
          <span
            className={clsx(
              "text-stone-light line-through",
              size === "sm" && "text-xs",
              size === "md" && "text-sm",
              size === "lg" && "text-base"
            )}
          >
            {formatPriceDisplay(mrp)}
          </span>
          <span
            className={clsx(
              "font-semibold text-success",
              size === "sm" && "text-xs",
              size === "md" && "text-sm",
              size === "lg" && "text-base"
            )}
          >
            {discountPercentage}% off
          </span>
        </>
      )}
    </div>
  );
}
