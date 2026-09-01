"use client";

import { useActionState } from "react";
import { saveProfileAction, type ProfileFormState } from "@/lib/actions/customer";
import type { CustomerProfile } from "@/lib/types";

const initialState: ProfileFormState = { error: null, saved: false };
const inputClass =
  "w-full border border-line bg-ivory px-4 py-2.5 text-sm outline-none focus:border-gold";

export function ProfileForm({ profile }: { profile: CustomerProfile | null }) {
  const [state, formAction, pending] = useActionState(saveProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-wider text-stone">Name</label>
        <input name="name" defaultValue={profile?.name ?? ""} className={inputClass} />
      </div>
      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-wider text-stone">
          Phone
        </label>
        <input name="phone" defaultValue={profile?.phone ?? ""} className={inputClass} />
      </div>
      <p className="text-xs text-stone-light">
        Saved so it can be included automatically the next time you message us on WhatsApp.
      </p>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.saved && <p className="text-sm text-success">Saved.</p>}
      <button
        type="submit"
        disabled={pending}
        className="bg-charcoal px-6 py-2.5 text-xs font-medium uppercase tracking-wide text-ivory transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save details"}
      </button>
    </form>
  );
}
