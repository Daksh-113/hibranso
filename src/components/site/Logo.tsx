import Link from "next/link";
import { clsx } from "clsx";

export function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Hibranso — home"
      className={clsx(
        "font-serif-display tracking-wordmark text-2xl sm:text-3xl font-semibold select-none",
        dark ? "text-ivory" : "text-charcoal",
        className
      )}
    >
      HIBRANSO
    </Link>
  );
}
