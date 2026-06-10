"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface Verification {
  id: string;
  status: string;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  front_url: string;
  back_url: string;
  frontSignedUrl: string | null;
  backSignedUrl: string | null;
  users: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    dni: string;
  } | null;
}

export function DniReviewCard({ verification: v }: { verification: Verification }) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);
  const [expanded, setExpanded] = useState<"front" | "back" | null>(null);

  const isPending = v.status === "pending" && !done;

  async function handleAction(action: "approve" | "reject") {
    if (action === "reject" && !notes.trim()) {
      alert("Ingresá el motivo del rechazo");
      return;
    }
    setLoading(action);
    const res = await fetch(`/api/admin/dni/${v.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, notes: notes || null }),
    });
    setLoading(null);
    if (res.ok) setDone(action === "approve" ? "approved" : "rejected");
    else alert("Error al procesar la solicitud");
  }

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-4"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium" style={{ color: "var(--text)" }}>
            {v.users?.first_name} {v.users?.last_name}
          </p>
          <p className="text-xs" style={{ color: "var(--dim)" }}>{v.users?.email}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--dim)" }}>
            DNI: {v.users?.dni}
          </p>
        </div>
        <div className="text-right">
          <Link
            href={`/admin/usuarios/${v.users?.id}`}
            className="text-xs underline"
            style={{ color: "var(--accent)" }}
          >
            Ver usuario
          </Link>
          <p className="text-xs mt-1" style={{ color: "var(--dim)" }}>
            {new Date(v.created_at).toLocaleDateString("es-AR", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Fotos */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Frente", url: v.frontSignedUrl, key: "front" as const },
          { label: "Dorso",  url: v.backSignedUrl,  key: "back"  as const },
        ].map(({ label, url, key }) => (
          <div key={key}>
            <p className="text-xs font-medium mb-1.5" style={{ color: "var(--dim)" }}>{label}</p>
            {url ? (
              <button
                onClick={() => setExpanded(expanded === key ? null : key)}
                className="relative w-full rounded-xl overflow-hidden border transition-all"
                style={{
                  borderColor: "var(--border)",
                  aspectRatio: "4/3",
                  backgroundColor: "var(--bg2)",
                }}
              >
                <Image
                  src={url}
                  alt={`DNI ${label}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 300px"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
                >
                  <span className="text-white text-xs font-medium">Ver completo</span>
                </div>
              </button>
            ) : (
              <div
                className="w-full rounded-xl border flex items-center justify-center text-sm"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--bg2)", aspectRatio: "4/3", color: "var(--dim)" }}
              >
                Sin foto
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Imagen expandida */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
          onClick={() => setExpanded(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh] w-full">
            <Image
              src={(expanded === "front" ? v.frontSignedUrl : v.backSignedUrl) ?? ""}
              alt="DNI"
              width={800}
              height={600}
              className="object-contain rounded-xl"
              style={{ maxHeight: "90vh", width: "100%", height: "auto" }}
            />
          </div>
        </div>
      )}

      {/* Estado ya procesado */}
      {(done || v.status !== "pending") && (
        <div
          className="rounded-xl px-4 py-3 text-sm text-center font-medium"
          style={{
            backgroundColor: (done ?? v.status) === "approved" ? "rgba(34,197,94,0.1)" : "rgba(248,113,113,0.1)",
            color: (done ?? v.status) === "approved" ? "#22c55e" : "#f87171",
          }}
        >
          {(done ?? v.status) === "approved" ? "✅ Aprobado" : "❌ Rechazado"}
          {(v.reviewer_notes || notes) && (
            <p className="text-xs mt-1 font-normal opacity-80">{v.reviewer_notes ?? notes}</p>
          )}
        </div>
      )}

      {/* Acciones (solo si pending) */}
      {isPending && (
        <div className="flex flex-col gap-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Nota (obligatorio si rechazás, opcional si aprobás)..."
            className="w-full px-4 py-2.5 text-sm rounded-xl border outline-none resize-none placeholder:text-[var(--dim)]"
            style={{ backgroundColor: "var(--bg2)", color: "var(--text)", borderColor: "var(--border)" }}
          />
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="ghost"
              onClick={() => handleAction("reject")}
              loading={loading === "reject"}
            >
              ❌ Rechazar
            </Button>
            <Button
              variant="primary"
              onClick={() => handleAction("approve")}
              loading={loading === "approve"}
            >
              ✅ Aprobar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
