import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Hibranso on WhatsApp for orders, questions or support.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <Container className="py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Get in touch</p>
        <h1 className="mt-3 font-serif-display text-4xl text-charcoal sm:text-5xl">Contact Hibranso</h1>
        <p className="mt-6 text-base leading-relaxed text-stone sm:text-lg">
          The fastest way to reach us is WhatsApp — whether you have a question about a product,
          need styling advice, or you&apos;re ready to place an order.
        </p>

        <Button
          href={buildGeneralWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          variant="whatsapp"
          size="lg"
          className="mt-10"
        >
          Message us on WhatsApp
        </Button>

        <div className="mt-16 grid grid-cols-1 gap-8 border-t border-line pt-12 text-left sm:grid-cols-2">
          <div>
            <h2 className="text-xs uppercase tracking-wider text-stone">Ordering</h2>
            <p className="mt-2 text-sm text-charcoal">
              All orders are placed directly over WhatsApp. Browse the{" "}
              <a href="/shop" className="underline decoration-gold underline-offset-4">
                shop
              </a>
              , pick your favourites, and hit &ldquo;Buy on WhatsApp&rdquo; on the product page.
            </p>
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-wider text-stone">Response time</h2>
            <p className="mt-2 text-sm text-charcoal">
              We typically reply within a few hours during business days. For urgent queries,
              please mention it in your message.
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}
