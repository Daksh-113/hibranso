"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatusAction } from "@/lib/actions/orders";
import type { OrderStatus } from "@/lib/types";

const statuses: OrderStatus[] = ["created", "paid", "shipped", "delivered", "cancelled", "failed"];

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as OrderStatus;
        setValue(next);
        startTransition(async () => {
          await updateOrderStatusAction(orderId, next);
          router.refresh();
        });
      }}
      className="border border-line bg-ivory px-3 py-1.5 text-xs uppercase tracking-wide outline-none focus:border-gold"
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
