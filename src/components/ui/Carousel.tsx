"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { clsx } from "clsx";

export function Carousel({
  children,
  itemClassName,
  dotCount = 0,
  className,
}: {
  children: React.ReactNode[];
  itemClassName?: string;
  dotCount?: number;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    setCanScrollLeft(track.scrollLeft > 8);
    setCanScrollRight(track.scrollLeft < maxScroll - 8);
    if (dotCount > 1 && maxScroll > 0) {
      setActiveDot(Math.round((track.scrollLeft / maxScroll) * (dotCount - 1)));
    }
  }, [dotCount]);

  useEffect(() => {
    updateState();
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener("scroll", updateState, { passive: true });
    window.addEventListener("resize", updateState);
    return () => {
      track.removeEventListener("scroll", updateState);
      window.removeEventListener("resize", updateState);
    };
  }, [updateState]);

  function scrollByAmount(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.85, behavior: "smooth" });
  }

  return (
    <div className={clsx("relative", className)}>
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 sm:gap-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children.map((child, index) => (
          <div key={index} className={clsx("shrink-0 snap-start", itemClassName)}>
            {child}
          </div>
        ))}
      </div>

      {canScrollLeft && (
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollByAmount(-1)}
          className="absolute left-0 top-1/2 hidden -translate-y-1/2 -translate-x-4 items-center justify-center rounded-full bg-ivory text-charcoal shadow-md sm:flex h-10 w-10"
        >
          <ArrowIcon direction="left" />
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollByAmount(1)}
          className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-4 items-center justify-center rounded-full bg-ivory text-charcoal shadow-md sm:flex h-10 w-10"
        >
          <ArrowIcon direction="right" />
        </button>
      )}

      {dotCount > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: dotCount }).map((_, index) => (
            <span
              key={index}
              className={clsx(
                "h-1.5 w-1.5 rounded-full transition-colors",
                index === activeDot ? "bg-charcoal" : "bg-line"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className={clsx("h-4 w-4", direction === "left" && "rotate-180")} fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
    </svg>
  );
}
