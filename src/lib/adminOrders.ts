import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/types";

export async function getAdminOrders(): Promise<Order[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as Order[];
  } catch (error) {
    console.error("getAdminOrders failed:", error);
    return [];
  }
}
