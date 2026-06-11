import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { createCheckoutPreference } from "@/lib/mercadopago/checkout";

export async function POST(req: NextRequest) {
  // ── Autenticación ──
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  // ── Verificación de DNI ──
  const { data: buyer } = await supabase
    .from("users")
    .select("dni_verified")
    .eq("id", user.id)
    .single();

  if (!buyer?.dni_verified) {
    return NextResponse.json(
      { error: "Necesitás verificar tu DNI antes de comprar", code: "dni_required" },
      { status: 403 }
    );
  }

  const { listing_id } = await req.json();
  if (!listing_id) return NextResponse.json({ error: "listing_id requerido" }, { status: 400 });

  const service = createServiceClient();

  // ── Leer listing + seller ──
  const { data: listing, error: listingErr } = await service
    .from("listings")
    .select(`
      id, title, price, status, user_id,
      users!listings_user_id_fkey ( id, email, mp_user_id )
    `)
    .eq("id", listing_id)
    .single();

  if (listingErr || !listing) {
    return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 });
  }
  if (listing.status !== "active") {
    return NextResponse.json({ error: "La publicación no está disponible" }, { status: 400 });
  }
  if (listing.user_id === user.id) {
    return NextResponse.json({ error: "No podés comprar tu propia publicación" }, { status: 400 });
  }

  const seller = listing.users as { id: string; email: string; mp_user_id: string | null };

  if (!seller.mp_user_id) {
    return NextResponse.json(
      { error: "El vendedor aún no conectó su cuenta de Mercado Pago" },
      { status: 400 }
    );
  }

  // ── Calcular montos ──
  const feePct = Number(process.env.PLATFORM_FEE_PCT ?? 0) / 100;
  const amount = Number(listing.price);
  const platformFeeAmount = Math.round(amount * feePct * 100) / 100;
  const sellerAmount = Math.round((amount - platformFeeAmount) * 100) / 100;

  // ── Crear transacción pending ──
  const { data: transaction, error: txErr } = await service
    .from("transactions")
    .insert({
      listing_id: listing.id,
      buyer_id: user.id,
      seller_id: listing.user_id,
      amount,
      platform_fee_pct: Number(process.env.PLATFORM_FEE_PCT ?? 0),
      platform_fee_amount: platformFeeAmount,
      seller_amount: sellerAmount,
      mp_status: "pending",
      status: "pending",
    })
    .select("id")
    .single();

  if (txErr || !transaction) {
    console.error("[checkout] crear transacción:", txErr?.message);
    return NextResponse.json({ error: "Error al iniciar la transacción" }, { status: 500 });
  }

  // ── Leer email del buyer ──
  const { data: buyerProfile } = await service
    .from("users")
    .select("email")
    .eq("id", user.id)
    .single();

  // ── Crear preferencia de MP ──
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const isSandbox = !process.env.MP_ACCESS_TOKEN?.startsWith("APP_USR");

    const { initPoint, sandboxInitPoint } = await createCheckoutPreference({
      transactionId: transaction.id,
      item: {
        id: listing.id,
        title: listing.title,
        quantity: 1,
        unit_price: amount,
      },
      buyerEmail: buyerProfile?.email ?? user.email ?? "",
      sellerMpUserId: seller.mp_user_id,
      platformFeeAmount,
      appUrl,
    });

    const checkoutUrl = isSandbox ? sandboxInitPoint : initPoint;
    return NextResponse.json({ checkout_url: checkoutUrl, transaction_id: transaction.id });
  } catch (err) {
    // Limpiar transacción si falla MP
    await service.from("transactions").delete().eq("id", transaction.id);
    console.error("[checkout] MP error:", err);
    return NextResponse.json({ error: "Error al conectar con Mercado Pago" }, { status: 500 });
  }
}
