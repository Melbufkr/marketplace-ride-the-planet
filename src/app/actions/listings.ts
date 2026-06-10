"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type {
  ListingCategory,
  ListingCondition,
  PriceType,
} from "@/types/database";

// ─── Tipos ───────────────────────────────────────────────

export interface MediaItem {
  url: string;
  path: string;
  media_type: "photo" | "video";
}

export interface ListingFormData {
  title: string;
  category: ListingCategory;
  description: string;
  price: number;
  price_type: PriceType;
  condition: ListingCondition;
  location: string;
  brand?: string;
  size?: string;
  seasons_used?: number;
  media: MediaItem[];
}

export interface ListingActionError {
  field?: string;
  message: string;
}

// ─── Validación ──────────────────────────────────────────

function validateListing(data: ListingFormData): ListingActionError | null {
  if (!data.title?.trim()) return { field: "title", message: "Requerido" };
  if (!data.category) return { field: "category", message: "Requerido" };
  if (!data.description?.trim()) return { field: "description", message: "Requerido" };
  if (!data.price || data.price <= 0) return { field: "price", message: "El precio debe ser mayor a 0" };
  if (!data.price_type) return { field: "price_type", message: "Requerido" };
  if (!data.condition) return { field: "condition", message: "Requerido" };
  if (!data.location?.trim()) return { field: "location", message: "Requerido" };
  const photos = data.media.filter((m) => m.media_type === "photo");
  if (photos.length === 0) return { field: "media", message: "Necesitás al menos 1 foto" };
  if (photos.length > 5) return { field: "media", message: "Máximo 5 fotos" };
  const videos = data.media.filter((m) => m.media_type === "video");
  if (videos.length > 1) return { field: "media", message: "Máximo 1 video" };
  return null;
}

// ─── Crear listing ───────────────────────────────────────

export async function createListingAction(
  data: ListingFormData
): Promise<{ error: ListingActionError } | void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { message: "No autorizado" } };

  const validationError = validateListing(data);
  if (validationError) return { error: validationError };

  // Insertar listing
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .insert({
      user_id: user.id,
      title: data.title.trim(),
      category: data.category,
      description: data.description.trim(),
      price: data.price,
      price_type: data.price_type,
      condition: data.condition,
      location: data.location.trim(),
      brand: data.brand?.trim() || null,
      size: data.size?.trim() || null,
      seasons_used: data.seasons_used ?? null,
    })
    .select("id")
    .single();

  if (listingError || !listing) {
    console.error("[createListing]", listingError?.message);
    return { error: { message: "Error al crear la publicación" } };
  }

  // Insertar media
  const mediaRows = data.media.map((m, i) => ({
    listing_id: listing.id,
    url: m.url,
    media_type: m.media_type,
    order: i,
  }));

  const { error: mediaError } = await supabase
    .from("listing_media")
    .insert(mediaRows);

  if (mediaError) {
    console.error("[createListing media]", mediaError.message);
    // No bloqueamos — el listing se creó igual, la foto puede reintentarse
  }

  // Recalcular relevance_score ahora que tiene fotos
  await createServiceClient().rpc("calculate_relevance_score", {
    listing_id: listing.id,
  });

  redirect(`/publicaciones/${listing.id}`);
}

// ─── Actualizar listing ──────────────────────────────────

export async function updateListingAction(
  id: string,
  data: ListingFormData
): Promise<{ error: ListingActionError } | void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { message: "No autorizado" } };

  const validationError = validateListing(data);
  if (validationError) return { error: validationError };

  // Verificar propiedad
  const { data: existing } = await supabase
    .from("listings")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!existing || existing.user_id !== user.id) {
    return { error: { message: "No autorizado" } };
  }

  const { error: updateError } = await supabase
    .from("listings")
    .update({
      title: data.title.trim(),
      category: data.category,
      description: data.description.trim(),
      price: data.price,
      price_type: data.price_type,
      condition: data.condition,
      location: data.location.trim(),
      brand: data.brand?.trim() || null,
      size: data.size?.trim() || null,
      seasons_used: data.seasons_used ?? null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) return { error: { message: "Error al actualizar" } };

  // Reemplazar media
  await supabase.from("listing_media").delete().eq("listing_id", id);
  const mediaRows = data.media.map((m, i) => ({
    listing_id: id,
    url: m.url,
    media_type: m.media_type,
    order: i,
  }));
  if (mediaRows.length) await supabase.from("listing_media").insert(mediaRows);

  redirect(`/publicaciones/${id}`);
}

// ─── Cambiar estado ──────────────────────────────────────

export async function toggleListingStatusAction(
  id: string,
  newStatus: "active" | "paused"
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { error } = await supabase
    .from("listings")
    .update({ status: newStatus })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return {};
}

// ─── Eliminar (soft delete) ──────────────────────────────

export async function deleteListingAction(
  id: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { error } = await supabase
    .from("listings")
    .update({ status: "deleted" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return {};
}

// ─── Mis publicaciones ───────────────────────────────────

export async function getMyListings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("listings")
    .select(`*, listing_media ( id, url, media_type, order )`)
    .eq("user_id", user.id)
    .neq("status", "deleted")
    .order("created_at", { ascending: false });

  return data ?? [];
}
