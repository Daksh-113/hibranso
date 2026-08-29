"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Category } from "@/lib/types";
import { CategoryForm } from "./CategoryForm";
import { deleteCategoryAction } from "@/lib/actions/categories";

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Category | "new" | null>(null);

  function handleDone() {
    setEditing(null);
    router.refresh();
  }

  return (
    <div className="space-y-10">
      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-line bg-ivory text-xs uppercase tracking-wider text-stone">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium text-charcoal">{category.name}</td>
                <td className="px-4 py-3 text-stone">{category.slug}</td>
                <td className="px-4 py-3 text-stone">{category.display_order}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setEditing(category)}
                      className="text-xs uppercase tracking-wide text-charcoal underline underline-offset-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm(`Delete "${category.name}"? Products in this category will be unassigned.`)) {
                          return;
                        }
                        const formData = new FormData();
                        formData.set("id", category.id);
                        await deleteCategoryAction(formData);
                        router.refresh();
                      }}
                      className="text-xs uppercase tracking-wide text-danger underline underline-offset-4"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-stone">
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="max-w-md border border-line bg-ivory p-6">
        <h2 className="mb-4 font-serif-display text-lg text-charcoal">
          {editing && editing !== "new" ? `Edit "${editing.name}"` : "Add a category"}
        </h2>
        <CategoryForm
          key={editing === "new" || editing === null ? "new" : editing.id}
          category={editing && editing !== "new" ? editing : undefined}
          onDone={handleDone}
        />
        {editing && (
          <button
            onClick={() => setEditing(null)}
            className="mt-3 text-xs uppercase tracking-wide text-stone underline underline-offset-4"
          >
            Cancel edit
          </button>
        )}
      </div>
    </div>
  );
}
