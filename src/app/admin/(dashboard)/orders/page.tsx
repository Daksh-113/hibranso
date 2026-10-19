import type { Metadata } from "next";
import { getAdminOrders } from "@/lib/adminOrders";
import { formatPriceDisplay } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";

export const metadata: Metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div>
      <h1 className="font-serif-display text-3xl text-charcoal">Orders</h1>
      <p className="mt-2 text-sm text-stone">{orders.length} total</p>

      <div className="mt-8 space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border border-line bg-ivory p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-medium text-charcoal">{order.merchant_order_id}</p>
                <p className="text-xs text-stone">{new Date(order.created_at).toLocaleString("en-IN")}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={order.payment_status === "completed" ? "success" : order.payment_status === "failed" ? "danger" : "outline"}>
                  {order.payment_status}
                </Badge>
                {order.stock_issue && <Badge tone="danger">Stock issue — check items</Badge>}
                <OrderStatusSelect orderId={order.id} status={order.status} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-stone">Items</p>
                <ul className="mt-2 space-y-1 text-sm text-charcoal">
                  {(order.order_items ?? []).map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-2">
                      <span>
                        {item.product_name}
                        {[item.size, item.color].filter(Boolean).length > 0
                          ? ` (${[item.size, item.color].filter(Boolean).join(" / ")})`
                          : ""}{" "}
                        x{item.quantity}
                        {!item.stock_fulfilled && (
                          <span className="ml-2 text-xs text-danger">(not fulfilled — stock ran out)</span>
                        )}
                      </span>
                      <span className="text-stone">{formatPriceDisplay(item.line_total)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-stone">
                    <span>Subtotal</span>
                    <span>{formatPriceDisplay(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-stone">
                    <span>Delivery</span>
                    <span>{formatPriceDisplay(order.delivery_charge)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-charcoal">
                    <span>Total</span>
                    <span>{formatPriceDisplay(order.total_amount)}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-stone">Delivery address</p>
                <div className="mt-2 text-sm text-charcoal">
                  <p>{order.delivery_name}</p>
                  <p>{order.delivery_phone}</p>
                  <p>
                    {[order.delivery_address_line1, order.delivery_address_line2].filter(Boolean).join(", ")}
                  </p>
                  <p>
                    {order.delivery_city}, {order.delivery_state} - {order.delivery_pincode}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && <p className="py-12 text-center text-stone">No orders yet.</p>}
      </div>
    </div>
  );
}
