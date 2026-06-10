"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

type VerificationStatus = "none" | "pending" | "approved" | "rejected";

interface DniVerificationCardProps {
  status: VerificationStatus;
  reviewerNotes?: string | null;
}

const STATUS_CONFIG: Record<VerificationStatus, { icon: string; label: string; color: string; bg: string }> = {
  none:     { icon: "📋", label: "Sin verificar",  color: "var(--dim)",   bg: "var(--bg2)" },
  pending:  { icon: "⏳", label: "En revisión",    color: "#fbbf24",      bg: "rgba(251,191,36,0.08)" },
  approved: { icon: "✅", label: "DNI verificado", color: "#22c55e",      bg: "rgba(34,197,94,0.08)" },
  rejected: { icon: "❌", label: "Rechazado",      color: "#f87171",      bg: "rgba(248,113,113,0.08)" },
};

export function DniVerificationCard({ status, reviewerNotes }: DniVerificationCardProps) {
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack]   = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef  = useRef<HTMLInputElement>(null);

  const cfg = STATUS_CONFIG[submitted ? "pending" : status];
  const canUpload = status === "none" || status === "rejected";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!front || !back) { setError("Seleccioná ambas fotos"); return; }
    setLoading(true);
    setError("");

    const fd = new FormData();
    fd.append("front", front);
    fd.append("back", back);

    const res = await fetch("/api/dni/upload", { method: "POST", body: fd });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Error al subir las fotos"); return; }
    setSubmitted(true);
  }

  return (
    <div
      className="rounded-2xl border p-6 flex flex-col gap-4"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-medium" style={{ color: "var(--text)" }}>
          Verificación de identidad
        </h2>
        <span
          className="text-xs px-3 py-1 rounded-full font-medium"
          style={{ backgroundColor: cfg.bg, color: cfg.color }}
        >
          {cfg.icon} {cfg.label}
        </span>
      </div>

      <p className="text-sm" style={{ color: "var(--dim)" }}>
        Para publicar y comprar en RTP Market necesitás verificar tu identidad subiendo una foto del frente y dorso de tu DNI.
        Lo revisamos manualmente en menos de 48 hs.
      </p>

      {status === "rejected" && reviewerNotes && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(248,113,113,0.08)", color: "#f87171" }}
        >
          <p className="font-medium mb-0.5">Motivo del rechazo:</p>
          <p>{reviewerNotes}</p>
        </div>
      )}

      {status === "approved" && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(34,197,94,0.08)", color: "#22c55e" }}
        >
          Tu identidad fue verificada. Podés publicar y comprar sin restricciones.
        </div>
      )}

      {status === "pending" && !submitted && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(251,191,36,0.08)", color: "#fbbf24" }}
        >
          Tus documentos están siendo revisados. Te avisamos cuando esté listo.
        </div>
      )}

      {submitted && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(251,191,36,0.08)", color: "#fbbf24" }}
        >
          ⏳ Documentos enviados. Te avisamos cuando estén revisados.
        </div>
      )}

      {canUpload && !submitted && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Frente */}
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>
              Frente del DNI
            </p>
            <input
              ref={frontRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
              className="hidden"
              onChange={(e) => setFront(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => frontRef.current?.click()}
              className="w-full rounded-xl border-2 border-dashed py-6 text-sm transition-colors hover:border-[var(--accent)] text-center"
              style={{ borderColor: front ? "var(--accent)" : "var(--border)", color: "var(--dim)" }}
            >
              {front ? (
                <span style={{ color: "var(--accent)" }}>✅ {front.name}</span>
              ) : (
                "Tocá para seleccionar foto del frente"
              )}
            </button>
          </div>

          {/* Dorso */}
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>
              Dorso del DNI
            </p>
            <input
              ref={backRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
              className="hidden"
              onChange={(e) => setBack(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => backRef.current?.click()}
              className="w-full rounded-xl border-2 border-dashed py-6 text-sm transition-colors hover:border-[var(--accent)] text-center"
              style={{ borderColor: back ? "var(--accent)" : "var(--border)", color: "var(--dim)" }}
            >
              {back ? (
                <span style={{ color: "var(--accent)" }}>✅ {back.name}</span>
              ) : (
                "Tocá para seleccionar foto del dorso"
              )}
            </button>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button type="submit" loading={loading}>
            Enviar para verificación
          </Button>
        </form>
      )}
    </div>
  );
}
