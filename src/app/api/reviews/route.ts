import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

interface ReviewPayload {
  rating: number;
  comment?: string;
  // Exactamente uno de los dos debe estar presente
  transaction_id?: string;
  exchange_id?: string;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json() as ReviewPayload;
  const { rating, comment, transaction_id, exchange_id } = body;

  // Validaciones básicas
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating debe ser entre 1 y 5" }, { status: 400 });
  }
  if (!transaction_id && !exchange_id) {
    return NextResponse.json({ error: "Se requiere transaction_id o exchange_id" }, { status: 400 });
  }
  if (transaction_id && exchange_id) {
    return NextResponse.json({ error: "Solo uno de los dos puede estar presente" }, { status: 400 });
  }

  const service = createServiceClient();

  // ── Verificar que el usuario participó y determinar a quién califica ──
  let reviewedId: string | null = null;

  if (transaction_id) {
    const { data: tx } = await service
      .from("transactions")
      .select("buyer_id, seller_id, status")
      .eq("id", transaction_id)
      .single();

    if (!tx) return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 });
    if (tx.status !== "completed") {
      return NextResponse.json({ error: "Solo podés calificar transacciones completadas" }, { status: 400 });
    }
    if (tx.buyer_id === user.id) reviewedId = tx.seller_id;
    else if (tx.seller_id === user.id) reviewedId = tx.buyer_id;
    else return NextResponse.json({ error: "No participaste en esta transacción" }, { status: 403 });
  }

  if (exchange_id) {
    const { data: ex } = await service
      .from("contact_exchanges")
      .select("buyer_id, seller_id")
      .eq("id", exchange_id)
      .single();

    if (!ex) return NextResponse.json({ error: "Intercambio no encontrado" }, { status: 404 });
    if (ex.buyer_id === user.id) reviewedId = ex.seller_id;
    else if (ex.seller_id === user.id) reviewedId = ex.buyer_id;
    else return NextResponse.json({ error: "No participaste en este intercambio" }, { status: 403 });
  }

  if (!reviewedId) return NextResponse.json({ error: "Error inesperado" }, { status: 500 });

  // ── Verificar que no calificó antes ──
  const dupQuery = service
    .from("reviews")
    .select("id")
    .eq("reviewer_id", user.id);

  if (transaction_id) dupQuery.eq("transaction_id", transaction_id);
  else dupQuery.eq("exchange_id", exchange_id!);

  const { data: existing } = await dupQuery.maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "Ya calificaste esta transacción" }, { status: 409 });
  }

  // ── Insertar review ──
  const { data: review, error } = await service
    .from("reviews")
    .insert({
      reviewer_id: user.id,
      reviewed_id: reviewedId,
      rating,
      comment: comment?.trim() || null,
      transaction_id: transaction_id ?? null,
      exchange_id: exchange_id ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[review insert]", error.message);
    return NextResponse.json({ error: "Error al guardar la calificación" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, review_id: review.id });
}
