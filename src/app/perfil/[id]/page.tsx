import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatPrice, CATEGORY_LABELS } from "@/lib/listings-helpers";
import { StarRating } from "@/components/ui/StarRating";
import { ListingCard } from "@/components/listings/ListingCard";
import type { Metadata } from "next";
import type { ListingWithMedia } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("first_name, last_name")
    .eq("id", id)
    .single();
  if (!data) return { title: "Perfil no encontrado" };
  return { title: `${data.first_name} ${data.last_name} — RTP Market` };
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: seller } = await supabase
    .from("users")
    .select("id, first_name, last_name, reputation_score, created_at")
    .eq("id", id)
    .single();

  if (!seller) notFound();

  const [{ data: listings }, { data: reviews }] = await Promise.all([
    supabase
      .from("listings")
      .select("*, listing_media(id, url, media_type, order), users(id, first_name, last_name, reputation_score)")
      .eq("user_id", id)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase
      .from("reviews")
      .select("id, rating, comment, created_at, reviewer:reviewer_id(first_name, last_name)")
      .eq("reviewee_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const score = Number(seller.reputation_score ?? 0);
  const reviewCount = reviews?.length ?? 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header del vendedor */}
      <div
        className="rounded-2xl border p-6 flex items-center gap-5 mb-8"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center font-display text-3xl shrink-0"
          style={{ backgroundColor: "var(--bg2)", color: "var(--accent)" }}
        >
          {seller.first_name[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-3xl mb-1" style={{ color: "var(--text)" }}>
            {seller.first_name} {seller.last_name}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <StarRating score={score} size="md" />
            <span className="text-sm" style={{ color: "var(--dim)" }}>
              {score.toFixed(1)} / 5.0 · {reviewCount} calificación{reviewCount !== 1 ? "es" : ""}
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--dim)" }}>
            Miembro desde{" "}
            {new Date(seller.created_at).toLocaleDateString("es-AR", {
              month: "long", year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Publicaciones activas */}
      <h2 className="font-display text-2xl mb-4" style={{ color: "var(--text)" }}>
        Publicaciones activas ({listings?.length ?? 0})
      </h2>

      {!listings?.length ? (
        <div
          className="rounded-2xl border py-12 text-center mb-8"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg2)" }}
        >
          <p className="text-3xl mb-2">🏔️</p>
          <p className="text-sm" style={{ color: "var(--dim)" }}>
            Este vendedor no tiene publicaciones activas en este momento
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {(listings as unknown as ListingWithMedia[]).map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {/* Reviews recibidas */}
      {reviewCount > 0 && (
        <>
          <h2 className="font-display text-2xl mb-4" style={{ color: "var(--text)" }}>
            Calificaciones recibidas
          </h2>
          <div className="flex flex-col gap-3">
            {reviews!.map((r) => {
              const reviewer = (r.reviewer as unknown) as { first_name: string; last_name: string } | null;
              return (
                <div
                  key={r.id}
                  className="rounded-2xl border p-4"
                  style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
                        style={{ backgroundColor: "var(--bg2)", color: "var(--accent)" }}
                      >
                        {reviewer?.first_name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                        {reviewer ? `${reviewer.first_name} ${reviewer.last_name}` : "Usuario"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating score={r.rating} size="sm" />
                      <span className="text-xs" style={{ color: "var(--dim)" }}>
                        {new Date(r.created_at).toLocaleDateString("es-AR", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  {r.comment && (
                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                      "{r.comment}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
