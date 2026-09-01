"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type MagicLinkState = { error: string | null; sent: boolean };

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function requestMagicLinkAction(
  _prevState: MagicLinkState,
  formData: FormData
): Promise<MagicLinkState> {
  const email = String(formData.get("email") ?? "").trim();
  const next = String(formData.get("next") ?? "/account");

  if (!email) {
    return { error: "Please enter your email address.", sent: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return { error: "Could not send login link. Please try again.", sent: false };
  }

  return { error: null, sent: true };
}

export async function signOutCustomerAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
