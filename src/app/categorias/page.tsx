import { createClient } from "@/lib/supabase/server";
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/listings-helpers";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categorías — RTP Market",
  description: "Explorá esquís, tablas de snowboard, botas, ropa y más equipo de montaña.",
};

export default async function CategoriasPage() {
  const supabase = await createClient();

  // Contar publicaciones activas por categoría
  const { data } = await supabase
    .from("listings")
    .select("category")
    .eq("status", "active");

  const countByCategory: Record<string, number> = {};
  for (const row of data ?? []) {
    countByCategory[row.category] = (countByCategory[row.category] ?? 0) + 1;
  }

  const categories = Object.keys(CATEGORY_LABELS).map((key) => ({
    key,
    label: CATEGORY_LABELS[key],
    icon: CATEGORY_ICONS[key] ?? "📦",
    count: countByCategory[key] ?? 0,
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-4xl mb-2" style={{ color: "var(--text)" }}>
        Categorías
      </h1>
      <p className="text-sm mb-10" style={{ color: "var(--dim)" }}>
        Encontrá el equipo que buscás por tipo
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map(({ key, label, icon, count }) => (
          <Link
            key={key}
            href={`/publicaciones?category=${key}`}
            className="group rounded-2xl border p-5 flex flex-col items-center gap-3 text-center transition-all hover:border-[var(--accent)] hover:-translate-y-0.5"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <span className="text-4xl">{icon}</span>
            <div>
              <p
                className="font-medium text-sm group-hover:text-[var(--accent)] transition-colors"
                style={{ color: "var(--text)" }}
              >
                {label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--dim)" }}>
                {count} {count === 1 ? "publicación" : "publicaciones"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
