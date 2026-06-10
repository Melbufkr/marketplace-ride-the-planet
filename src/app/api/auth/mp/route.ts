/**
 * OAuth de Mercado Pago Marketplace
 *
 * Flujo:
 *  1. GET /api/auth/mp → redirige a MP con el authorization URL
 *  2. MP redirige a GET /api/auth/mp/callback?code=xxx&state=xxx
 *  3. Intercambiamos el code por access_token + refresh_token
 *  4. Guardamos mp_user_id y tokens en public.users
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const MP_AUTH_URL = "https://auth.mercadopago.com/authorization";
const MP_TOKEN_URL = "https://api.mercadopago.com/oauth/token";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const redirectUri = `${appUrl}/api/auth/mp/callback`;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.MP_APP_ID ?? "",
    redirect_uri: redirectUri,
    state: user.id, // usamos el user_id como state para verificar en el callback
  });

  return NextResponse.redirect(`${MP_AUTH_URL}?${params.toString()}`);
}
