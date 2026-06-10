"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { CATEGORY_LABELS, CONDITION_LABELS, PROVINCES } from "@/lib/listings-helpers";
import type { ListingCategory, ListingCondition, PriceType } from "@/types/database";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ListingCategory[];
const CONDITIONS = ["nuevo", "muy_bueno", "bueno", "aceptable"] as ListingCondition[];

const SORT_OPTIONS = [
  { value: "newest",     label: "Más recientes" },
  { value: "relevance",  label: "Destacados" },
  { value: "price_asc",  label: "Menor precio" },
  { value: "price_desc", label: "Mayor precio" },
];

export function FilterPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Leer valores actuales
  const activeCategories = searchParams.getAll("category") as ListingCategory[];
  const activeConditions = searchParams.getAll("condition") as ListingCondition[];
  const activePriceType = (searchParams.get("price_type") ?? "") as PriceType | "";
  const sort = searchParams.get("sort") ?? "newest";
  const location = searchParams.get("location") ?? "";
  const priceMin = searchParams.get("price_min") ?? "";
  const priceMax = searchParams.get("price_max") ?? "";

  const updateParams = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Reset page on filter change
      params.delete("page");

      for (const [key, value] of Object.entries(updates)) {
        params.delete(key);
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else if (value !== null && value !== "") {
          params.set(key, value);
        }
      }

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams]
  );

  function toggleCategory(cat: ListingCategory) {
    const next = activeCategories.includes(cat)
      ? activeCategories.filter((c) => c !== cat)
      : [...activeCategories, cat];
    updateParams({ category: next });
  }

  function toggleCondition(cond: ListingCondition) {
    const next = activeConditions.includes(cond)
      ? activeConditions.filter((c) => c !== cond)
      : [...activeConditions, cond];
    updateParams({ condition: next });
  }

  const labelStyle = { color: "var(--muted)" };
  const chipBase =
    "px-3 py-1 text-xs rounded-full border cursor-pointer transition-all select-none";

  function chipStyle(active: boolean) {
    return {
      backgroundColor: active ? "var(--blue)" : "var(--bg2)",
      borderColor: active ? "var(--blue)" : "var(--border)",
      color: active ? "#fff" : "var(--muted)",
    };
  }

  return (
    <aside className="flex flex-col gap-6 text-sm">
      {/* Ordenar */}
      <div>
        <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={labelStyle}>
          Ordenar por
        </p>
        <select
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
          style={{
            backgroundColor: "var(--bg2)",
            borderColor: "var(--border)",
            color: "var(--text)",
          }}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Categorías */}
      <div>
        <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={labelStyle}>
          Categoría
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={chipBase}
              style={chipStyle(activeCategories.includes(cat))}
              onClick={() => toggleCategory(cat)}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Estado del equipo */}
      <div>
        <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={labelStyle}>
          Estado
        </p>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((cond) => (
            <button
              key={cond}
              className={chipBase}
              style={chipStyle(activeConditions.includes(cond))}
              onClick={() => toggleCondition(cond)}
            >
              {CONDITION_LABELS[cond]}
            </button>
          ))}
        </div>
      </div>

      {/* Modalidad */}
      <div>
        <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={labelStyle}>
          Modalidad
        </p>
        <div className="flex gap-2">
          {(["fixed", "negotiable", ""] as const).map((val) => (
            <button
              key={val}
              className={chipBase}
              style={chipStyle(activePriceType === val)}
              onClick={() => updateParams({ price_type: val || null })}
            >
              {val === "fixed" ? "Precio fijo" : val === "negotiable" ? "A convenir" : "Todos"}
            </button>
          ))}
        </div>
      </div>

      {/* Rango de precio */}
      <div>
        <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={labelStyle}>
          Precio (ARS)
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Mínimo"
            value={priceMin}
            onChange={(e) => updateParams({ price_min: e.target.value || null })}
            className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
            style={{ backgroundColor: "var(--bg2)", borderColor: "var(--border)", color: "var(--text)" }}
          />
          <span style={{ color: "var(--dim)" }}>–</span>
          <input
            type="number"
            placeholder="Máximo"
            value={priceMax}
            onChange={(e) => updateParams({ price_max: e.target.value || null })}
            className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
            style={{ backgroundColor: "var(--bg2)", borderColor: "var(--border)", color: "var(--text)" }}
          />
        </div>
      </div>

      {/* Provincia */}
      <div>
        <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={labelStyle}>
          Provincia
        </p>
        <select
          value={location}
          onChange={(e) => updateParams({ location: e.target.value || null })}
          className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
          style={{ backgroundColor: "var(--bg2)", borderColor: "var(--border)", color: location ? "var(--text)" : "var(--dim)" }}
        >
          <option value="">Todas las provincias</option>
          {PROVINCES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Limpiar filtros */}
      {(activeCategories.length > 0 ||
        activeConditions.length > 0 ||
        activePriceType ||
        location ||
        priceMin ||
        priceMax) && (
        <button
          onClick={() =>
            router.push(pathname)
          }
          className="text-xs underline text-left transition-colors"
          style={{ color: "var(--dim)" }}
        >
          Limpiar filtros
        </button>
      )}
    </aside>
  );
}
