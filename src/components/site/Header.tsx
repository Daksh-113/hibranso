import Link from "next/link";
import { getCategories } from "@/lib/products";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";

export async function Header() {
  const categories = await getCategories();

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-ivory/90 backdrop-blur-md">
      <Container className="flex h-20 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-9 lg:flex">
          <Link href="/" className="text-sm uppercase tracking-wide text-charcoal/80 transition-colors hover:text-gold">
            Home
          </Link>
          <Link href="/shop" className="text-sm uppercase tracking-wide text-charcoal/80 transition-colors hover:text-gold">
            Shop
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="text-sm uppercase tracking-wide text-charcoal/80 transition-colors hover:text-gold"
            >
              {category.name}
            </Link>
          ))}
          <Link href="/about" className="text-sm uppercase tracking-wide text-charcoal/80 transition-colors hover:text-gold">
            About
          </Link>
          <Link href="/contact" className="text-sm uppercase tracking-wide text-charcoal/80 transition-colors hover:text-gold">
            Contact
          </Link>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button href={buildGeneralWhatsAppLink()} target="_blank" rel="noopener noreferrer" variant="whatsapp" size="sm">
            WhatsApp Us
          </Button>
          <Button href="/shop" variant="outline" size="sm">
            Shop Now
          </Button>
        </div>

        <MobileNav categories={categories} />
      </Container>
    </header>
  );
}
