"use client";

import { useState } from "react";
import { ReviewForm } from "./ReviewForm";

interface ReviewSlotProps {
  transactionId?: string;
  exchangeId?: string;
  revieweeName: string;
  alreadyReviewed: boolean;
  existingRating?: number;
  existingComment?: string | null;
}

export function ReviewSlot({
  transactionId,
  exchangeId,
  revieweeName,
  alreadyReviewed: initialReviewed,
  existingRating,
  existingComment,
}: ReviewSlotProps) {
  const [open, setOpen] = useState(false);
  const [reviewed, setReviewed] = useState(initialReviewed);

  if (reviewed && existingRating) {
    return (
      <div
        className="rounded-xl border p-3 text-sm flex items-start gap-3"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg2)" }}
      >
        <div>
          <p className="text-xs mb-1" style={{ color: "var(--dim)" }}>Tu calificación</p>
          <div className="flex gap-0.5 mb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg key={s} width="14" height="14" viewBox="0 0 24 24"
                fill={s <= existingRating ? "currentColor" : "none"}
                stroke="currentColor" strokeWidth="2"
                style={{ color: s <= existingRating ? "var(--accent)" : "var(--dim)" }}
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
          {existingComment && (
            <p className="text-xs" style={{ color: "var(--dim)" }}>{existingComment}</p>
          )}
        </div>
      </div>
    );
  }

  if (reviewed) {
    return (
      <div className="text-xs" style={{ color: "var(--dim)" }}>
        ✅ Ya calificaste a {revieweeName}
      </div>
    );
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="text-sm underline transition-colors"
          style={{ color: "var(--accent)" }}
        >
          Calificar a {revieweeName}
        </button>
      ) : (
        <div
          className="rounded-xl border p-4 mt-2"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg2)" }}
        >
          <ReviewForm
            transactionId={transactionId}
            exchangeId={exchangeId}
            revieweeName={revieweeName}
            onSuccess={() => setReviewed(true)}
          />
        </div>
      )}
    </div>
  );
}
