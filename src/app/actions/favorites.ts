"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleFavorite(listingId: string): Promise<{ ok: boolean; favorited: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, favorited: false };

  // ¿Existe el favorito?
  const { data: existing } = await supabase
    .from("favorites")
    .select("listing_id")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("listing_id", listingId);
    revalidatePath("/mis-favoritos");
    return { ok: true, favorited: false };
  } else {
    await supabase
      .from("favorites")
      .insert({ user_id: user.id, listing_id: listingId });
    revalidatePath("/mis-favoritos");
    return { ok: true, favorited: true };
  }
}
