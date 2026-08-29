import { clsx } from "clsx";

type Tone = "gold" | "charcoal" | "success" | "danger" | "outline";

const tones: Record<Tone, string> = {
  gold: "bg-gold text-ivory",
  charcoal: "bg-charcoal text-ivory",
  success: "bg-success text-ivory",
  danger: "bg-danger text-ivory",
  outline: "border border-charcoal/30 text-charcoal",
};

export function Badge({
  tone = "charcoal",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
