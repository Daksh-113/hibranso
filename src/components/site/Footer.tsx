import Link from "next/link";
import { getCategories } from "@/lib/products";
import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";

export async function Footer() {
  const categories = await getCategories();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line/70 bg-charcoal text-ivory">
      <Container className="grid grid-cols-1 gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo dark />
          <p className="max-w-xs text-sm leading-relaxed text-ivory/60">
            Considered bags, clothing and lifestyle pieces — designed to last, priced to be worn.
          </p>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-wider text-ivory/50">Shop</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link href="/shop" className="text-ivory/80 hover:text-gold-light">
                All Products
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={`/category/${category.slug}`} className="text-ivory/80 hover:text-gold-light">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-wider text-ivory/50">Company</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link href="/about" className="text-ivory/80 hover:text-gold-light">
                About Hibranso
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-ivory/80 hover:text-gold-light">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/admin/login" className="text-ivory/40 hover:text-gold-light">
                Admin
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-wider text-ivory/50">Get in touch</h3>
          <p className="mt-4 text-sm text-ivory/80">
            Every order is placed directly with our team on WhatsApp — no checkout, no waiting.
          </p>
          <a
            href={buildGeneralWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gold-light hover:text-gold"
          >
            Message us on WhatsApp →
          </a>
        </div>
      </Container>

      <div className="border-t border-ivory/10 py-6">
        <Container className="flex flex-col items-center justify-between gap-2 text-xs text-ivory/40 sm:flex-row">
          <p>© {year} Hibranso. All rights reserved.</p>
          <p>Crafted with care.</p>
        </Container>
      </div>
    </footer>
  );
}
