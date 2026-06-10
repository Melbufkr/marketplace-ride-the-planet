import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const MP_TOKEN_URL = "https://api.mercadopago.com/oauth/token";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // user_id que pasamos en el authorization

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const failUrl = `${appUrl}/perfil?mp_error=1`;
  const successUrl = `${appUrl}/perfil?mp_connected=1`;

  if (!code || !state) {
    return NextResponse.redirect(failUrl);
  }

  // Verificar que el state corresponde al usuario autenticado
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== state) {
    return NextResponse.redirect(failUrl);
  }

  // Intercambiar code por tokens
  const redirectUri = `${appUrl}/api/auth/mp/callback`;

  const tokenRes = await fetch(MP_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_secret: process.env.MP_ACCESS_TOKEN,
      client_id: process.env.MP_APP_ID,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    console.error("[mp oauth] token error:", await tokenRes.text());
    return NextResponse.redirect(failUrl);
  }

  const tokenData = await tokenRes.json();
  const {
    access_token,
    refresh_token,
    user_id: mpUserId,
    expires_in,
  } = tokenData;

  const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

  // Guardar en users con service_role (campos sensibles)
  const service = createServiceClient();
  const { error } = await service
    .from("users")
    .update({
      mp_user_id: String(mpUserId),
      mp_access_token: access_token,
      mp_refresh_token: refresh_token,
      mp_token_expires_at: expiresAt,
    })
    .eq("id", user.id);

  if (error) {
    console.error("[mp oauth] guardar tokens:", error.message);
    return NextResponse.redirect(failUrl);
  }

  return NextResponse.redirect(successUrl);
}
