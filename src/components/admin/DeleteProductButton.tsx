"use client";

import { useRouter } from "next/navigation";
import { deleteProductAction } from "@/lib/actions/products";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        const formData = new FormData();
        formData.set("id", id);
        await deleteProductAction(formData);
        router.refresh();
      }}
      className="text-xs uppercase tracking-wide text-danger underline underline-offset-4"
    >
      Delete
    </button>
  );
}
