import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function PromoBanner() {
  return (
    <section className="bg-gold text-charcoal">
      <Container className="flex flex-col items-center gap-6 py-16 text-center sm:py-20">
        <p className="text-xs uppercase tracking-[0.3em] text-charcoal/70">Limited-time offers</p>
        <h2 className="max-w-2xl font-serif-display text-3xl leading-snug text-balance sm:text-4xl">
          Shop discounted pieces before they&apos;re gone
        </h2>
        <p className="max-w-lg text-sm text-charcoal/70 sm:text-base">
          We mark down select bags, clothing and accessories regularly. Every discount is shown
          clearly — MRP, our price, and the percentage you save.
        </p>
        <Button href="/shop?sort=discount_desc" variant="primary" size="lg">
          Shop the Sale
        </Button>
      </Container>
    </section>
  );
}
