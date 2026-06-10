import crypto from "crypto";
import { getPaymentClient } from "./index";

/**
 * Verifica la firma del webhook de Mercado Pago.
 * Header x-signature: "ts=<timestamp>,v1=<hash>"
 * Header x-request-id: string
 * El hash es HMAC-SHA256 de "id:<paymentId>;request-id:<requestId>;ts:<timestamp>;"
 */
export function verifyWebhookSignature({
  rawBody,
  signature,
  requestId,
  dataId,
}: {
  rawBody: string;
  signature: string;
  requestId: string;
  dataId: string;
}): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return false;

  // Parsear "ts=xxx,v1=xxx"
  const parts = Object.fromEntries(
    signature.split(",").map((p) => p.split("=") as [string, string])
  );
  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expected));
}

export interface MpPaymentData {
  id: number;
  status: "pending" | "approved" | "authorized" | "in_process" | "in_mediation" | "rejected" | "cancelled" | "refunded" | "charged_back";
  external_reference: string; // nuestro transaction_id
  transaction_amount: number;
  net_received_amount: number;
  marketplace_fee: number | null;
  payer?: { email?: string };
}

export async function getPaymentData(paymentId: string): Promise<MpPaymentData | null> {
  try {
    const paymentClient = getPaymentClient();
    const data = await paymentClient.get({ id: paymentId });
    const raw = data as unknown as Record<string, unknown>;
    return {
      id: data.id!,
      status: data.status as MpPaymentData["status"],
      external_reference: data.external_reference ?? "",
      transaction_amount: data.transaction_amount ?? 0,
      net_received_amount: (raw["net_received_amount"] as number | undefined) ?? 0,
      marketplace_fee: (raw["marketplace_fee"] as number | null) ?? null,
      payer: { email: data.payer?.email ?? undefined },
    };
  } catch (err) {
    console.error("[getPaymentData]", err);
    return null;
  }
}
