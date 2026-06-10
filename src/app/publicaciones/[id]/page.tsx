import { notFound } from "next/navigation";
import { getListingById, CATEGORY_LABELS, CONDITION_LABELS, formatPrice } from "@/lib/listings";
import { StarRating } from "@/components/ui/StarRating";
import { ActionButton } from "@/components/listings/ActionButton";
import { ImageGallery } from "@/components/listings/ImageGallery";
import { FavoriteButton } from "@/components/listings/FavoriteButton";
import { ShareButton } from "@/components/listings/ShareButton";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://market.ridetheplanet.ai";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) return { title: "Publicación no encontrada" };

  const mainPhoto = listing.listing_media
    .filter((m) => m.media_type === "photo")
    .sort((a, b) => a.order - b.order)[0];

  const description = listing.description.slice(0, 155);
  const url = `${BASE_URL}/publicaciones/${id}`;
  const priceLabel = listing.price_type === "negotiable"
    ? `Desde ${listing.price.toLocaleString("es-AR")} ARS`
    : `${listing.price.toLocaleString("es-AR")} ARS`;

  const title = `${listing.title} — ${CATEGORY_LABELS[listing.category]} en ${listing.location}`;

  return {
    title,
    description: `${description} · ${priceLabel} · ${CONDITION_LABELS[listing.condition]} · ${listing.location}`,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      locale: "es_AR",
      siteName: "RTP Market",
      ...(mainPhoto ? {
        images: [{ url: mainPhoto.url, width: 800, height: 800, alt: listing.title }],
      } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(mainPhoto ? { images: [mainPhoto.url] } : {}),
    },
  };
}

const CONDITION_COLORS: Record<string, string> = {
  nuevo: "#22c55e",
  muy_bueno: "#3b82f6",
  bueno: "#f59e0b",
  aceptable: "#94a3b8",
};

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) notFound();

  // Favorito del usuario actual
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let isFavorited = false;
  if (user) {
    const { data } = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", user.id)
      .eq("listing_id", id)
      .maybeSingle();
    isFavorited = !!data;
  }

  const seller = listing.users;
  const photos = listing.listing_media
    .filter((m) => m.media_type === "photo")
    .sort((a, b) => a.order - b.order);
  const video = listing.listing_media.find((m) => m.media_type === "video");

  const listingUrl = `${BASE_URL}/publicaciones/${listing.id}`;
  const mainPhotoUrl = photos[0]?.url;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description,
    ...(listing.brand ? { brand: { "@type": "Brand", name: listing.brand } } : {}),
    ...(mainPhotoUrl ? { image: mainPhotoUrl } : {}),
    offers: {
      "@type": "Offer",
      url: listingUrl,
      priceCurrency: "ARS",
      price: listing.price,
      availability: listing.status === "active"
        ? "https://schema.org/InStock"
        : "https://schema.org/SoldOut",
      seller: {
        "@type": "Person",
        name: `${seller.first_name} ${seller.last_name}`,
      },
    },
    itemCondition: listing.condition === "nuevo"
      ? "https://schema.org/NewCondition"
      : "https://schema.org/UsedCondition",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Explorar", item: `${BASE_URL}/publicaciones` },
      { "@type": "ListItem", position: 3, name: CATEGORY_LABELS[listing.category], item: `${BASE_URL}/publicaciones?category=${listing.category}` },
      { "@type": "ListItem", position: 4, name: listing.title, item: listingUrl },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* JSON-LD estructurado */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: "var(--dim)" }}>
        <Link href="/publicaciones" className="hover:text-[var(--muted)] transition-colors">
          Explorar
        </Link>
        <span>›</span>
        <span>{CATEGORY_LABELS[listing.category]}</span>
        <span>›</span>
        <span className="truncate max-w-xs" style={{ color: "var(--muted)" }}>
          {listing.title}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Galería */}
        <ImageGallery photos={photos} video={video ?? null} title={listing.title} />

        {/* Info */}
        <div className="flex flex-col gap-5">
          {/* Categoría + condición */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs px-3 py-1 rounded-full border"
              style={{ borderColor: "var(--border)", color: "var(--dim)" }}
            >
              {CATEGORY_LABELS[listing.category]}
            </span>
            <span
              className="text-xs px-3 py-1 rounded-full font-medium"
              style={{
                backgroundColor: `${CONDITION_COLORS[listing.condition]}20`,
                color: CONDITION_COLORS[listing.condition],
              }}
            >
              {CONDITION_LABELS[listing.condition]}
            </span>
          </div>

          {/* Título + acciones */}
          <div className="flex items-start gap-2">
            <h1 className="font-display text-3xl sm:text-4xl leading-tight flex-1" style={{ color: "var(--text)" }}>
              {listing.title}
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <ShareButton title={listing.title} url={`${BASE_URL}/publicaciones/${listing.id}`} />
              {user && (
                <FavoriteButton listingId={listing.id} initialFavorited={isFavorited} variant="inline" />
              )}
            </div>
          </div>

          {/* Precio */}
          <div>
            <p className="font-display text-4xl" style={{ color: "var(--accent)" }}>
              {listing.price_type === "negotiable"
                ? `Desde ${formatPrice(listing.price)}`
                : formatPrice(listing.price)}
            </p>
            {listing.price_type === "negotiable" && (
              <p className="text-sm mt-1" style={{ color: "var(--dim)" }}>
                Precio conversable — el vendedor coordina contigo
              </p>
            )}
          </div>

          {/* Detalles */}
          <div
            className="grid grid-cols-2 gap-3 rounded-xl p-4 border text-sm"
            style={{ backgroundColor: "var(--bg2)", borderColor: "var(--border)" }}
          >
            <Detail label="Ubicación" value={`📍 ${listing.location}`} />
            {listing.brand && <Detail label="Marca" value={listing.brand} />}
            {listing.size && <Detail label="Talle / Medida" value={listing.size} />}
            {listing.seasons_used != null && (
              <Detail
                label="Temporadas de uso"
                value={listing.seasons_used === 0 ? "Sin usar" : `${listing.seasons_used}`}
              />
            )}
          </div>

          {/* Descripción */}
          <div>
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--muted)" }}>
              Descripción
            </h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--muted)" }}>
              {listing.description}
            </p>
          </div>

          {/* Vendedor */}
          <div
            className="flex items-center justify-between rounded-xl border p-4"
            style={{ backgroundColor: "var(--bg2)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-display text-lg"
                style={{ backgroundColor: "var(--bg)", color: "var(--accent)" }}
              >
                {seller.first_name[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                  {seller.first_name} {seller.last_name}
                </p>
                <StarRating score={Number(seller.reputation_score ?? 0)} size="sm" />
              </div>
            </div>
            <Link
              href={`/perfil/${seller.id}`}
              className="text-xs transition-colors"
              style={{ color: "var(--dim)" }}
            >
              Ver perfil →
            </Link>
          </div>

          {/* Botón de acción */}
          <ActionButton listing={listing} />
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs mb-0.5" style={{ color: "var(--dim)" }}>
        {label}
      </p>
      <p className="font-medium" style={{ color: "var(--text)" }}>
        {value}
      </p>
    </div>
  );
}
