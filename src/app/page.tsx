import type { Metadata } from "next";
import Link from "next/link";
import { getFeaturedListings } from "@/lib/listings";
import { ListingCard } from "@/components/listings/ListingCard";
import { CategoryGrid } from "@/components/listings/CategoryGrid";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "RTP Market — Comprá y vendé equipo de ski y snowboard en Argentina",
  description:
    "El marketplace de ski y snowboard más grande de Argentina. Miles de publicaciones de esquís, tablas de snowboard, botas, fijaciones, ropa y accesorios. Vendedores verificados con DNI.",
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL ?? "https://market.ridetheplanet.ai",
  },
};

export default async function Home() {
  const featured = await getFeaturedListings(8);

  return (
    <>
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden px-4 py-24 sm:py-32 text-center"
        style={{ backgroundColor: "var(--bg)" }}
      >
        {/* Glow decorativo */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <div
            className="h-[500px] w-[700px] rounded-full opacity-10 blur-3xl"
            style={{ backgroundColor: "var(--blue)" }}
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-6">
          <span
            className="inline-block text-xs font-medium px-4 py-1.5 rounded-full border tracking-widest uppercase"
            style={{ borderColor: "var(--border)", color: "var(--accent)" }}
          >
            Argentina · Temporada 2025
          </span>

          <h1
            className="font-display text-5xl sm:text-7xl leading-none"
            style={{ color: "var(--text)" }}
          >
            Comprá y vendé
            <br />
            <span style={{ color: "var(--accent)" }}>equipo de nieve</span>
          </h1>

          <p className="text-lg max-w-xl" style={{ color: "var(--muted)" }}>
            El marketplace C2C de ski y snowboard. Encontrá equipo de calidad de
            otros riders o publicá lo que ya no usás.
          </p>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link href="/publicaciones">
              <Button size="lg">Explorar equipo</Button>
            </Link>
            <Link href="/registro">
              <Button variant="secondary" size="lg">
                Publicar gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Categorías ── */}
      <section className="px-4 sm:px-6 py-12 max-w-7xl mx-auto w-full">
        <h2
          className="font-display text-2xl mb-6"
          style={{ color: "var(--text)" }}
        >
          Categorías
        </h2>
        <CategoryGrid />
      </section>

      {/* ── Publicaciones destacadas ── */}
      <section className="px-4 sm:px-6 py-12 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl" style={{ color: "var(--text)" }}>
            Destacados
          </h2>
          <Link href="/publicaciones">
            <Button variant="ghost" size="sm">
              Ver todos →
            </Button>
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <EmptyFeatured />
        )}
      </section>

      {/* ── CTA registro ── */}
      <section
        className="mx-4 sm:mx-6 my-12 rounded-3xl px-8 py-14 text-center max-w-7xl lg:mx-auto"
        style={{
          backgroundColor: "var(--bg2)",
          border: "1px solid var(--border)",
        }}
      >
        <h2
          className="font-display text-4xl sm:text-5xl mb-4"
          style={{ color: "var(--text)" }}
        >
          ¿Tenés equipo para vender?
        </h2>
        <p className="mb-8 text-lg" style={{ color: "var(--muted)" }}>
          Publicar es gratis. Llegás a compradores que buscan exactamente lo que
          tenés.
        </p>
        <Link href="/registro">
          <Button size="lg">Crear mi cuenta gratis</Button>
        </Link>
      </section>
    </>
  );
}

function EmptyFeatured() {
  return (
    <div
      className="rounded-2xl border py-16 text-center"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg2)" }}
    >
      <p className="text-4xl mb-3">🏔️</p>
      <p className="font-medium mb-1" style={{ color: "var(--text)" }}>
        Todavía no hay publicaciones
      </p>
      <p className="text-sm" style={{ color: "var(--dim)" }}>
        Sé el primero en publicar tu equipo
      </p>
      <Link href="/registro" className="inline-block mt-5">
        <Button size="sm">Publicar equipo</Button>
      </Link>
    </div>
  );
}
