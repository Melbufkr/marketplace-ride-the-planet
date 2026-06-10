import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatPrice, CATEGORY_LABELS } from "@/lib/listings-helpers";
import { ReviewSlot } from "@/components/reviews/ReviewSlot";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mis ventas — RTP Market" };

const TX_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  completed: "Completada",
  cancelled: "Cancelada",
};

const TX_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:   { bg: "rgba(251,191,36,0.12)",  text: "#fbbf24" },
  completed: { bg: "rgba(34,197,94,0.12)",   text: "#22c55e" },
  cancelled: { bg: "rgba(148,163,184,0.12)", text: "#94a3b8" },
};

export default async function MisVentasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/mis-ventas");

  const { data: transactions } = await supabase
    .from("transactions")
    .select(`
      id, amount, seller_amount, platform_fee_pct, platform_fee_amount,
      status, mp_status, created_at, completed_at,
      listings (
        id, title, category,
        listing_media ( url, media_type, order )
      ),
      buyer:buyer_id (
        id, first_name, last_name, reputation_score
      )
    `)
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  // Reviews ya hechas por este usuario sobre estas transacciones
  const txIds = (transactions ?? []).map((t) => t.id);
  const { data: myReviews } = txIds.length
    ? await supabase
        .from("reviews")
        .select("transaction_id, rating, comment")
        .eq("reviewer_id", user.id)
        .in("transaction_id", txIds)
    : { data: [] };

  const reviewByTx = Object.fromEntries(
    (myReviews ?? []).map((r) => [r.transaction_id, r])
  );

  // Totales
  const totalEarned = (transactions ?? [])
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + Number(t.seller_amount ?? t.amount), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-start justify-between mb-8">
        <h1 className="font-display text-4xl" style={{ color: "var(--text)" }}>
          Mis ventas
        </h1>
        {totalEarned > 0 && (
          <div className="text-right">
            <p className="text-xs mb-0.5" style={{ color: "var(--dim)" }}>Total cobrado</p>
            <p className="font-display text-2xl" style={{ color: "#22c55e" }}>
              {formatPrice(totalEarned)}
            </p>
          </div>
        )}
      </div>

      {!transactions?.length ? (
        <div
          className="rounded-2xl border py-20 text-center"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg2)" }}
        >
          <p className="text-4xl mb-3">🏷️</p>
          <p className="font-medium mb-1" style={{ color: "var(--text)" }}>
            Todavía no tenés ventas
          </p>
          <p className="text-sm mb-5" style={{ color: "var(--dim)" }}>
            Cuando alguien compre uno de tus productos, aparecerá acá
          </p>
          <Link
            href="/mis-publicaciones"
            className="inline-flex px-6 py-2.5 rounded-full text-sm font-medium"
            style={{ backgroundColor: "var(--blue)", color: "#fff" }}
          >
            Ver mis publicaciones
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {transactions.map((tx) => {
            const listing = (tx.listings as unknown) as {
              id: string; title: string; category: string;
              listing_media: { url: string; media_type: string; order: number }[];
            } | null;
            const buyer = (tx.buyer as unknown) as {
              id: string; first_name: string; last_name: string; reputation_score: number;
            } | null;
            const mainPhoto = listing?.listing_media
              .filter((m) => m.media_type === "photo")
              .sort((a, b) => a.order - b.order)[0];
            const review = reviewByTx[tx.id];
            const statusStyle = TX_STATUS_COLORS[tx.status] ?? TX_STATUS_COLORS.pending;

            return (
              <div
                key={tx.id}
                className="rounded-2xl border p-5 flex flex-col gap-4"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
              >
                {/* Header */}
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
                        <span className="text-sm font-medium" style={{ color: "var(--dim)" }}>
                          Publicación eliminada
                        </span>
                      )}
                      <span
                        className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                      >
                        {TX_STATUS_LABELS[tx.status] ?? tx.status}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: "var(--dim)" }}>
                      {listing ? CATEGORY_LABELS[listing.category] : ""} ·{" "}
                      {new Date(tx.created_at).toLocaleDateString("es-AR", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Monto cobrado */}
                  <div className="shrink-0 text-right">
                    <p className="font-display text-xl" style={{ color: "#22c55e" }}>
                      {formatPrice(tx.seller_amount ?? tx.amount)}
                    </p>
                    {tx.platform_fee_amount > 0 && (
                      <p className="text-xs" style={{ color: "var(--dim)" }}>
                        fee: {formatPrice(tx.platform_fee_amount)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Comprador + review */}
                {buyer && (
                  <div
                    className="flex items-center justify-between rounded-xl border px-4 py-3"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg2)" }}
                  >
                    <div>
                      <p className="text-xs mb-0.5" style={{ color: "var(--dim)" }}>Comprador</p>
                      <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                        {buyer.first_name} {buyer.last_name}
                      </p>
                    </div>

                    {tx.status === "completed" && (
                      <ReviewSlot
                        transactionId={tx.id}
                        revieweeName={buyer.first_name}
                        alreadyReviewed={!!review}
                        existingRating={review?.rating}
                        existingComment={review?.comment}
                      />
                    )}
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
