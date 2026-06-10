import { LoginForm } from "@/components/auth/LoginForm";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ingresar — RTP Market",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1
            className="font-display text-4xl mb-2"
            style={{ color: "var(--text)" }}
          >
            Bienvenido
          </h1>
          <p style={{ color: "var(--dim)" }} className="text-sm">
            No tenés cuenta?{" "}
            <Link
              href="/registro"
              className="transition-colors"
              style={{ color: "var(--accent)" }}
            >
              Registrate gratis
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
          <LoginForm searchParams={searchParams} />
        </div>
      </div>
    </div>
  );
}
