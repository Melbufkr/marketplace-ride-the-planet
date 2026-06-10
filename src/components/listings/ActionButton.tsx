"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { StarRating } from "@/components/ui/StarRating";
import { formatPrice } from "@/lib/listings-helpers";
import type { ListingWithSeller } from "@/types/database";
import Image from "next/image";

interface ActionButtonProps {
  listing: ListingWithSeller;
}

export function ActionButton({ listing }: ActionButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dniRequired, setDniRequired] = useState(false);
  const router = useRouter();

  if (listing.status !== "active") {
    return (
      <div
        className="rounded-xl border p-4 text-center text-sm"
        style={{ borderColor: "var(--border)", color: "var(--dim)" }}
      >
        Esta publicación ya no está disponible
      </div>
    );
  }

  const isFixed = listing.price_type === "fixed";
  const seller = listing.users;

  const mainPhoto = listing.listing_media
    ?.filter((m) => m.media_type === "photo")
    .sort((a, b) => a.order - b.order)[0];

  async function handleConfirm() {
    setLoading(true);
    if (isFixed) {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listing_id: listing.id }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (data.code === "dni_required") { setDniRequired(true); setLoading(false); return; }
          alert(data.error ?? "No se pudo iniciar el pago");
          setLoading(false);
          return;
        }
        // Redirigir a Mercado Pago
        window.location.href = data.checkout_url;
      } catch {
        alert("Error de red. Intentá de nuevo.");
        setLoading(false);
      }
    } else {
      // Crea contact_exchange y manda emails
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listing_id: listing.id }),
        });
        if (res.ok) {
          setOpen(false);
          router.push(`/contactos?nuevo=${listing.id}`);
        } else {
          const data = await res.json();
          if (data.code === "dni_required") { setDniRequired(true); return; }
          alert(data.error ?? "Ocurrió un error");
        }
      } catch {
        alert("Ocurrió un error");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <>
      <Button
        fullWidth
        size="lg"
        variant="primary"
        onClick={() => setOpen(true)}
      >
        {isFixed ? "Comprar" : "Contactar vendedor"}
      </Button>

      {/* Modal de confirmación */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border p-6 flex flex-col gap-5"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            {/* Header del modal */}
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-xl" style={{ color: "var(--text)" }}>
                {isFixed ? "Confirmar compra" : "Contactar al vendedor"}
              </h3>
              <button
                onClick={() => setOpen(false)}
                style={{ color: "var(--dim)" }}
                className="text-lg leading-none mt-0.5"
              >
                ✕
              </button>
            </div>

            {/* Preview del item */}
            <div
              className="flex items-center gap-3 rounded-xl border p-3"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg2)" }}
            >
              <div
                className="relative shrink-0 w-14 h-14 rounded-lg overflow-hidden"
                style={{ backgroundColor: "var(--bg)" }}
              >
                {mainPhoto ? (
                  <Image src={mainPhoto.url} alt={listing.title} fill sizes="56px" className="object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-2xl">🏔️</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>
                  {listing.title}
                </p>
                <p className="font-display text-lg" style={{ color: "var(--accent)" }}>
                  {formatPrice(listing.price)}
                </p>
              </div>
            </div>

            {/* Vendedor */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-display"
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

            {/* Texto de contexto */}
            <p className="text-sm" style={{ color: "var(--dim)" }}>
              {isFixed
                ? "Vas a ser redirigido al checkout de Mercado Pago para completar el pago de forma segura."
                : "Vas a compartir tus datos de contacto con el vendedor para coordinar este intercambio."}
            </p>

            {/* DNI requerido */}
            {dniRequired && (
              <div
                className="rounded-xl px-4 py-3 text-sm text-center"
                style={{ backgroundColor: "rgba(251,191,36,0.1)", color: "#fbbf24" }}
              >
                🪪 Necesitás{" "}
                <Link href="/perfil" className="underline font-medium" onClick={() => setOpen(false)}>
                  verificar tu DNI
                </Link>{" "}
                antes de continuar.
              </div>
            )}

            {/* CTA */}
            {!dniRequired && (
              <Button
                fullWidth
                loading={loading}
                onClick={handleConfirm}
              >
                {isFixed ? "Ir a la compra" : "Continuar"}
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
