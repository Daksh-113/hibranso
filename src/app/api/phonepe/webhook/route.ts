import { NextResponse } from "next/server";
import { verifyPhonePeWebhookAuth } from "@/lib/phonepe";
import { confirmOrderPaid } from "@/lib/orders";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const verified = await verifyPhonePeWebhookAuth(authHeader);

  if (!verified) {
    console.error("PhonePe webhook: signature verification failed");
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { payload?: { merchantOrderId?: string } };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const merchantOrderId = body.payload?.merchantOrderId;
  if (!merchantOrderId) {
    return NextResponse.json({ error: "missing merchantOrderId" }, { status: 400 });
  }

  await confirmOrderPaid(merchantOrderId);

  return NextResponse.json({ ok: true });
}
