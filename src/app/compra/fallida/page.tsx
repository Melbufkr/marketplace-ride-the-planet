import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pago no completado — RTP Market" };

export default function CompraFallidaPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center flex flex-col items-center gap-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
          style={{ backgroundColor: "rgba(239,68,68,0.12)" }}
        >
          ❌
        </div>

        <div>
          <h1 className="font-display text-4xl mb-2" style={{ color: "var(--text)" }}>
            Pago no completado
          </h1>
          <p style={{ color: "var(--muted)" }}>
            Tu pago no fue procesado. No se realizó ningún cargo. Podés intentarlo
            de nuevo cuando quieras.
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/publicaciones">
            <Button variant="secondary">Explorar equipo</Button>
          </Link>
          <Link href="/">
            <Button>Ir al inicio</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
