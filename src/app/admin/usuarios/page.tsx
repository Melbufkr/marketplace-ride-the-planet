import { createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Usuarios — Admin RTP" };

export default async function AdminUsuariosPage() {
  const supabase = createServiceClient();

  const { data: users } = await supabase
    .from("users")
    .select("id, email, first_name, last_name, reputation_score, is_admin, created_at")
    .order("created_at", { ascending: false });

  // Contar publicaciones por usuario
  const { data: listingCounts } = await supabase
    .from("listings")
    .select("user_id")
    .neq("status", "deleted");

  const countByUser: Record<string, number> = {};
  for (const l of listingCounts ?? []) {
    countByUser[l.user_id] = (countByUser[l.user_id] ?? 0) + 1;
  }

  return (
    <div className="p-8">
      <h1 className="font-display text-4xl mb-2" style={{ color: "var(--text)" }}>
        Usuarios
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--dim)" }}>
        {users?.length ?? 0} registrados en total
      </p>

      <div
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              className="border-b"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg2)" }}
            >
              {["Usuario", "Email", "Publicaciones", "Reputación", "Registro", ""].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left font-semibold text-xs uppercase tracking-wider"
                  style={{ color: "var(--dim)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u) => (
              <tr
                key={u.id}
                className="border-b last:border-0 hover:bg-[var(--bg2)] transition-colors"
                style={{ borderColor: "var(--border)" }}
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <p className="font-medium" style={{ color: "var(--text)" }}>
                      {u.first_name} {u.last_name}
                    </p>
                    {u.is_admin && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: "rgba(167,139,250,0.15)", color: "#a78bfa" }}
                      >
                        admin
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3" style={{ color: "var(--dim)" }}>
                  {u.email}
                </td>
                <td className="px-5 py-3" style={{ color: "var(--text)" }}>
                  {countByUser[u.id] ?? 0}
                </td>
                <td className="px-5 py-3" style={{ color: "var(--accent)" }}>
                  ★ {Number(u.reputation_score).toFixed(1)}
                </td>
                <td className="px-5 py-3" style={{ color: "var(--dim)" }}>
                  {new Date(u.created_at).toLocaleDateString("es-AR", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </td>
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/usuarios/${u.id}`}
                    className="text-xs underline"
                    style={{ color: "var(--accent)" }}
                  >
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
