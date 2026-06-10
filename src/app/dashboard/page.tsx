import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/listings-helpers";
import { StarRating } from "@/components/ui/StarRating";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Inicio" };

// ─── Helpers ────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

const NOTIF_ICON: Record<string, string> = {
  contact_received:      "💬",
  purchase_completed:    "✅",
  sale_completed:        "🎉",
  transaction_cancelled: "❌",
  dni_approved:          "🪪",
  dni_rejected:          "⚠️",
};

// ─── Page ───────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const service = createServiceClient();

  // ── Todas las queries en paralelo ──
  const [
    profileRes,
    activeListingsRes,
    contactsCountRes,
    earningsRes,
    notificationsRes,
    recentActivityRes,
    favoritesRes,
  ] = await Promise.all([
    // Perfil
    service
      .from("users")
      .select("first_name, last_name, reputation_score, dni_verified, mp_user_id")
      .eq("id", user.id)
      .single(),

    // Publicaciones activas (con media para thumbnails)
    service
      .from("listings")
      .select("id, title, price, price_type, category, status, listing_media(url, media_type, order)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(3),

    // Contactos recibidos como vendedor
    service
      .from("contact_exchanges")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", user.id),

    // Total ganado (transacciones completadas como vendedor)
    service
      .from("transactions")
      .select("seller_amount")
      .eq("seller_id", user.id)
      .eq("status", "completed"),

    // Notificaciones no leídas (últimas 4)
    service
      .from("notifications")
      .select("id, type, title, body, link, created_at")
      .eq("user_id", user.id)
      .eq("read", false)
      .order("created_at", { ascending: false })
      .limit(4),

    // Actividad reciente: últimas transacciones + contactos
    Promise.all([
      service
        .from("transactions")
        .select("id, status, amount, seller_amount, created_at, completed_at, listings(title), buyer_id, seller_id")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(5),
      service
        .from("contact_exchanges")
        .select("id, type, created_at, listings(title, id), buyer_id, seller_id")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(5),
    ]),

    // Favoritos recientes (últimos 3)
    service
      .from("favorites")
      .select("listing_id, listings(id, title, price, listing_media(url, media_type, order))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const profile = profileRes.data;
  const activeListings = activeListingsRes.data ?? [];
  const contactsCount = contactsCountRes.count ?? 0;
  const totalEarned = (earningsRes.data ?? []).reduce((sum, t) => sum + (t.seller_amount ?? 0), 0);
  const notifications = notificationsRes.data ?? [];
  const [transactionsRes, contactsRes] = recentActivityRes;
  const recentFavorites = (favoritesRes.data ?? [])
    .map((f) => f.listings as { id: string; title: string; price: number; listing_media: { url: string; media_type: string; order: number }[] } | null)
    .filter(Boolean);

  // Contar publicaciones totales (activas)
  const { count: totalActiveCount } = await service
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "active");

  // Actividad reciente mezclada y ordenada
  type ActivityItem = {
    id: string;
    label: string;
    sublabel: string;
    icon: string;
    date: string;
    link: string;
  };

  const activity: ActivityItem[] = [
    ...(transactionsRes.data ?? []).map((t) => {
      const isSeller = t.seller_id === user.id;
      const listing = t.listings as { title: string } | null;
      return {
        id: `tx-${t.id}`,
        label: isSeller ? "Venta" : "Compra",
        sublabel: listing?.title ?? "Publicación eliminada",
        icon: t.status === "completed" ? (isSeller ? "🎉" : "✅") : "❌",
        date: t.created_at,
        link: isSeller ? "/mis-ventas" : "/mis-compras",
      };
    }),
    ...(contactsRes.data ?? []).map((c) => {
      const isSeller = c.seller_id === user.id;
      const listing = c.listings as { title: string; id: string } | null;
      return {
        id: `cx-${c.id}`,
        label: isSeller ? "Contacto recibido" : "Contacto iniciado",
        sublabel: listing?.title ?? "Publicación eliminada",
        icon: "💬",
        date: c.created_at,
        link: listing ? `/publicaciones/${listing.id}` : "/contactos",
      };
    }),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  // Estado del perfil
  const profileItems = [
    {
      label: "DNI verificado",
      done: !!profile?.dni_verified,
      link: "/perfil",
      cta: "Verificar →",
    },
    {
      label: "Mercado Pago conectado",
      done: !!profile?.mp_user_id,
      link: "/perfil",
      cta: "Conectar →",
    },
  ];
  const profileComplete = profileItems.every((i) => i.done);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl" style={{ color: "var(--text)" }}>
            Hola, {profile?.first_name ?? "👋"}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--dim)" }}>
            Bienvenido a tu panel de RTP Market
          </p>
        </div>
        <Link
          href="/publicar"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
          style={{ backgroundColor: "var(--blue)", color: "#fff" }}
        >
          + Publicar equipo
        </Link>
      </div>

      {/* ── Métricas ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Publicaciones activas",
            value: totalActiveCount ?? 0,
            icon: "🏔️",
            link: "/mis-publicaciones",
          },
          {
            label: "Contactos recibidos",
            value: contactsCount,
            icon: "💬",
            link: "/contactos",
          },
          {
            label: "Reputación",
            value: null,
            icon: "⭐",
            score: Number(profile?.reputation_score ?? 0),
            link: `/perfil/${user.id}`,
          },
          {
            label: "Total ganado",
            value: null,
            formatted: totalEarned > 0 ? formatPrice(totalEarned) : "—",
            icon: "💰",
            link: "/mis-ventas",
          },
        ].map((metric) => (
          <Link
            key={metric.label}
            href={metric.link}
            className="rounded-2xl border p-4 flex flex-col gap-2 transition-colors hover:bg-[var(--bg2)]"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <span className="text-2xl">{metric.icon}</span>
            <div>
              {metric.score !== undefined ? (
                <StarRating score={metric.score} size="sm" />
              ) : (
                <p className="font-display text-2xl" style={{ color: "var(--text)" }}>
                  {metric.value !== null ? metric.value : metric.formatted}
                </p>
              )}
              <p className="text-xs mt-0.5" style={{ color: "var(--dim)" }}>
                {metric.label}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Columna izquierda (2/3) ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Notificaciones sin leer */}
          {notifications.length > 0 && (
            <section
              className="rounded-2xl border overflow-hidden"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                  Notificaciones sin leer
                  <span
                    className="ml-2 text-xs px-1.5 py-0.5 rounded-full font-bold"
                    style={{ backgroundColor: "#f87171", color: "#fff" }}
                  >
                    {notifications.length}
                  </span>
                </h2>
              </div>
              <div>
                {notifications.map((n, i) => (
                  <Link
                    key={n.id}
                    href={n.link ?? "/"}
                    className="flex gap-3 px-5 py-3.5 transition-colors hover:bg-[var(--bg2)] border-b last:border-0"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <span className="text-xl shrink-0">{NOTIF_ICON[n.type] ?? "🔔"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{n.title}</p>
                      <p className="text-xs truncate mt-0.5" style={{ color: "var(--dim)" }}>{n.body}</p>
                    </div>
                    <span className="text-xs shrink-0 mt-0.5" style={{ color: "var(--dim)" }}>
                      {timeAgo(n.created_at)}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Publicaciones activas */}
          <section
            className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                Mis publicaciones activas
              </h2>
              <Link href="/mis-publicaciones" className="text-xs transition-colors" style={{ color: "var(--dim)" }}>
                Ver todas →
              </Link>
            </div>

            {activeListings.length === 0 ? (
              <div className="py-12 text-center px-5">
                <p className="text-3xl mb-2">🏔️</p>
                <p className="text-sm mb-3" style={{ color: "var(--dim)" }}>
                  Todavía no tenés publicaciones activas
                </p>
                <Link
                  href="/publicar"
                  className="inline-flex px-4 py-2 rounded-full text-sm font-medium transition-colors"
                  style={{ backgroundColor: "var(--blue)", color: "#fff" }}
                >
                  Publicar mi primer equipo
                </Link>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {activeListings.map((listing) => {
                  const media = listing.listing_media as { url: string; media_type: string; order: number }[];
                  const photo = media?.filter((m) => m.media_type === "photo").sort((a, b) => a.order - b.order)[0];
                  return (
                    <Link
                      key={listing.id}
                      href={`/publicaciones/${listing.id}`}
                      className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[var(--bg2)]"
                    >
                      <div
                        className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0"
                        style={{ backgroundColor: "var(--bg2)" }}
                      >
                        {photo ? (
                          <Image src={photo.url} alt={listing.title} fill sizes="48px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">🏔️</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>
                          {listing.title}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--dim)" }}>
                          {listing.price_type === "negotiable"
                            ? `Desde ${formatPrice(listing.price)}`
                            : formatPrice(listing.price)}
                        </p>
                      </div>
                      <span className="text-xs shrink-0" style={{ color: "var(--dim)" }}>→</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Actividad reciente */}
          {activity.length > 0 && (
            <section
              className="rounded-2xl border overflow-hidden"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                  Actividad reciente
                </h2>
              </div>
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {activity.map((item) => (
                  <Link
                    key={item.id}
                    href={item.link}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[var(--bg2)]"
                  >
                    <span className="text-xl shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>{item.label}</p>
                      <p className="text-sm truncate" style={{ color: "var(--text)" }}>{item.sublabel}</p>
                    </div>
                    <span className="text-xs shrink-0" style={{ color: "var(--dim)" }}>
                      {timeAgo(item.date)}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Columna derecha (1/3) ── */}
        <div className="flex flex-col gap-6">

          {/* Estado del perfil */}
          {!profileComplete && (
            <section
              className="rounded-2xl border overflow-hidden"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                  Completá tu perfil
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--dim)" }}>
                  Para publicar y comprar sin restricciones
                </p>
              </div>
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {profileItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className={item.done ? "text-green-400" : "text-yellow-400"}>
                        {item.done ? "✓" : "○"}
                      </span>
                      <p className="text-sm" style={{ color: item.done ? "var(--dim)" : "var(--text)" }}>
                        {item.label}
                      </p>
                    </div>
                    {!item.done && (
                      <Link href={item.link} className="text-xs font-medium" style={{ color: "var(--blue)" }}>
                        {item.cta}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Favoritos */}
          {recentFavorites.length > 0 && (
            <section
              className="rounded-2xl border overflow-hidden"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                  Favoritos
                </h2>
                <Link href="/mis-favoritos" className="text-xs" style={{ color: "var(--dim)" }}>
                  Ver todos →
                </Link>
              </div>
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {recentFavorites.map((listing) => {
                  if (!listing) return null;
                  const photo = listing.listing_media
                    ?.filter((m) => m.media_type === "photo")
                    .sort((a, b) => a.order - b.order)[0];
                  return (
                    <Link
                      key={listing.id}
                      href={`/publicaciones/${listing.id}`}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[var(--bg2)]"
                    >
                      <div
                        className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0"
                        style={{ backgroundColor: "var(--bg2)" }}
                      >
                        {photo ? (
                          <Image src={photo.url} alt={listing.title} fill sizes="40px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">🏔️</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate" style={{ color: "var(--text)" }}>{listing.title}</p>
                        <p className="text-xs" style={{ color: "var(--dim)" }}>{formatPrice(listing.price)}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Links rápidos */}
          <section
            className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                Accesos rápidos
              </h2>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {[
                { href: "/publicaciones", label: "Explorar equipo", icon: "🔍" },
                { href: "/mis-compras", label: "Mis compras", icon: "📦" },
                { href: "/mis-ventas", label: "Mis ventas", icon: "💳" },
                { href: "/contactos", label: "Mis contactos", icon: "💬" },
                { href: "/perfil", label: "Mi perfil", icon: "👤" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[var(--bg2)]"
                >
                  <span>{item.icon}</span>
                  <span className="text-sm" style={{ color: "var(--muted)" }}>{item.label}</span>
                  <span className="ml-auto text-xs" style={{ color: "var(--dim)" }}>→</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
