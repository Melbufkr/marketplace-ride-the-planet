import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ListingCard } from "@/components/listings/ListingCard";
import type { ListingWithMedia } from "@/types/database";

export const metadata = { title: "Mis favoritos — RTP Market" };

export default async function MisFavoritosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/mis-favoritos");

  const { data: rows } = await supabase
    .from("favorites")
    .select(`
      listing_id,
      listings (
        id, user_id, title, category, description, brand, size,
        seasons_used, condition, price, price_type, location, status,
        relevance_score, created_at, updated_at,
        listing_media ( id, listing_id, url, media_type, order, created_at ),
        users ( id, first_name, last_name, reputation_score )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const listings = (rows ?? [])
    .map((r) => r.listings as ListingWithMedia | null)
    .filter((l): l is ListingWithMedia => l !== null && l.status === "active");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl mb-8" style={{ color: "var(--text)" }}>
        Mis favoritos
      </h1>

      {listings.length === 0 ? (
        <div
          className="rounded-2xl border py-20 text-center"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg2)" }}
        >
          <p className="text-4xl mb-3">♡</p>
          <p className="font-medium mb-1" style={{ color: "var(--text)" }}>
            Todavía no guardaste favoritos
          </p>
          <p className="text-sm" style={{ color: "var(--dim)" }}>
            Hacé click en el corazón de cualquier publicación para guardarla acá.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} isFavorited={true} />
          ))}
        </div>
      )}
    </div>
  );
}
