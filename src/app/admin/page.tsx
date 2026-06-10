import { createServiceClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — RTP Market" };

async function getStat(label: string, value: number, sub?: string) {
  return { label, value, sub };
}

export default async function AdminDashboard() {
  const supabase = createServiceClient();

  const [
    { count: totalUsers },
    { count: totalListings },
    { count: activeListings },
    { count: totalTransactions },
    { count: completedTransactions },
    { count: totalContacts },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("listings").select("*", { count: "exact", head: true }),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("transactions").select("*", { count: "exact", head: true }),
    supabase.from("transactions").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("contact_exchanges").select("*", { count: "exact", head: true }),
  ]);

  // Suma de transacciones completadas
  const { data: txData } = await supabase
    .from("transactions")
    .select("amount")
    .eq("status", "completed");

  const totalVolume = (txData ?? []).reduce((sum, t) => sum + Number(t.amount), 0);

  const stats = [
    { label: "Usuarios",          value: totalUsers ?? 0,        icon: "👤", color: "var(--blue)" },
    { label: "Publicaciones",     value: totalListings ?? 0,     icon: "🏔️", color: "var(--accent)",
      sub: `${activeListings ?? 0} activas` },
    { label: "Transacciones",     value: totalTransactions ?? 0, icon: "💳", color: "#a78bfa",
      sub: `${completedTransactions ?? 0} completadas` },
    { label: "Contactos",         value: totalContacts ?? 0,     icon: "📬", color: "#34d399" },
    { label: "Volumen total (ARS)",
      value: new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(totalVolume),
      icon: "💰", color: "#fbbf24", raw: true },
  ];

  return (
    <div className="p-8">
      <h1 className="font-display text-4xl mb-2" style={{ color: "var(--text)" }}>
        Dashboard
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--dim)" }}>
        Vista general de la plataforma
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border p-6 flex flex-col gap-2"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{s.icon}</span>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--dim)" }}>
                {s.label}
              </p>
            </div>
            <p className="font-display text-3xl" style={{ color: s.color }}>
              {s.raw ? s.value : s.value.toLocaleString("es-AR")}
            </p>
            {s.sub && (
              <p className="text-xs" style={{ color: "var(--dim)" }}>{s.sub}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
