"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  return { error: null };
}

export async function updateOrderNotesAction(orderId: string, adminNotes: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ admin_notes: adminNotes }).eq("id", orderId);
  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  return { error: null };
}
