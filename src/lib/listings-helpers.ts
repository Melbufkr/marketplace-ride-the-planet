/**
 * Pure helpers — safe to import from both Server and Client Components.
 * No server-only imports (next/headers, supabase/server, etc.)
 */

export const CATEGORY_LABELS: Record<string, string> = {
  esquis: "Esquís",
  tabla_snowboard: "Tabla de snowboard",
  botas: "Botas",
  fijaciones: "Fijaciones",
  ropa: "Ropa",
  mochilas: "Mochilas",
  antiparras: "Antiparras",
  cascos: "Cascos",
  fundas_esquis: "Fundas esquís",
  fundas_snowboard: "Fundas snowboard",
  accesorios: "Accesorios",
};

export const CATEGORY_ICONS: Record<string, string> = {
  esquis: "🎿",
  tabla_snowboard: "🏂",
  botas: "👢",
  fijaciones: "🔩",
  ropa: "🧥",
  mochilas: "🎒",
  antiparras: "🥽",
  cascos: "⛑️",
  fundas_esquis: "📦",
  fundas_snowboard: "📦",
  accesorios: "🧤",
};

export const CONDITION_LABELS: Record<string, string> = {
  nuevo: "Nuevo",
  muy_bueno: "Muy bueno",
  bueno: "Bueno",
  aceptable: "Aceptable",
};

export const PROVINCES = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
] as const;

export type Province = (typeof PROVINCES)[number];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
}
