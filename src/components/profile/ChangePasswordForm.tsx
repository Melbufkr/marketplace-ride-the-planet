"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function ChangePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError("Mínimo 8 caracteres"); return; }
    if (password !== confirm) { setError("Las contraseñas no coinciden"); return; }

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (error) { setError("No se pudo cambiar la contraseña. Intentá de nuevo."); return; }

    setDone(true);
    setPassword("");
    setConfirm("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        type="password"
        label="Nueva contraseña"
        value={password}
        onChange={(e) => { setPassword(e.target.value); setDone(false); }}
        placeholder="Mínimo 8 caracteres"
        required
      />
      <Input
        type="password"
        label="Confirmar contraseña"
        value={confirm}
        onChange={(e) => { setConfirm(e.target.value); setDone(false); }}
        placeholder="Repetí la contraseña"
        required
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      {done && <p className="text-sm" style={{ color: "#22c55e" }}>✅ Contraseña actualizada</p>}
      <Button type="submit" loading={loading} size="sm">
        Cambiar contraseña
      </Button>
    </form>
  );
}
