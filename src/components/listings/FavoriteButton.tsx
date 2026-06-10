"use client";

import { useState, useTransition } from "react";
import { toggleFavorite } from "@/app/actions/favorites";

interface FavoriteButtonProps {
  listingId: string;
  initialFavorited: boolean;
  variant?: "card" | "inline"; // card = absoluto sobre imagen, inline = dentro del flujo
}

export function FavoriteButton({ listingId, initialFavorited, variant = "card" }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = await toggleFavorite(listingId);
      if (result.ok) setFavorited(result.favorited);
    });
  }

  if (variant === "inline") {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        aria-label={favorited ? "Quitar de favoritos" : "Agregar a favoritos"}
        className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full border transition-all duration-150 disabled:opacity-50 text-lg"
        style={{
          backgroundColor: "var(--bg2)",
          borderColor: favorited ? "#f87171" : "var(--border)",
          color: favorited ? "#f87171" : "var(--dim)",
        }}
      >
        {favorited ? "♥" : "♡"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={favorited ? "Quitar de favoritos" : "Agregar a favoritos"}
      className="absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-150 disabled:opacity-50"
      style={{
        backgroundColor: "rgba(7,12,20,0.7)",
        backdropFilter: "blur(4px)",
        color: favorited ? "#f87171" : "rgba(238,244,251,0.6)",
      }}
    >
      {favorited ? "♥" : "♡"}
    </button>
  );
}
