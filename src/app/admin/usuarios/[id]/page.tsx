import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatPrice, CATEGORY_LABELS } from "@/lib/listings-helpers";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Detalle usuario — Admin RTP" };

const STATUS_LABELS: Record<string, string> = {
  active: "Activa", paused: "Pausada", sold: "Vendida", deleted: "Eliminada",
};
const STATUS_COLORS: Record<string, string> = {
  active: "#22c55e", paused: "#fbbf24", sold: "#60a5fa", deleted: "#94a3b8",
};
const TX_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente", completed: "Completada", cancelled: "Cancelada",
};

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (!user) notFound();

  const [
    { data: listings },
    { data: purchases },
    { data: sales },
    { data: contacts },
    { data: reviews },
  ] = await Promise.all([
    supabase
      .from("listings")
      .select("id, title, category, price, price_type, status, created_at, listing_media(url, media_type, order)")
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("transactions")
      .select("id, amount, status, created_at, listings(title)")
      .eq("buyer_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("transactions")
      .select("id, amount, status, created_at, listings(title)")
      .eq("seller_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("contact_exchanges")
      .select("id, type, created_at, listings(title)")
      .or(`buyer_id.eq.${id},seller_id.eq.${id}`)
      .order("created_at", { ascending: false }),
    supabase
      .from("reviews")
      .select("id, rating, comment, created_at")
      .eq("reviewee_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const sectionTitle = (t: string) => (
    <h2 className="font-display text-2xl mb-4" style={{ color: "var(--text)" }}>
      {t}
    </h2>
  );

  const card = (children: React.ReactNode) => (
    <div
      className="rounded-2xl border p-5 mb-8"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      {children}
    </div>
  );

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <Link
        href="/admin/usuarios"
        className="text-sm mb-6 inline-block"
        style={{ color: "var(--dim)" }}
      >
        ← Todos los usuarios
      </Link>

      <div className="flex items-start gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display text-4xl" style={{ color: "var(--text)" }}>
              {user.first_name} {user.last_name}
            </h1>
            {user.is_admin && (
              <span
                className="text-xs px-2 py-1 rounded-full font-medium"
                style={{ backgroundColor: "rgba(167,139,250,0.15)", color: "#a78bfa" }}
              >
                admin
              </span>
            )}
          </div>
          <p className="text-sm" style={{ color: "var(--dim)" }}>{user.email}</p>
          <p className="text-sm" style={{ color: "var(--dim)" }}>
            WhatsApp: +{user.whatsapp_country_code} {user.whatsapp_number}
          </p>
          <p className="text-sm" style={{ color: "var(--dim)" }}>
            DNI: {user.dni} · Nacimiento: {new Date(user.birth_date).toLocaleDateString("es-AR")}
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--accent)" }}>
            ★ {Number(user.reputation_score).toFixed(2)} reputación
          </p>
          {user.mp_user_id && (
            <p className="text-xs mt-1" style={{ color: "#22c55e" }}>
              ✅ Mercado Pago conectado (MP ID: {user.mp_user_id})
            </p>
          )}
        </div>
      </div>

      {/* Publicaciones */}
      {sectionTitle(`Publicaciones (${listings?.length ?? 0})`)}
      {card(
        <div className="flex flex-col gap-3">
          {!listings?.length && (
            <p className="text-sm" style={{ color: "var(--dim)" }}>Sin publicaciones</p>
          )}
          {listings?.map((l) => {
            const media = (l.listing_media as { url: string; media_type: string; order: number }[] | null)
              ?.filter((m) => m.media_type === "photo")
              .sort((a, b) => a.order - b.order)[0];
            return (
              <div
                key={l.id}
                className="flex items-center gap-3 border-b last:border-0 pb-3 last:pb-0"
                style={{ borderColor: "var(--border)" }}
              >
                <div
                  className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0"
                  style={{ backgroundColor: "var(--bg2)" }}
                >
                  {media ? (
                    <Image src={media.url} alt="" fill sizes="40px" className="object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-base">🏔️</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/publicaciones/${l.id}`}
                    className="text-sm font-medium hover:underline truncate block"
                    style={{ color: "var(--text)" }}
                    target="_blank"
                  >
                    {l.title}
                  </Link>
                  <p className="text-xs" style={{ color: "var(--dim)" }}>
                    {CATEGORY_LABELS[l.category]} · {formatPrice(l.price)}
                  </p>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    color: STATUS_COLORS[l.status] ?? "#94a3b8",
                    backgroundColor: `${STATUS_COLORS[l.status] ?? "#94a3b8"}18`,
                  }}
                >
                  {STATUS_LABELS[l.status] ?? l.status}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Compras */}
      {sectionTitle(`Compras (${purchases?.length ?? 0})`)}
      {card(
        <div className="flex flex-col gap-3">
          {!purchases?.length && (
            <p className="text-sm" style={{ color: "var(--dim)" }}>Sin compras</p>
          )}
          {purchases?.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0 text-sm"
              style={{ borderColor: "var(--border)" }}
            >
              <div>
                <p style={{ color: "var(--text)" }}>
                  {(tx.listings as { title: string } | null)?.title ?? "—"}
                </p>
                <p className="text-xs" style={{ color: "var(--dim)" }}>
                  {new Date(tx.created_at).toLocaleDateString("es-AR")} · {TX_STATUS_LABELS[tx.status]}
                </p>
              </div>
              <p className="font-medium" style={{ color: "var(--accent)" }}>
                {formatPrice(tx.amount)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Ventas */}
      {sectionTitle(`Ventas (${sales?.length ?? 0})`)}
      {card(
        <div className="flex flex-col gap-3">
          {!sales?.length && (
            <p className="text-sm" style={{ color: "var(--dim)" }}>Sin ventas</p>
          )}
          {sales?.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0 text-sm"
              style={{ borderColor: "var(--border)" }}
            >
              <div>
                <p style={{ color: "var(--text)" }}>
                  {(tx.listings as { title: string } | null)?.title ?? "—"}
                </p>
                <p className="text-xs" style={{ color: "var(--dim)" }}>
                  {new Date(tx.created_at).toLocaleDateString("es-AR")} · {TX_STATUS_LABELS[tx.status]}
                </p>
              </div>
              <p className="font-medium" style={{ color: "#22c55e" }}>
                {formatPrice(tx.amount)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Contactos */}
      {sectionTitle(`Contactos (${contacts?.length ?? 0})`)}
      {card(
        <div className="flex flex-col gap-3">
          {!contacts?.length && (
            <p className="text-sm" style={{ color: "var(--dim)" }}>Sin contactos</p>
          )}
          {contacts?.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0 text-sm"
              style={{ borderColor: "var(--border)" }}
            >
              <p style={{ color: "var(--text)" }}>
                {(c.listings as { title: string } | null)?.title ?? "—"}
              </p>
              <p className="text-xs" style={{ color: "var(--dim)" }}>
                {new Date(c.created_at).toLocaleDateString("es-AR")}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Calificaciones recibidas */}
      {sectionTitle(`Calificaciones recibidas (${reviews?.length ?? 0})`)}
      {card(
        <div className="flex flex-col gap-3">
          {!reviews?.length && (
            <p className="text-sm" style={{ color: "var(--dim)" }}>Sin calificaciones</p>
          )}
          {reviews?.map((r) => (
            <div
              key={r.id}
              className="border-b last:border-0 pb-3 last:pb-0"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} width="12" height="12" viewBox="0 0 24 24"
                    fill={s <= r.rating ? "currentColor" : "none"}
                    stroke="currentColor" strokeWidth="2"
                    style={{ color: s <= r.rating ? "var(--accent)" : "var(--dim)" }}
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
                <span className="text-xs ml-2" style={{ color: "var(--dim)" }}>
                  {new Date(r.created_at).toLocaleDateString("es-AR")}
                </span>
              </div>
              {r.comment && (
                <p className="text-sm" style={{ color: "var(--text)" }}>{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
