import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rutas que requieren sesión activa
const PRIVATE_ROUTES = [
  "/dashboard",
  "/publicar",
  "/mis-publicaciones",
  "/mis-compras",
  "/mis-ventas",
  "/mis-favoritos",
  "/perfil",
  "/contactos",
];

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresca sesión — no remover, es necesario para SSR correcto
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPrivate = PRIVATE_ROUTES.some((r) => pathname.startsWith(r));
  const isAdmin  = pathname.startsWith("/admin");

  // Rutas privadas normales → redirigir a login
  if (isPrivate && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Rutas admin → verificar is_admin en public.users
  if (isAdmin) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      // No admin → 404-like redirect a home
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Redirigir a home si ya está logueado y trata de acceder a /login o /registro
  if ((pathname === "/login" || pathname === "/registro") && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Excluir archivos estáticos y rutas internas de Next
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
