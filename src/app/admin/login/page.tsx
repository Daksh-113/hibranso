import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/site/Logo";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <Logo className="justify-center" />
          <p className="mt-2 text-xs uppercase tracking-wider text-stone">Admin Dashboard</p>
        </div>
        <LoginForm next={next ?? "/admin"} />
      </div>
    </div>
  );
}
