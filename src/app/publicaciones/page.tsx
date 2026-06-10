import { Suspense } from "react";
import { getListings } from "@/lib/listings";
import { ListingCard } from "@/components/listings/ListingCard";
import { FilterPanel } from "@/components/listings/FilterPanel";
import { SearchBar } from "@/components/listings/SearchBar";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { ListingCategory, ListingCondition, PriceType } from "@/types/database";
import type { ListingsSort } from "@/lib/listings";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explorar equipo de ski y snowboard",
  description:
    "Buscá y filtrá entre miles de publicaciones de equipo de ski y snowboard en Argentina. Esquís, tablas, botas, fijaciones, ropa y más.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://market.ridetheplanet.ai"}/publicaciones`,
  },
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getString(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function getArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

async function ListingsGrid({ searchParams }: PageProps) {
  const params = await searchParams;

  // Favoritos del usuario actual (si está logueado)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let favoritedIds = new Set<string>();
  if (user) {
    const { data: favs } = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", user.id);
    favoritedIds = new Set((favs ?? []).map((f) => f.listing_id));
  }

  const filter = {
    category: getArray(params.category) as ListingCategory[],
    condition: getArray(params.condition) as ListingCondition[],
    price_type: (getString(params.price_type) as PriceType) || undefined,
    price_min: params.price_min ? Number(params.price_min) : undefined,
    price_max: params.price_max ? Number(params.price_max) : undefined,
    location: getString(params.location),
    search: getString(params.search),
  };

  const sort = (getString(params.sort) as ListingsSort) || "newest";
  const page = Number(getString(params.page) ?? "1");

  const { listings, total, totalPages } = await getListings({
    filter,
    sort,
    page,
    pageSize: 20,
  });

  if (listings.length === 0) {
    return (
      <div
        className="rounded-2xl border py-20 text-center col-span-full"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg2)" }}
      >
        <p className="text-4xl mb-3">🔍</p>
        <p className="font-medium mb-1" style={{ color: "var(--text)" }}>
          Sin resultados
        </p>
        <p className="text-sm" style={{ color: "var(--dim)" }}>
          Probá con otros filtros o{" "}
          <Link href="/publicaciones" style={{ color: "var(--accent)" }}>
            limpiá la búsqueda
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm" style={{ color: "var(--dim)" }}>
        {total} publicaciones encontradas
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            isFavorited={user ? favoritedIds.has(listing.id) : undefined}
          />
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {page > 1 && (
            <Link href={`?${buildPageUrl(params, page - 1)}`}>
              <Button variant="secondary" size="sm">← Anterior</Button>
            </Link>
          )}
          <span className="text-sm px-4" style={{ color: "var(--dim)" }}>
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`?${buildPageUrl(params, page + 1)}`}>
              <Button variant="secondary" size="sm">Siguiente →</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function buildPageUrl(
  params: Record<string, string | string[] | undefined>,
  page: number
): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (k === "page") continue;
    if (Array.isArray(v)) v.forEach((val) => p.append(k, val));
    else if (v) p.set(k, v);
  }
  p.set("page", String(page));
  return p.toString();
}

export default function PublicacionesPage({ searchParams }: PageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl mb-8" style={{ color: "var(--text)" }}>
        Explorar equipo
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filtros */}
        <div className="lg:w-64 shrink-0">
          <div
            className="rounded-2xl border p-5 sticky top-20"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <Suspense fallback={null}>
              <FilterPanel />
            </Suspense>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {/* Barra de búsqueda */}
          <div className="mb-5">
            <Suspense fallback={null}>
              <SearchBar />
            </Suspense>
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl aspect-square animate-pulse"
                    style={{ backgroundColor: "var(--bg2)" }}
                  />
                ))}
              </div>
            }
          >
            <ListingsGrid searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
