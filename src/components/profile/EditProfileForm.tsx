"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const COUNTRY_CODES = [
  { code: "54",  label: "🇦🇷 +54 Argentina" },
  { code: "56",  label: "🇨🇱 +56 Chile" },
  { code: "598", label: "🇺🇾 +598 Uruguay" },
  { code: "55",  label: "🇧🇷 +55 Brasil" },
  { code: "1",   label: "🇺🇸 +1 USA/Canadá" },
];

interface EditProfileFormProps {
  firstName: string;
  lastName: string;
  whatsappCountryCode: string;
  whatsappNumber: string;
}

export function EditProfileForm({
  firstName,
  lastName,
  whatsappCountryCode,
  whatsappNumber,
}: EditProfileFormProps) {
  const [state, action, pending] = useActionState(updateProfileAction, {});

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          name="first_name"
          label="Nombre"
          defaultValue={firstName}
          required
        />
        <Input
          name="last_name"
          label="Apellido"
          defaultValue={lastName}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>
          WhatsApp
        </label>
        <div className="flex gap-2">
          <select
            name="whatsapp_country_code"
            defaultValue={whatsappCountryCode}
            className="px-3 py-2.5 rounded-xl border text-sm outline-none"
            style={{
              backgroundColor: "var(--bg2)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
          <Input
            name="whatsapp_number"
            placeholder="Número sin 0 ni 15"
            defaultValue={whatsappNumber}
            type="tel"
            className="flex-1"
            required
          />
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-red-400">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm" style={{ color: "#22c55e" }}>✅ Perfil actualizado</p>
      )}

      <Button type="submit" loading={pending} size="sm">
        Guardar cambios
      </Button>
    </form>
  );
}
