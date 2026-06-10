import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CATEGORY_LABELS, formatPrice } from "@/lib/listings";
import { ReviewSlot } from "@/components/reviews/ReviewSlot";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Historial de contactos — RTP Market" };

export default async function ContactosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/contactos");

  // Todos los exchanges donde participé (como comprador o vendedor)
  const { data: exchanges } = await supabase
    .from("contact_exchanges")
    .select(`
      id, type, email_sent, created_at, buyer_id, seller_id,
      listings (
        id, title, category, price, price_type,
        listing_media ( url, media_type, order )
      ),
      buyer:buyer_id ( id, first_name, last_name ),
      seller:seller_id ( id, first_name, last_name )
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  // Reviews ya hechas por este usuario sobre exchanges
  const exIds = (exchanges ?? []).map((e) => e.id);
  const { data: myReviews } = exIds.length
    ? await supabase
        .from("reviews")
        .select("exchange_id, rating, comment")
        .eq("reviewer_id", user.id)
        .in("exchange_id", exIds)
    : { data: [] };

  const reviewByEx = Object.fromEntries(
    (myReviews ?? []).map((r) => [r.exchange_id, r])
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-4xl mb-8" style={{ color: "var(--text)" }}>
        Historial de contactos
      </h1>

      {!exchanges?.length ? (
        <div
          className="rounded-2xl border py-20 text-center"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg2)" }}
        >
          <p className="text-4xl mb-3">📭</p>
          <p className="font-medium mb-1" style={{ color: "var(--text)" }}>
            Todavía no iniciaste contactos
          </p>
          <p className="text-sm mb-5" style={{ color: "var(--dim)" }}>
            Cuando contactes a un vendedor o alguien te contacte, aparecerá acá
          </p>
          <Link
            href="/publicaciones"
            className="inline-flex px-6 py-2.5 rounded-full text-sm font-medium"
            style={{ backgroundColor: "var(--blue)", color: "#fff" }}
          >
            Explorar equipo
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {(exchanges ?? []).map((ex) => {
            const isBuyer = ex.buyer_id === user.id;
            const listing = (ex.listings as unknown) as {
              id: string; title: string; category: string; price: number; price_type: string;
              listing_media: { url: string; media_type: string; order: number }[];
            } | null;
            const counterpart = isBuyer
              ? ((ex.seller as unknown) as { id: string; first_name: string; last_name: string } | null)
              : ((ex.buyer as unknown) as { id: string; first_name: string; last_name: string } | null);

            const mainPhoto = listing?.listing_media
              .filter((m) => m.media_type === "photo")
              .sort((a, b) => a.order - b.order)[0];

            const review = reviewByEx[ex.id];

            return (
              <div
                key={ex.id}
                className="rounded-2xl border p-5 flex flex-col gap-4"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
              >
                <div className="flex items-start gap-4">
                  {/* Foto */}
                  <div
                    className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden"
                    style={{ backgroundColor: "var(--bg2)" }}
                  >
                    {mainPhoto ? (
                      <Image src={mainPhoto.url} alt={listing?.title ?? ""} fill sizes="64px" className="object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-xl">🏔️</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {listing ? (
                        <Link
                          href={`/publicaciones/${listing.id}`}
                          className="font-medium text-sm hover:underline truncate"
                          style={{ color: "var(--text)" }}
                        >
                          {listing.title}
                        </Link>
                      ) : (
                        <span className="text-sm" style={{ color: "var(--dim)" }}>
                          Publicación eliminada
                        </span>
                      )}
                      <span
                        className="shrink-0 text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: "rgba(42,127,206,0.1)",
                          color: "var(--accent)",
                        }}
                      >
                        {isBuyer ? "Vos consultaste" : "Te consultaron"}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: "var(--dim)" }}>
                      {listing ? `${CATEGORY_LABELS[listing.category]} · ${formatPrice(listing.price)} a convenir` : ""}
                      {" · "}
                      {new Date(ex.created_at).toLocaleDateString("es-AR", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Contraparte + review */}
                {counterpart && (
                  <div
                    className="flex items-center justify-between rounded-xl border px-4 py-3"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg2)" }}
                  >
                    <div>
                      <p className="text-xs mb-0.5" style={{ color: "var(--dim)" }}>
                        {isBuyer ? "Vendedor" : "Comprador"}
                      </p>
                      <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                        {counterpart.first_name} {counterpart.last_name}
                      </p>
                    </div>
                    <ReviewSlot
                      exchangeId={ex.id}
                      revieweeName={counterpart.first_name}
                      alreadyReviewed={!!review}
                      existingRating={review?.rating}
                      existingComment={review?.comment}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
