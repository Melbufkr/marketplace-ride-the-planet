import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Recuperar contraseña — RTP Market" };

export default function RecuperarContrasenaPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-4xl mb-2 text-center" style={{ color: "var(--text)" }}>
          Recuperar contraseña
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: "var(--dim)" }}>
          Te enviamos un link para resetearla
        </p>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
