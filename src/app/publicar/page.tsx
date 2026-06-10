import { ListingForm } from "@/components/listings/ListingForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publicar equipo — RTP Market",
};

export default async function PublicarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/publicar");

  const { data: profile } = await supabase
    .from("users")
    .select("dni_verified")
    .eq("id", user.id)
    .single();

  if (!profile?.dni_verified) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-5xl mb-4">🪪</p>
        <h1 className="font-display text-3xl mb-3" style={{ color: "var(--text)" }}>
          Verificá tu identidad primero
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--dim)" }}>
          Para publicar equipo en RTP Market necesitás tener el DNI verificado.
          Una vez que subas las fotos lo revisamos en menos de 48 hs.
        </p>
        <Link
          href="/perfil#dni"
          className="inline-flex px-6 py-2.5 rounded-full text-sm font-medium"
          style={{ backgroundColor: "var(--blue)", color: "#fff" }}
        >
          Verificar DNI
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-4xl mb-2" style={{ color: "var(--text)" }}>
          Publicar equipo
        </h1>
        <p className="text-sm" style={{ color: "var(--dim)" }}>
          Completá los datos de tu equipo. Cuanto más detallada sea la publicación, más rápido vendés.
        </p>
      </div>

      <div
        className="rounded-2xl border p-6 sm:p-8"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <ListingForm />
      </div>
    </div>
  );
}
