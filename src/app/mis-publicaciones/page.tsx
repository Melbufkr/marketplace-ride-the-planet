import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MyListingsClient } from "@/components/listings/MyListingsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mis publicaciones — RTP Market" };

export default async function MisPublicacionesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/mis-publicaciones");

  const { data: listings } = await supabase
    .from("listings")
    .select(`*, listing_media ( id, url, media_type, order )`)
    .eq("user_id", user.id)
    .neq("status", "deleted")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl" style={{ color: "var(--text)" }}>
          Mis publicaciones
        </h1>
        <a
          href="/publicar"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
          style={{ backgroundColor: "var(--blue)", color: "#fff" }}
        >
          + Nueva publicación
        </a>
      </div>

      <MyListingsClient listings={listings ?? []} />
    </div>
  );
}
