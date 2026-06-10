import Link from "next/link";
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/listings-helpers";

const CATEGORIES = Object.keys(CATEGORY_LABELS);

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {CATEGORIES.map((cat) => (
        <Link
          key={cat}
          href={`/publicaciones?category=${cat}`}
          className="flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-150 hover:-translate-y-0.5 hover:border-[var(--blue)] group"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <span className="text-2xl">{CATEGORY_ICONS[cat]}</span>
          <span
            className="text-xs text-center leading-tight font-medium transition-colors group-hover:text-[var(--accent)]"
            style={{ color: "var(--muted)" }}
          >
            {CATEGORY_LABELS[cat]}
          </span>
        </Link>
      ))}
    </div>
  );
}
