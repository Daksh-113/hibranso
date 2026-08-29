import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-charcoal text-ivory">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(184,144,63,0.25), transparent 45%), radial-gradient(circle at 80% 70%, rgba(184,144,63,0.15), transparent 50%)",
        }}
      />
      <Container className="relative flex min-h-[78vh] flex-col items-center justify-center py-24 text-center sm:min-h-[85vh]">
        <p className="animate-fade-in text-xs uppercase tracking-[0.35em] text-gold-light">
          Bags · Clothing · Lifestyle
        </p>
        <h1 className="animate-fade-up mt-6 max-w-3xl font-serif-display text-4xl leading-tight text-balance sm:text-6xl lg:text-7xl">
          Considered essentials, made to be lived in
        </h1>
        <p className="animate-fade-up mt-6 max-w-xl text-balance text-base text-ivory/70 sm:text-lg" style={{ animationDelay: "0.1s" }}>
          Hibranso brings together premium bags, clothing and lifestyle pieces —
          crafted with intention and priced honestly.
        </p>
        <div
          className="animate-fade-up mt-10 flex flex-col gap-4 sm:flex-row"
          style={{ animationDelay: "0.2s" }}
        >
          <Button href="/shop" size="lg" className="bg-ivory text-charcoal hover:bg-gold-light">
            Shop Now
          </Button>
          <Button
            href={buildGeneralWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            variant="whatsapp"
            size="lg"
          >
            Chat on WhatsApp
          </Button>
        </div>
      </Container>
    </section>
  );
}
