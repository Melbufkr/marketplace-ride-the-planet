import Link from "next/link";
import Image from "next/image";
import type { ListingWithMedia } from "@/types/database";
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  formatPrice,
} from "@/lib/listings-helpers";
import { StarRating } from "@/components/ui/StarRating";
import { FavoriteButton } from "@/components/listings/FavoriteButton";

interface ListingCardProps {
  listing: ListingWithMedia;
  isFavorited?: boolean;
}

const CONDITION_COLORS: Record<string, string> = {
  nuevo: "#22c55e",
  muy_bueno: "#3b82f6",
  bueno: "#f59e0b",
  aceptable: "#94a3b8",
};

export function ListingCard({ listing, isFavorited }: ListingCardProps) {
  const mainPhoto = listing.listing_media
    ?.filter((m) => m.media_type === "photo")
    .sort((a, b) => a.order - b.order)[0];

  const seller = listing.users;

  return (
    <Link
      href={`/publicaciones/${listing.id}`}
      className="group flex flex-col rounded-2xl border overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }}
    >
      {/* Imagen */}
      <div
        className="relative aspect-square overflow-hidden"
        style={{ backgroundColor: "var(--bg2)" }}
      >
        {mainPhoto ? (
          <Image
            src={mainPhoto.url}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">
            🏔️
          </div>
        )}

        {/* Badge precio_type */}
        {listing.price_type === "negotiable" && (
          <span
            className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: "rgba(7,12,20,0.75)",
              color: "var(--accent)",
              backdropFilter: "blur(4px)",
            }}
          >
            A convenir
          </span>
        )}

        {/* Badge condición */}
        <span
          className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium"
          style={{
            backgroundColor: "rgba(7,12,20,0.75)",
            color: CONDITION_COLORS[listing.condition] ?? "var(--muted)",
            backdropFilter: "blur(4px)",
          }}
        >
          {CONDITION_LABELS[listing.condition]}
        </span>

        {/* Botón favorito — solo si se pasó el prop */}
        {isFavorited !== undefined && (
          <FavoriteButton listingId={listing.id} initialFavorited={isFavorited} />
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-3 flex-1">
        {/* Categoría */}
        <span className="text-xs" style={{ color: "var(--dim)" }}>
          {CATEGORY_LABELS[listing.category] ?? listing.category}
        </span>

        {/* Título */}
        <h3
          className="text-sm font-medium leading-snug line-clamp-2"
          style={{ color: "var(--text)" }}
        >
          {listing.title}
        </h3>

        {/* Precio */}
        <p
          className="font-display text-lg mt-auto"
          style={{ color: listing.price_type === "negotiable" ? "var(--accent)" : "var(--text)" }}
        >
          {listing.price_type === "negotiable"
            ? `Desde ${formatPrice(listing.price)}`
            : formatPrice(listing.price)}
        </p>

        {/* Footer: ubicación + reputación */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t" style={{ borderColor: "var(--border)" }}>
          <span className="text-xs truncate" style={{ color: "var(--dim)" }}>
            📍 {listing.location}
          </span>
          {seller && (
            <StarRating score={Number(seller.reputation_score ?? 0)} size="sm" showScore={false} />
          )}
        </div>
      </div>
    </Link>
  );
}
