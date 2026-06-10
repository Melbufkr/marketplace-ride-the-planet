import { createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { formatPrice, CATEGORY_LABELS } from "@/lib/listings-helpers";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Publicaciones — Admin RTP" };

const STATUS_OPTIONS = ["all", "active", "paused", "sold", "deleted"] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

const STATUS_LABELS: Record<string, string> = {
  all: "Todas", active: "Activas", paused: "Pausadas", sold: "Vendidas", deleted: "Eliminadas",
};
const STATUS_COLORS: Record<string, string> = {
  active: "#22c55e", paused: "#fbbf24", sold: "#60a5fa", deleted: "#94a3b8",
};

export default async function AdminPublicacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "all" } = await searchParams;
  const supabase = createServiceClient();

  let query = supabase
    .from("listings")
    .select(`
      id, title, category, price, price_type, status, created_at,
      listing_media ( url, media_type, order ),
      users ( id, first_name, last_name, email )
    `)
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status as StatusFilter);
  }

  const { data: listings } = await query;

  return (
    <div className="p-8">
      <h1 className="font-display text-4xl mb-2" style={{ color: "var(--text)" }}>
        Publicaciones
      </h1>

      {/* Filtro de estado */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_OPTIONS.map((s) => (
          <Link
            key={s}
            href={`/admin/publicaciones${s === "all" ? "" : `?status=${s}`}`}
            className="px-4 py-1.5 rounded-full text-sm font-medium border transition-colors"
            style={{
              backgroundColor: status === s ? "var(--blue)" : "var(--bg2)",
              borderColor: status === s ? "var(--blue)" : "var(--border)",
              color: status === s ? "#fff" : "var(--muted)",
            }}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <p className="text-sm mb-4" style={{ color: "var(--dim)" }}>
        {listings?.length ?? 0} resultados
      </p>

      <div className="flex flex-col gap-3">
        {(listings ?? []).map((l) => {
          const seller = (l.users as { id: string; first_name: string; last_name: string; email: string } | null);
          const media = (l.listing_media as { url: string; media_type: string; order: number }[] | null)
            ?.filter((m) => m.media_type === "photo")
            .sort((a, b) => a.order - b.order)[0];

          return (
            <div
              key={l.id}
              className="rounded-2xl border p-4 flex items-center gap-4"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              {/* Foto */}
              <div
                className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0"
                style={{ backgroundColor: "var(--bg2)" }}
              >
                {media ? (
                  <Image src={media.url} alt="" fill sizes="56px" className="object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-xl">🏔️</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <Link
                    href={`/publicaciones/${l.id}`}
                    className="font-medium text-sm hover:underline truncate"
                    style={{ color: "var(--text)" }}
                    target="_blank"
                  >
                    {l.title}
                  </Link>
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
                <p className="text-xs" style={{ color: "var(--dim)" }}>
                  {CATEGORY_LABELS[l.category]} · {formatPrice(l.price)}
                  {" · "}
                  {new Date(l.created_at).toLocaleDateString("es-AR")}
                </p>
              </div>

              {/* Vendedor */}
              {seller && (
                <div className="shrink-0 text-right">
                  <p className="text-xs font-medium" style={{ color: "var(--text)" }}>
                    {seller.first_name} {seller.last_name}
                  </p>
                  <Link
                    href={`/admin/usuarios/${seller.id}`}
                    className="text-xs underline"
                    style={{ color: "var(--accent)" }}
                  >
                    Ver usuario
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
