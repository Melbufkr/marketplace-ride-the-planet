"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { registerAction, type RegisterData, type AuthError } from "@/app/actions/auth";
import Link from "next/link";

const COUNTRY_CODES = [
  { value: "+54", label: "🇦🇷 +54 (Argentina)" },
  { value: "+55", label: "🇧🇷 +55 (Brasil)" },
  { value: "+56", label: "🇨🇱 +56 (Chile)" },
  { value: "+598", label: "🇺🇾 +598 (Uruguay)" },
  { value: "+1",  label: "🇺🇸 +1 (EE.UU.)" },
];

const INITIAL: RegisterData = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  whatsapp_country_code: "+54",
  whatsapp_number: "",
  dni: "",
  birth_date: "",
  terms_accepted: false,
};

export function RegisterForm() {
  const [form, setForm] = useState<RegisterData>(INITIAL);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterData | "_general", string>>>({});
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof RegisterData>(key: K, value: RegisterData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== confirmPassword) {
      setConfirmError("Las contraseñas no coinciden");
      return;
    }
    startTransition(async () => {
      const result = await registerAction(form);
      if (result?.error) {
        const err = result.error as AuthError;
        if (err.field) {
          setErrors({ [err.field]: err.message });
        } else {
          setErrors({ _general: err.message });
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* Nombre / Apellido */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nombre"
          value={form.first_name}
          onChange={(e) => set("first_name", e.target.value)}
          error={errors.first_name}
          autoComplete="given-name"
          required
        />
        <Input
          label="Apellido"
          value={form.last_name}
          onChange={(e) => set("last_name", e.target.value)}
          error={errors.last_name}
          autoComplete="family-name"
          required
        />
      </div>

      {/* Email */}
      <Input
        label="Email"
        type="email"
        value={form.email}
        onChange={(e) => set("email", e.target.value)}
        error={errors.email}
        autoComplete="email"
        inputMode="email"
        required
      />

      {/* Contraseña */}
      <Input
        label="Contraseña"
        type="password"
        value={form.password}
        onChange={(e) => { set("password", e.target.value); setConfirmError(""); }}
        error={errors.password}
        hint="Mínimo 8 caracteres"
        autoComplete="new-password"
        required
      />

      {/* Confirmar contraseña */}
      <Input
        label="Repetí la contraseña"
        type="password"
        value={confirmPassword}
        onChange={(e) => { setConfirmPassword(e.target.value); setConfirmError(""); }}
        error={confirmError}
        autoComplete="new-password"
        required
      />

      {/* WhatsApp */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>
          WhatsApp
        </label>
        <div className="flex gap-2">
          <select
            value={form.whatsapp_country_code}
            onChange={(e) => set("whatsapp_country_code", e.target.value)}
            className="shrink-0 px-3 py-2.5 text-sm rounded-xl border outline-none transition-colors cursor-pointer"
            style={{
              backgroundColor: "var(--bg2)",
              color: "var(--text)",
              borderColor: errors.whatsapp_country_code ? "rgb(239 68 68)" : "var(--border)",
            }}
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <Input
            value={form.whatsapp_number}
            onChange={(e) => set("whatsapp_number", e.target.value.replace(/\D/g, ""))}
            error={errors.whatsapp_number}
            placeholder="Número sin 0 ni 15"
            inputMode="tel"
            autoComplete="tel-local"
            required
          />
        </div>
      </div>

      {/* DNI */}
      <Input
        label="DNI"
        value={form.dni}
        onChange={(e) => set("dni", e.target.value.replace(/\D/g, ""))}
        error={errors.dni}
        hint="Mínimo 8 dígitos, solo números"
        inputMode="numeric"
        maxLength={12}
        required
      />

      {/* Fecha de nacimiento */}
      <Input
        label="Fecha de nacimiento"
        type="date"
        value={form.birth_date}
        onChange={(e) => set("birth_date", e.target.value)}
        error={errors.birth_date}
        hint="Debés tener al menos 18 años"
        max={new Date(
          new Date().setFullYear(new Date().getFullYear() - 18)
        )
          .toISOString()
          .slice(0, 10)}
        required
      />

      {/* Términos */}
      <Checkbox
        label={
          <>
            Acepto los{" "}
            <Link
              href="/terminos"
              target="_blank"
              className="underline transition-colors"
              style={{ color: "var(--accent)" }}
            >
              términos y condiciones
            </Link>
            {" "}y las{" "}
            <Link
              href="/privacidad"
              target="_blank"
              className="underline transition-colors"
              style={{ color: "var(--accent)" }}
            >
              políticas de privacidad
            </Link>
          </>
        }
        checked={form.terms_accepted}
        onChange={(e) => set("terms_accepted", e.target.checked)}
        error={errors.terms_accepted}
      />

      {/* Error general */}
      {errors._general && (
        <p className="text-sm text-red-400 text-center">{errors._general}</p>
      )}

      <Button type="submit" loading={isPending} fullWidth size="lg" className="mt-1">
        Crear cuenta
      </Button>
    </form>
  );
}
