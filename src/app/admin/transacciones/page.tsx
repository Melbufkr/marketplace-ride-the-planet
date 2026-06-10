import { createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatPrice } from "@/lib/listings-helpers";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Transacciones — Admin RTP" };

const TX_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente", completed: "Completada", cancelled: "Cancelada",
};
const TX_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:   { bg: "rgba(251,191,36,0.12)",  text: "#fbbf24" },
  completed: { bg: "rgba(34,197,94,0.12)",   text: "#22c55e" },
  cancelled: { bg: "rgba(148,163,184,0.12)", text: "#94a3b8" },
};

export default async function AdminTransaccionesPage() {
  const supabase = createServiceClient();

  const { data: transactions } = await supabase
    .from("transactions")
    .select(`
      id, amount, seller_amount, platform_fee_amount, platform_fee_pct,
      status, mp_status, created_at, completed_at,
      listings ( id, title ),
      buyer:buyer_id ( id, first_name, last_name ),
      seller:seller_id ( id, first_name, last_name )
    `)
    .order("created_at", { ascending: false });

  const total = (transactions ?? [])
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-2">
        <h1 className="font-display text-4xl" style={{ color: "var(--text)" }}>
          Transacciones
        </h1>
        <div className="text-right">
          <p className="text-xs" style={{ color: "var(--dim)" }}>Volumen completado</p>
          <p className="font-display text-2xl" style={{ color: "#22c55e" }}>
            {formatPrice(total)}
          </p>
        </div>
      </div>
      <p className="text-sm mb-6" style={{ color: "var(--dim)" }}>
        {transactions?.length ?? 0} transacciones en total
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
              {["Publicación", "Comprador", "Vendedor", "Monto", "Fee", "Estado", "Fecha"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--dim)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(transactions ?? []).map((tx) => {
              const listing = (tx.listings as { id: string; title: string } | null);
              const buyer   = (tx.buyer as { id: string; first_name: string; last_name: string } | null);
              const seller  = (tx.seller as { id: string; first_name: string; last_name: string } | null);
              const statusStyle = TX_STATUS_COLORS[tx.status] ?? TX_STATUS_COLORS.pending;

              return (
                <tr
                  key={tx.id}
                  className="border-b last:border-0 hover:bg-[var(--bg2)] transition-colors"
                  style={{ borderColor: "var(--border)" }}
                >
                  <td className="px-4 py-3 max-w-[180px]">
                    {listing ? (
                      <Link
                        href={`/publicaciones/${listing.id}`}
                        className="text-sm hover:underline truncate block"
                        style={{ color: "var(--text)" }}
                        target="_blank"
                      >
                        {listing.title}
                      </Link>
                    ) : (
                      <span style={{ color: "var(--dim)" }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {buyer ? (
                      <Link
                        href={`/admin/usuarios/${buyer.id}`}
                        className="hover:underline"
                        style={{ color: "var(--text)" }}
                      >
                        {buyer.first_name} {buyer.last_name}
                      </Link>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {seller ? (
                      <Link
                        href={`/admin/usuarios/${seller.id}`}
                        className="hover:underline"
                        style={{ color: "var(--text)" }}
                      >
                        {seller.first_name} {seller.last_name}
                      </Link>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--accent)" }}>
                    {formatPrice(tx.amount)}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--dim)" }}>
                    {tx.platform_fee_pct}% ({formatPrice(tx.platform_fee_amount ?? 0)})
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                    >
                      {TX_STATUS_LABELS[tx.status] ?? tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--dim)" }}>
                    {new Date(tx.created_at).toLocaleDateString("es-AR", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
