import Link from "next/link";
import type { ReactNode } from "react";
import { createServiceClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const service = createServiceClient();
  const { count: pendingDni } = await service
    .from("dni_verifications")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const NAV_ITEMS = [
    { href: "/admin",                label: "Dashboard",    icon: "📊", badge: null },
    { href: "/admin/usuarios",       label: "Usuarios",     icon: "👤", badge: null },
    { href: "/admin/publicaciones",  label: "Publicaciones",icon: "🏔️", badge: null },
    { href: "/admin/transacciones",  label: "Transacciones",icon: "💳", badge: null },
    { href: "/admin/verificaciones", label: "DNI",          icon: "🪪", badge: pendingDni ?? 0 },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--bg)" }}>
      {/* Sidebar */}
      <aside
        className="w-56 shrink-0 border-r flex flex-col py-8 px-4 gap-1"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
      >
        <div className="mb-6 px-2">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-0.5"
            style={{ color: "var(--dim)" }}
          >
            Admin
          </p>
          <p className="font-display text-lg" style={{ color: "var(--accent)" }}>
            RTP Market
          </p>
        </div>

        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-[var(--bg2)]"
            style={{ color: "var(--text)" }}
          >
            <span>{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.badge > 0 && (
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
                style={{ backgroundColor: "#f87171", color: "#fff" }}
              >
                {item.badge}
              </span>
            )}
          </Link>
        ))}

        <div className="mt-auto pt-6 border-t" style={{ borderColor: "var(--border)" }}>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-[var(--bg2)]"
            style={{ color: "var(--dim)" }}
          >
            <span>←</span>
            Volver al sitio
          </Link>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
