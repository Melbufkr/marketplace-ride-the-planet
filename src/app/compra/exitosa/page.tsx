import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Compra exitosa — RTP Market" };

export default function CompraExitosaPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center flex flex-col items-center gap-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
          style={{ backgroundColor: "rgba(34,197,94,0.12)" }}
        >
          ✅
        </div>

        <div>
          <h1 className="font-display text-4xl mb-2" style={{ color: "var(--text)" }}>
            ¡Compra exitosa!
          </h1>
          <p style={{ color: "var(--muted)" }}>
            Tu pago fue procesado. Te enviamos un email con los datos del vendedor
            para coordinar la entrega.
          </p>
        </div>

        <div
          className="w-full rounded-2xl border p-4 text-sm text-left"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg2)", color: "var(--dim)" }}
        >
          <p>📧 Revisá tu casilla de email — te enviamos los datos de contacto del vendedor.</p>
        </div>

        <div className="flex gap-3">
          <Link href="/mis-compras">
            <Button variant="secondary">Ver mis compras</Button>
          </Link>
          <Link href="/publicaciones">
            <Button>Seguir explorando</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
