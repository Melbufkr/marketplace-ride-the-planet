import { RegisterForm } from "@/components/auth/RegisterForm";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Registrarse — RTP Market",
};

export default function RegistroPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1
            className="font-display text-4xl mb-2"
            style={{ color: "var(--text)" }}
          >
            Crear cuenta
          </h1>
          <p style={{ color: "var(--dim)" }} className="text-sm">
            Ya tenés cuenta?{" "}
            <Link
              href="/login"
              className="transition-colors"
              style={{ color: "var(--accent)" }}
            >
              Ingresá acá
            </Link>
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border p-6 sm:p-8"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
