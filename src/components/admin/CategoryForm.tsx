"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveCategoryAction, type CategoryFormState } from "@/lib/actions/categories";
import { slugify } from "@/lib/slug";
import type { Category } from "@/lib/types";

const initialState: CategoryFormState = { error: null };
const inputClass =
  "w-full border border-line bg-ivory px-4 py-2.5 text-sm outline-none focus:border-gold";

export function CategoryForm({
  category,
  allCategories,
  onDone,
}: {
  category?: Category;
  allCategories: Category[];
  onDone?: () => void;
}) {
  const parentOptions = allCategories.filter(
    (c) => !c.parent_id && c.id !== category?.id
  );
  const [state, formAction, pending] = useActionState(saveCategoryAction, initialState);
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(category));
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      onDone?.();
    }
    wasPending.current = pending;
  }, [pending, state.error, onDone]);

  return (
    <form action={formAction} className="space-y-4">
      {category && <input type="hidden" name="id" value={category.id} />}

      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-wider text-stone">Name</label>
        <input
          name="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-wider text-stone">Slug</label>
        <input
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-wider text-stone">Description</label>
        <textarea name="description" defaultValue={category?.description ?? ""} rows={2} className={inputClass} />
      </div>

      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-wider text-stone">
          Parent category
        </label>
        <select name="parent_id" defaultValue={category?.parent_id ?? ""} className={inputClass}>
          <option value="">None — top-level category</option>
          {parentOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-stone-light">
          Leave as &ldquo;None&rdquo; for a main category shown in the navigation. Pick a parent
          to make this a subcategory (one level deep).
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-wider text-stone">Display order</label>
        <input
          name="display_order"
          type="number"
          defaultValue={category?.display_order ?? 0}
          className={inputClass}
        />
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-charcoal px-6 py-2.5 text-xs font-medium uppercase tracking-wide text-ivory transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Saving…" : category ? "Save changes" : "Add category"}
      </button>
    </form>
  );
}
