"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface ReviewFormProps {
  transactionId?: string;
  exchangeId?: string;
  revieweeName: string;
  onSuccess?: () => void;
}

export function ReviewForm({
  transactionId,
  exchangeId,
  revieweeName,
  onSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) { setError("Seleccioná una calificación"); return; }
    setLoading(true);
    setError("");

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating,
        comment: comment || undefined,
        transaction_id: transactionId,
        exchange_id: exchangeId,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Error al enviar la calificación");
      return;
    }

    setDone(true);
    onSuccess?.();
  }

  if (done) {
    return (
      <div
        className="rounded-xl p-4 text-center text-sm"
        style={{ backgroundColor: "rgba(34,197,94,0.08)", color: "#22c55e" }}
      >
        ✅ Gracias por tu calificación
      </div>
    );
  }

  const display = hovered || rating;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
        Calificá a {revieweeName}
      </p>

      {/* Estrellas interactivas */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110 active:scale-95"
            aria-label={`${star} estrella${star > 1 ? "s" : ""}`}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill={star <= display ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.5"
              style={{
                color: star <= display ? "var(--accent)" : "var(--dim)",
                transition: "color 0.1s",
              }}
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        ))}
      </div>

      {/* Comentario opcional */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Comentario opcional..."
        maxLength={500}
        className="w-full px-4 py-2.5 text-sm rounded-xl border outline-none resize-none placeholder:text-[var(--dim)] transition-colors"
        style={{
          backgroundColor: "var(--bg2)",
          color: "var(--text)",
          borderColor: "var(--border)",
        }}
      />

      {error && <p className="text-xs text-red-400">{error}</p>}

      <Button type="submit" loading={loading} size="sm">
        Enviar calificación
      </Button>
    </form>
  );
}
