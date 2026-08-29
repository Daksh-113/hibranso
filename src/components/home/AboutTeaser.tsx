import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function AboutTeaser() {
  return (
    <section className="py-20 sm:py-28">
      <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden bg-charcoal">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif-display text-5xl tracking-wordmark text-ivory/90 sm:text-6xl">
              HIBRANSO
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Our story</p>
          <h2 className="mt-3 font-serif-display text-3xl text-charcoal sm:text-4xl">
            Built on quality, not markups
          </h2>
          <p className="mt-6 text-base leading-relaxed text-stone">
            Hibranso started with a simple idea — premium bags, clothing and lifestyle pieces
            shouldn&apos;t come with inflated prices or a complicated buying process. We work
            directly with our customers over WhatsApp, so every order is personal, every question
            gets answered, and every price is honest.
          </p>
          <Button href="/about" variant="outline" size="md" className="mt-8">
            Learn more about us
          </Button>
        </div>
      </Container>
    </section>
  );
}
