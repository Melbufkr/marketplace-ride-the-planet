"use client";

import { use, useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { loginAction, type AuthError } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface LoginFormProps {
  searchParams: Promise<{ redirect?: string }>;
}

export function LoginForm({ searchParams }: LoginFormProps) {
  const { redirect } = use(searchParams);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Partial<Record<"email" | "password" | "_general", string>>>({});
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setEmailNotConfirmed(false);
    setResendStatus("idle");
    startTransition(async () => {
      const result = await loginAction({ email, password, redirectTo: redirect });
      if (result?.error) {
        const err = result.error as AuthError;
        if (err.field === "email") setErrors({ email: err.message });
        else if (err.field === "password") setErrors({ password: err.message });
        else if (err.message?.toLowerCase().includes("email not confirmed")) {
          setEmailNotConfirmed(true);
        } else {
          setErrors({ _general: err.message });
        }
      }
    });
  }

  async function handleResend() {
    setResendStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setResendStatus(error ? "error" : "sent");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
        error={errors.email}
        autoComplete="email"
        inputMode="email"
        required
      />

      <div>
        <Input
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
          error={errors.password}
          autoComplete="current-password"
          required
        />
        <div className="flex justify-end mt-1.5">
          <Link
            href="/recuperar-contrasena"
            className="text-xs"
            style={{ color: "var(--dim)" }}
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>

      {errors._general && (
        <p className="text-sm text-red-400 text-center">{errors._general}</p>
      )}

      {emailNotConfirmed && (
        <div
          className="rounded-xl border px-4 py-3 text-sm flex flex-col gap-2"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg2)" }}
        >
          <p style={{ color: "var(--text)" }}>
            Todavía no confirmaste tu email. Revisá tu bandeja de entrada (y la carpeta de spam).
          </p>
          {resendStatus === "sent" ? (
            <p className="text-green-400 text-xs">Email reenviado. Revisá tu bandeja.</p>
          ) : resendStatus === "error" ? (
            <p className="text-red-400 text-xs">No pudimos reenviar el email. Intentá de nuevo más tarde.</p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendStatus === "sending"}
              className="text-xs font-medium underline text-left disabled:opacity-50"
              style={{ color: "var(--accent)" }}
            >
              {resendStatus === "sending" ? "Enviando…" : "Reenviar email de confirmación"}
            </button>
          )}
        </div>
      )}

      <Button type="submit" loading={isPending} fullWidth size="lg" className="mt-1">
        Ingresar
      </Button>
    </form>
  );
}
