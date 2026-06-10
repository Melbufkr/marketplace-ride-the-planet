"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

// ─── Validaciones ───────────────────────────────────────

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isOver18(birthDateStr: string) {
  const birth = new Date(birthDateStr);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  return age > 18 || (age === 18 && m >= 0 && today.getDate() >= birth.getDate());
}

function isValidDni(dni: string) {
  return /^\d{8,}$/.test(dni.trim());
}

export type AuthError = { field?: string; message: string };

// ─── Registro ───────────────────────────────────────────

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  whatsapp_country_code: string;
  whatsapp_number: string;
  dni: string;
  birth_date: string;
  terms_accepted: boolean;
}

export async function registerAction(
  data: RegisterData
): Promise<{ error: AuthError } | void> {
  // Validaciones
  if (!data.first_name.trim()) return { error: { field: "first_name", message: "Requerido" } };
  if (!data.last_name.trim()) return { error: { field: "last_name", message: "Requerido" } };
  if (!isValidEmail(data.email)) return { error: { field: "email", message: "Email inválido" } };
  if (data.password.length < 8) return { error: { field: "password", message: "Mínimo 8 caracteres" } };
  if (!data.whatsapp_country_code) return { error: { field: "whatsapp_country_code", message: "Requerido" } };
  if (!data.whatsapp_number.trim()) return { error: { field: "whatsapp_number", message: "Requerido" } };
  if (!isValidDni(data.dni)) return { error: { field: "dni", message: "DNI inválido (mínimo 8 dígitos)" } };
  if (!data.birth_date) return { error: { field: "birth_date", message: "Requerido" } };
  if (!isOver18(data.birth_date)) return { error: { field: "birth_date", message: "Debés ser mayor de 18 años" } };
  if (!data.terms_accepted) return { error: { field: "terms_accepted", message: "Debés aceptar los términos" } };

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: data.email.trim().toLowerCase(),
    password: data.password,
    options: {
      data: {
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        whatsapp_country_code: data.whatsapp_country_code,
        whatsapp_number: data.whatsapp_number.trim(),
        dni: data.dni.trim(),
        birth_date: data.birth_date,
      },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: { field: "email", message: "Ya existe una cuenta con este email" } };
    }
    return { error: { message: error.message } };
  }

  redirect("/dashboard");
}

// ─── Login ──────────────────────────────────────────────

export interface LoginData {
  email: string;
  password: string;
  redirectTo?: string;
}

export async function loginAction(
  data: LoginData
): Promise<{ error: AuthError } | void> {
  if (!isValidEmail(data.email)) return { error: { field: "email", message: "Email inválido" } };
  if (!data.password) return { error: { field: "password", message: "Requerido" } };

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email.trim().toLowerCase(),
    password: data.password,
  });

  if (error) {
    return { error: { message: "Email o contraseña incorrectos" } };
  }

  redirect(data.redirectTo ?? "/dashboard");
}

// ─── Logout ─────────────────────────────────────────────

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
