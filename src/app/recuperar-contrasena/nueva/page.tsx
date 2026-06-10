import { NewPasswordForm } from "@/components/auth/NewPasswordForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nueva contraseña — RTP Market" };

export default function NuevaContrasenaPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-4xl mb-2 text-center" style={{ color: "var(--text)" }}>
          Nueva contraseña
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: "var(--dim)" }}>
          Elegí una contraseña nueva para tu cuenta
        </p>
        <NewPasswordForm />
      </div>
    </div>
  );
}
