import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ListingForm } from "@/components/listings/ListingForm";
import type { Metadata } from "next";
import type { ListingFormData, MediaItem } from "@/app/actions/listings";
import type { ListingCategory, ListingCondition, PriceType } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Editar publicación — RTP Market" };

export default async function EditarListingPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/login?redirect=/publicaciones/${id}/editar`);

  const { data: listing } = await supabase
    .from("listings")
    .select(`*, listing_media ( id, url, media_type, order )`)
    .eq("id", id)
    .eq("user_id", user.id)
    .neq("status", "deleted")
    .single();

  if (!listing) notFound();

  const defaultValues: Partial<ListingFormData> = {
    title: listing.title,
    category: listing.category as ListingCategory,
    description: listing.description,
    price: listing.price,
    price_type: listing.price_type as PriceType,
    condition: listing.condition as ListingCondition,
    location: listing.location,
    brand: listing.brand ?? "",
    size: listing.size ?? "",
    seasons_used: listing.seasons_used ?? undefined,
    media: listing.listing_media
      .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
      .map((m: { url: string; media_type: string }) => ({
        url: m.url,
        path: "",          // path solo se necesita para borrar en Storage; ya existe
        media_type: m.media_type as "photo" | "video",
      })) as MediaItem[],
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-4xl mb-2" style={{ color: "var(--text)" }}>
          Editar publicación
        </h1>
      </div>
      <div
        className="rounded-2xl border p-6 sm:p-8"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <ListingForm listingId={id} defaultValues={defaultValues} />
      </div>
    </div>
  );
}
