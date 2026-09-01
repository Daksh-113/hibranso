import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/customer";
import { MagicLinkForm } from "@/components/account/MagicLinkForm";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/site/Logo";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Hibranso account to view and manage your wishlist.",
  robots: { index: false, follow: false },
};

export default async function AccountLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const customer = await getCurrentCustomer();
  if (customer) redirect(next && next.startsWith("/") ? next : "/account");

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <Logo className="justify-center" />
          <p className="mt-3 font-serif-display text-2xl text-charcoal">Sign in</p>
          <p className="mt-2 text-sm text-stone">
            Save your favourites and speed up your next order.
          </p>
        </div>
        <MagicLinkForm next={next ?? "/account"} />
      </div>
    </Container>
  );
}
