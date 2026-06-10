import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MpConnectCard } from "@/components/profile/MpConnectCard";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { DniVerificationCard } from "@/components/profile/DniVerificationCard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mi perfil — RTP Market" };

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ mp_connected?: string; mp_error?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/perfil");

  const { data: profile } = await supabase
    .from("users")
    .select("first_name, last_name, email, whatsapp_country_code, whatsapp_number, reputation_score, mp_user_id, dni_verified, created_at")
    .eq("id", user.id)
    .single();

  const { data: dniVerification } = await supabase
    .from("dni_verifications")
    .select("status, reviewer_notes")
    .eq("user_id", user.id)
    .maybeSingle();

  const params = await searchParams;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-6">
      <h1 className="font-display text-4xl" style={{ color: "var(--text)" }}>
        Mi perfil
      </h1>

      {/* Datos personales */}
      <div
        className="rounded-2xl border p-6 flex flex-col gap-4"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center font-display text-2xl"
            style={{ backgroundColor: "var(--bg2)", color: "var(--accent)" }}
          >
            {profile?.first_name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="font-medium text-lg" style={{ color: "var(--text)" }}>
              {profile?.first_name} {profile?.last_name}
            </p>
            <p className="text-sm" style={{ color: "var(--dim)" }}>
              {profile?.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
          <div>
            <p className="text-xs mb-0.5" style={{ color: "var(--dim)" }}>WhatsApp</p>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              +{profile?.whatsapp_country_code} {profile?.whatsapp_number}
            </p>
          </div>
          <div>
            <p className="text-xs mb-0.5" style={{ color: "var(--dim)" }}>Reputación</p>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              ⭐ {Number(profile?.reputation_score ?? 0).toFixed(1)} / 5.0
            </p>
          </div>
        </div>
      </div>

      {/* Editar datos */}
      <div
        className="rounded-2xl border p-6 flex flex-col gap-4"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <h2 className="font-medium" style={{ color: "var(--text)" }}>
          Editar datos
        </h2>
        <EditProfileForm
          firstName={profile?.first_name ?? ""}
          lastName={profile?.last_name ?? ""}
          whatsappCountryCode={profile?.whatsapp_country_code ?? "54"}
          whatsappNumber={profile?.whatsapp_number ?? ""}
        />
      </div>

      {/* Cambiar contraseña */}
      <div
        className="rounded-2xl border p-6 flex flex-col gap-4"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <h2 className="font-medium" style={{ color: "var(--text)" }}>
          Cambiar contraseña
        </h2>
        <ChangePasswordForm />
      </div>

      {/* Verificación de DNI */}
      <DniVerificationCard
        status={
          profile?.dni_verified
            ? "approved"
            : (dniVerification?.status as "pending" | "rejected" | undefined) ?? "none"
        }
        reviewerNotes={dniVerification?.reviewer_notes}
      />

      {/* Mercado Pago */}
      <MpConnectCard
        isConnected={!!profile?.mp_user_id}
        mpConnectedParam={params.mp_connected}
        mpErrorParam={params.mp_error}
      />
    </div>
  );
}
