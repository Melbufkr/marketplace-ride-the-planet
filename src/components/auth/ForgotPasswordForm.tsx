"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/recuperar-contrasena/nueva`,
    });

    setLoading(false);
    if (error) {
      setError("No se pudo enviar el email. Verificá la dirección.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div
        className="rounded-2xl border p-6 text-center"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <p className="text-3xl mb-3">📬</p>
        <p className="font-medium mb-1" style={{ color: "var(--text)" }}>
          Email enviado
        </p>
        <p className="text-sm" style={{ color: "var(--dim)" }}>
          Revisá tu bandeja de entrada y seguí el link para crear una nueva contraseña.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        type="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        required
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" loading={loading}>
        Enviar link de recuperación
      </Button>
      <Link
        href="/login"
        className="text-sm text-center"
        style={{ color: "var(--dim)" }}
      >
        Volver al login
      </Link>
    </form>
  );
}
