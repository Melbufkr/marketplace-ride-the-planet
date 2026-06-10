"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";

export function NewPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const router = useRouter();

  // Supabase redirige con el token en el hash — la sesión se setea automáticamente
  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // Sesión lista, el usuario puede cambiar la contraseña
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError("Mínimo 8 caracteres"); return; }
    if (password !== confirm) { setError("Las contraseñas no coinciden"); return; }

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (error) { setError("Error al cambiar la contraseña. El link puede haber expirado."); return; }

    setDone(true);
    setTimeout(() => router.push("/perfil"), 2000);
  }

  if (done) {
    return (
      <div
        className="rounded-2xl border p-6 text-center"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <p className="text-3xl mb-3">✅</p>
        <p className="font-medium" style={{ color: "var(--text)" }}>
          Contraseña actualizada
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--dim)" }}>
          Redirigiendo...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        type="password"
        label="Nueva contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mínimo 8 caracteres"
        required
      />
      <Input
        type="password"
        label="Confirmar contraseña"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Repetí la contraseña"
        required
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" loading={loading}>
        Guardar nueva contraseña
      </Button>
    </form>
  );
}
