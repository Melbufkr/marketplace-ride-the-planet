"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface UpdateProfileState {
  error?: string;
  success?: boolean;
}

export async function updateProfileAction(
  _prev: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const firstName = formData.get("first_name")?.toString().trim();
  const lastName  = formData.get("last_name")?.toString().trim();
  const countryCode = formData.get("whatsapp_country_code")?.toString().trim();
  const number    = formData.get("whatsapp_number")?.toString().trim();

  if (!firstName || !lastName) return { error: "Nombre y apellido son requeridos" };
  if (!countryCode || !number)  return { error: "WhatsApp es requerido" };
  if (!/^\d{6,15}$/.test(number)) return { error: "Número de WhatsApp inválido" };

  const { error } = await supabase
    .from("users")
    .update({
      first_name: firstName,
      last_name: lastName,
      whatsapp_country_code: countryCode,
      whatsapp_number: number,
    })
    .eq("id", user.id);

  if (error) return { error: "Error al guardar los cambios" };

  revalidatePath("/perfil");
  return { success: true };
}
