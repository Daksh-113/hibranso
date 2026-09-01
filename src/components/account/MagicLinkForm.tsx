"use client";

import { useActionState } from "react";
import { requestMagicLinkAction, type MagicLinkState } from "@/lib/actions/customerAuth";

const initialState: MagicLinkState = { error: null, sent: false };

export function MagicLinkForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(requestMagicLinkAction, initialState);

  if (state.sent) {
    return (
      <div className="text-center">
        <p className="font-serif-display text-xl text-charcoal">Check your inbox</p>
        <p className="mt-3 text-sm text-stone">
          We&apos;ve sent you a login link. Open it on this device to sign in — no password
          needed.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />

      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs uppercase tracking-wider text-stone">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full border border-line bg-ivory px-4 py-3 text-sm outline-none focus:border-gold"
        />
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-charcoal py-3 text-sm font-medium uppercase tracking-wide text-ivory transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send me a login link"}
      </button>
    </form>
  );
}
