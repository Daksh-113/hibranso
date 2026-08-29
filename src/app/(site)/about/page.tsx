import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "About Hibranso",
  description:
    "Learn about Hibranso — a premium bags, clothing and lifestyle brand built on honest pricing and direct customer relationships.",
  alternates: { canonical: "/about" },
};

const values = [
  {
    title: "Considered design",
    description:
      "Every piece is chosen for how it looks, feels and holds up over years of use — not seasons.",
  },
  {
    title: "Honest pricing",
    description:
      "We show our MRP and our selling price side by side. No inflated numbers, no hidden markdowns.",
  },
  {
    title: "Personal service",
    description:
      "No cluttered checkout. You talk to a real person on WhatsApp before you buy — every single time.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-charcoal py-24 text-center text-ivory sm:py-32">
        <Container>
          <p className="text-xs uppercase tracking-[0.3em] text-gold-light">About Us</p>
          <h1 className="mx-auto mt-4 max-w-2xl font-serif-display text-4xl leading-tight text-balance sm:text-5xl">
            Premium essentials, without the premium markup
          </h1>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container className="mx-auto max-w-3xl space-y-6 text-center">
          <p className="text-base leading-relaxed text-stone sm:text-lg">
            Hibranso is a fashion and lifestyle brand built around bags, clothing and everyday
            accessories. We believe great design and honest pricing aren&apos;t mutually
            exclusive — so we cut out the traditional retail markup and sell directly to you.
          </p>
          <p className="text-base leading-relaxed text-stone sm:text-lg">
            There&apos;s no cart, no checkout, and no waiting on hold. When you find something you
            love, you message us directly on WhatsApp with everything pre-filled — product, price,
            size and colour — and we take it from there.
          </p>
        </Container>
      </section>

      <section className="bg-cream py-20 sm:py-28">
        <Container>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <h3 className="font-serif-display text-xl text-charcoal">{value.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone">{value.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 text-center sm:py-28">
        <Container>
          <h2 className="font-serif-display text-3xl text-charcoal sm:text-4xl">
            Have a question before you buy?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-stone sm:text-base">
            Reach out any time — we&apos;re happy to help you find the right piece.
          </p>
          <Button
            href={buildGeneralWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            variant="whatsapp"
            size="lg"
            className="mt-8"
          >
            Chat on WhatsApp
          </Button>
        </Container>
      </section>
    </>
  );
}
