import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { sendContactEmails } from "@/lib/resend/emails";
import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
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
      { error: "Necesitás verificar tu DNI antes de contactar vendedores", code: "dni_required" },
      { status: 403 }
    );
  }

  const { listing_id } = await req.json();
  if (!listing_id) return NextResponse.json({ error: "listing_id requerido" }, { status: 400 });

  // Leer listing
  const { data: listing, error: listingErr } = await supabase
    .from("listings")
    .select("id, user_id, status, price_type")
    .eq("id", listing_id)
    .single();

  if (listingErr || !listing) {
    return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 });
  }
  if (listing.status !== "active") {
    return NextResponse.json({ error: "La publicación no está disponible" }, { status: 400 });
  }
  if (listing.user_id === user.id) {
    return NextResponse.json({ error: "No podés contactarte a vos mismo" }, { status: 400 });
  }

  // Crear contact_exchange con service_role para bypassear RLS de insert
  const service = createServiceClient();
  const { data: exchange, error: exchangeErr } = await service
    .from("contact_exchanges")
    .insert({
      listing_id,
      buyer_id: user.id,
      seller_id: listing.user_id,
      type: "negotiable_contact",
      email_sent: false,
    })
    .select("id")
    .single();

  if (exchangeErr || !exchange) {
    console.error("[contact]", exchangeErr?.message);
    return NextResponse.json({ error: "Error al registrar el contacto" }, { status: 500 });
  }

  // Disparar emails y notificación (sin bloquear la respuesta)
  sendEmailsForContact(exchange.id, listing.user_id, user.id, listing_id).catch(console.error);
  createNotification({
    userId: listing.user_id,
    type: "contact_received",
    title: "Nuevo contacto",
    body: "Alguien está interesado en tu publicación",
    link: `/publicaciones/${listing_id}`,
  }).catch(console.error);

  return NextResponse.json({ ok: true, exchange_id: exchange.id });
}

async function sendEmailsForContact(
  _exchangeId: string,
  sellerId: string,
  buyerId: string,
  listingId: string
) {
  const service = createServiceClient();
  const [{ data: buyer }, { data: seller }, { data: listing }] = await Promise.all([
    service.from("users").select("first_name,last_name,email,whatsapp_country_code,whatsapp_number").eq("id", buyerId).single(),
    service.from("users").select("first_name,last_name,email,whatsapp_country_code,whatsapp_number").eq("id", sellerId).single(),
    service.from("listings").select("title,price").eq("id", listingId).single(),
  ]);
  if (!buyer || !seller || !listing) return;
  await sendContactEmails({ buyer, seller, listing: { title: listing.title, price: listing.price } });
}
