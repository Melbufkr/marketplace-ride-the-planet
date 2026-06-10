"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { ListingMediaRow } from "@/types/database";

interface ImageGalleryProps {
  photos: ListingMediaRow[];
  video: ListingMediaRow | null;
  title: string;
}

export function ImageGallery({ photos, video, title }: ImageGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const hasVideo = !!video;
  const totalItems = photos.length + (hasVideo ? 1 : 0);
  const isVideoActive = hasVideo && active === photos.length;

  const prev = useCallback(() => {
    setActive((a) => (a - 1 + totalItems) % totalItems);
  }, [totalItems]);

  const next = useCallback(() => {
    setActive((a) => (a + 1) % totalItems);
  }, [totalItems]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") setLightbox(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, prev, next]);

  // Bloquear scroll cuando lightbox abierto
  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  if (totalItems === 0) {
    return (
      <div
        className="aspect-square rounded-2xl flex items-center justify-center text-6xl"
        style={{ backgroundColor: "var(--bg2)" }}
      >
        🏔️
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Main media */}
        <div
          className="relative aspect-square rounded-2xl overflow-hidden"
          style={{ backgroundColor: "var(--bg2)" }}
        >
          {isVideoActive && video ? (
            <video src={video.url} controls className="w-full h-full object-contain" />
          ) : photos[active] ? (
            <>
              <Image
                src={photos[active].url}
                alt={`${title} — foto ${active + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover cursor-zoom-in"
                priority
                onClick={() => setLightbox(true)}
              />
              {/* Flechas en imagen principal (solo si hay más de 1) */}
              {totalItems > 1 && (
                <>
                  <button
                    onClick={prev}
                    aria-label="Anterior"
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-opacity opacity-0 hover:opacity-100 focus:opacity-100"
                    style={{ backgroundColor: "rgba(7,12,20,0.7)", color: "#fff", backdropFilter: "blur(4px)" }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={next}
                    aria-label="Siguiente"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-opacity opacity-0 hover:opacity-100 focus:opacity-100"
                    style={{ backgroundColor: "rgba(7,12,20,0.7)", color: "#fff", backdropFilter: "blur(4px)" }}
                  >
                    ›
                  </button>
                  {/* Contador */}
                  <span
                    className="absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "rgba(7,12,20,0.7)", color: "#fff", backdropFilter: "blur(4px)" }}
                  >
                    {active + 1} / {totalItems}
                  </span>
                </>
              )}
            </>
          ) : null}
        </div>

        {/* Thumbnails */}
        {totalItems > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photos.map((photo, i) => (
              <button
                key={photo.id}
                onClick={() => setActive(i)}
                className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors"
                style={{ borderColor: active === i ? "var(--blue)" : "var(--border)" }}
              >
                <Image src={photo.url} alt={`Miniatura ${i + 1}`} fill sizes="64px" className="object-cover" />
              </button>
            ))}
            {hasVideo && (
              <button
                onClick={() => setActive(photos.length)}
                className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 flex items-center justify-center transition-colors"
                style={{
                  borderColor: isVideoActive ? "var(--blue)" : "var(--border)",
                  backgroundColor: "var(--bg2)",
                }}
              >
                <span className="text-2xl">▶️</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && photos[active] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.92)" }}
          onClick={() => setLightbox(false)}
        >
          {/* Imagen principal */}
          <div
            className="relative w-full h-full max-w-5xl max-h-screen p-4 sm:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[active].url}
              alt={`${title} — foto ${active + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>

          {/* Cerrar */}
          <button
            onClick={() => setLightbox(false)}
            aria-label="Cerrar"
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white text-xl"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            ✕
          </button>

          {/* Flechas */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Anterior"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-white text-2xl"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Siguiente"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-white text-2xl"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                ›
              </button>
            </>
          )}

          {/* Contador lightbox */}
          <span
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm px-3 py-1 rounded-full text-white"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            {active + 1} / {photos.length}
          </span>
        </div>
      )}
    </>
  );
}
