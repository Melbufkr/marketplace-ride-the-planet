"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  toggleListingStatusAction,
  deleteListingAction,
} from "@/app/actions/listings";
import { formatPrice, CATEGORY_LABELS, CONDITION_LABELS } from "@/lib/listings-helpers";

type ListingRow = {
  id: string;
  title: string;
  category: string;
  condition: string;
  price: number;
  price_type: string;
  status: string;
  location: string;
  created_at: string;
  listing_media: { id: string; url: string; media_type: string; order: number }[];
};

const STATUS_LABELS: Record<string, string> = {
  active: "Activa",
  paused: "Pausada",
  sold: "Vendida",
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active:  { bg: "rgba(34,197,94,0.12)",  text: "#22c55e" },
  paused:  { bg: "rgba(251,191,36,0.12)", text: "#fbbf24" },
  sold:    { bg: "rgba(148,163,184,0.12)", text: "#94a3b8" },
};

export function MyListingsClient({ listings: initial }: { listings: ListingRow[] }) {
  const [listings, setListings] = useState(initial);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function toggleStatus(listing: ListingRow) {
    const newStatus = listing.status === "active" ? "paused" : "active";
    setPendingId(listing.id);
    startTransition(async () => {
      const result = await toggleListingStatusAction(listing.id, newStatus);
      if (!result.error) {
        setListings((prev) =>
          prev.map((l) => (l.id === listing.id ? { ...l, status: newStatus } : l))
        );
      }
      setPendingId(null);
    });
  }

  function handleDelete(listing: ListingRow) {
    if (!confirm(`¿Eliminar "${listing.title}"? Esta acción no se puede deshacer.`)) return;
    setPendingId(listing.id);
    startTransition(async () => {
      const result = await deleteListingAction(listing.id);
      if (!result.error) {
        setListings((prev) => prev.filter((l) => l.id !== listing.id));
      }
      setPendingId(null);
    });
  }

  if (listings.length === 0) {
    return (
      <div
        className="rounded-2xl border py-20 text-center"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg2)" }}
      >
        <p className="text-4xl mb-3">📭</p>
        <p className="font-medium mb-1" style={{ color: "var(--text)" }}>
          Todavía no publicaste nada
        </p>
        <p className="text-sm mb-5" style={{ color: "var(--dim)" }}>
          Publicar es gratis y solo toma unos minutos
        </p>
        <Link
          href="/publicar"
          className="inline-flex px-6 py-2.5 rounded-full text-sm font-medium"
          style={{ backgroundColor: "var(--blue)", color: "#fff" }}
        >
          Publicar equipo
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {listings.map((listing) => {
        const mainPhoto = listing.listing_media
          .filter((m) => m.media_type === "photo")
          .sort((a, b) => a.order - b.order)[0];

        const statusStyle = STATUS_COLORS[listing.status] ?? STATUS_COLORS.paused;
        const isPending = pendingId === listing.id;
        const canToggle = listing.status === "active" || listing.status === "paused";

        return (
          <div
            key={listing.id}
            className="flex items-center gap-4 rounded-2xl border p-4 transition-opacity"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
              opacity: isPending ? 0.6 : 1,
            }}
          >
            {/* Foto */}
            <div
              className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden"
              style={{ backgroundColor: "var(--bg2)" }}
            >
              {mainPhoto ? (
                <Image
                  src={mainPhoto.url}
                  alt={listing.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-xl">🏔️</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/publicaciones/${listing.id}`}
                  className="font-medium text-sm truncate hover:underline"
                  style={{ color: "var(--text)" }}
                >
                  {listing.title}
                </Link>
                <span
                  className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                >
                  {STATUS_LABELS[listing.status] ?? listing.status}
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: "var(--dim)" }}>
                {CATEGORY_LABELS[listing.category]} · {CONDITION_LABELS[listing.condition]} · {formatPrice(listing.price)}
              </p>
              <p className="text-xs" style={{ color: "var(--dim)" }}>
                📍 {listing.location}
              </p>
            </div>

            {/* Acciones */}
            <div className="shrink-0 flex items-center gap-2">
              {canToggle && (
                <button
                  onClick={() => toggleStatus(listing)}
                  disabled={isPending}
                  className="px-3 py-1.5 text-xs rounded-full border transition-colors hover:border-[var(--blue)] hover:text-[var(--accent)]"
                  style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                >
                  {listing.status === "active" ? "Pausar" : "Activar"}
                </button>
              )}
              <Link
                href={`/publicaciones/${listing.id}/editar`}
                className="px-3 py-1.5 text-xs rounded-full border transition-colors hover:border-[var(--blue)] hover:text-[var(--accent)]"
                style={{ borderColor: "var(--border)", color: "var(--muted)" }}
              >
                Editar
              </Link>
              <button
                onClick={() => handleDelete(listing)}
                disabled={isPending}
                className="px-3 py-1.5 text-xs rounded-full border transition-colors hover:border-red-500 hover:text-red-400"
                style={{ borderColor: "var(--border)", color: "var(--dim)" }}
              >
                Eliminar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
