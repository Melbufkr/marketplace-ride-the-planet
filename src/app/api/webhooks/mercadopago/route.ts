import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, getPaymentData } from "@/lib/mercadopago/webhook";
import { createServiceClient } from "@/lib/supabase/server";
import { sendPurchaseEmails, sendTransactionCancelledEmail } from "@/lib/resend/emails";
import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // ── Verificar firma ──
  const signature = req.headers.get("x-signature") ?? "";
  const requestId = req.headers.get("x-request-id") ?? "";

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const dataId = String((body.data as Record<string, unknown>)?.id ?? "");

  // Solo verificamos firma si el secret está configurado
  if (process.env.MP_WEBHOOK_SECRET) {
    const valid = verifyWebhookSignature({ rawBody, signature, requestId, dataId });
    if (!valid) {
      console.warn("[webhook] firma inválida");
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }
  }

  // Solo procesar eventos de pago
  if (body.type !== "payment" || !dataId) {
    return NextResponse.json({ ok: true });
  }

  // ── Obtener datos del pago desde MP ──
  const payment = await getPaymentData(dataId);
  if (!payment) {
    return NextResponse.json({ error: "No se pudo obtener el pago" }, { status: 500 });
  }

  const transactionId = payment.external_reference;
  if (!transactionId) {
    return NextResponse.json({ ok: true }); // no es nuestro
  }

  const service = createServiceClient();

  // ── Leer transacción ──
  const { data: transaction } = await service
    .from("transactions")
    .select(`
      id, status, listing_id, buyer_id, seller_id, amount,
      platform_fee_amount, seller_amount
    `)
    .eq("id", transactionId)
    .single();

  if (!transaction) {
    console.warn("[webhook] transacción no encontrada:", transactionId);
    return NextResponse.json({ ok: true });
  }

  // Evitar reprocesar
  if (transaction.status === "completed" || transaction.status === "cancelled") {
    return NextResponse.json({ ok: true });
  }

  // ── Mapear status de MP a nuestro status ──
  const mpStatusMap: Record<string, string> = {
    approved: "completed",
    rejected: "cancelled",
    cancelled: "cancelled",
    refunded: "cancelled",
    charged_back: "cancelled",
  };
  const newStatus = mpStatusMap[payment.status] ?? "pending";

  // ── Actualizar transacción ──
  await service
    .from("transactions")
    .update({
      mp_payment_id: String(payment.id),
      mp_status: payment.status,
      status: newStatus,
      ...(newStatus === "completed" ? { completed_at: new Date().toISOString() } : {}),
    })
    .eq("id", transactionId);

  // ── Obtener datos para emails ──
  const [{ data: buyer }, { data: seller }, { data: listing }] = await Promise.all([
    service
      .from("users")
      .select("first_name, last_name, email, whatsapp_country_code, whatsapp_number")
      .eq("id", transaction.buyer_id)
      .single(),
    service
      .from("users")
      .select("first_name, last_name, email, whatsapp_country_code, whatsapp_number")
      .eq("id", transaction.seller_id)
      .single(),
    service
      .from("listings")
      .select("title, price")
      .eq("id", transaction.listing_id)
      .single(),
  ]);

  // ── Si se aprobó, marcar listing como sold y enviar emails ──
  if (newStatus === "completed") {
    await service
      .from("listings")
      .update({ status: "sold" })
      .eq("id", transaction.listing_id);

    if (buyer && seller && listing) {
      await sendPurchaseEmails({
        buyer,
        seller,
        listing: { title: listing.title, price: transaction.amount },
        sellerAmount: transaction.seller_amount,
        platformFeePct: Number(process.env.PLATFORM_FEE_PCT ?? 0),
      }).catch(console.error);

      createNotification({
        userId: transaction.buyer_id,
        type: "purchase_completed",
        title: "¡Compra confirmada!",
        body: `Tu pago por "${listing.title}" fue procesado exitosamente.`,
        link: "/mis-compras",
      }).catch(console.error);

      createNotification({
        userId: transaction.seller_id,
        type: "sale_completed",
        title: "¡Vendiste tu equipo!",
        body: `"${listing.title}" fue comprado. Coordiná la entrega.`,
        link: "/mis-ventas",
      }).catch(console.error);
    }
  }

  // ── Si fue cancelado/rechazado, notificar al comprador ──
  if (newStatus === "cancelled" && buyer && listing) {
    await sendTransactionCancelledEmail({
      buyer,
      listing: { title: listing.title },
      mpStatus: payment.status,
    }).catch(console.error);

    createNotification({
      userId: transaction.buyer_id,
      type: "transaction_cancelled",
      title: "Pago no procesado",
      body: `Tu pago por "${listing.title}" fue rechazado. Podés intentarlo de nuevo.`,
      link: `/publicaciones/${transaction.listing_id}`,
    }).catch(console.error);
  }

  return NextResponse.json({ ok: true });
}
