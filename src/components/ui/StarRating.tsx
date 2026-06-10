interface StarRatingProps {
  score: number; // 0–5
  size?: "sm" | "md";
  showScore?: boolean;
}

export function StarRating({ score, size = "sm", showScore = true }: StarRatingProps) {
  const filled = Math.round(score);
  const starSize = size === "sm" ? 12 : 16;

  return (
    <span className="inline-flex items-center gap-1">
      <span className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            width={starSize}
            height={starSize}
            viewBox="0 0 24 24"
            fill={i < filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: i < filled ? "var(--accent)" : "var(--dim)" }}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </span>
      {showScore && (
        <span
          className="text-xs tabular-nums"
          style={{ color: score > 0 ? "var(--muted)" : "var(--dim)" }}
        >
          {score > 0 ? score.toFixed(1) : "Sin reseñas"}
        </span>
      )}
    </span>
  );
}
