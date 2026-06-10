import { createServiceClient } from "@/lib/supabase/server";
import { DniReviewCard } from "@/components/admin/DniReviewCard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Verificaciones DNI — Admin RTP" };

export default async function AdminVerificacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "pending" } = await searchParams;
  const service = createServiceClient();

  const { data: verifications } = await service
    .from("dni_verifications")
    .select(`
      id, status, reviewer_notes, reviewed_at, created_at,
      front_url, back_url,
      users ( id, first_name, last_name, email, dni )
    `)
    .eq("status", status)
    .order("created_at", { ascending: true });

  // Generar signed URLs para las fotos (válidas 1 hora)
  const withUrls = await Promise.all(
    (verifications ?? []).map(async (v) => {
      const [frontSigned, backSigned] = await Promise.all([
        service.storage.from("dni-documents").createSignedUrl(v.front_url, 3600),
        service.storage.from("dni-documents").createSignedUrl(v.back_url, 3600),
      ]);
      return {
        ...v,
        frontSignedUrl: frontSigned.data?.signedUrl ?? null,
        backSignedUrl:  backSigned.data?.signedUrl  ?? null,
      };
    })
  );

  const TABS = [
    { value: "pending",  label: "Pendientes" },
    { value: "approved", label: "Aprobadas" },
    { value: "rejected", label: "Rechazadas" },
  ];

  return (
    <div className="p-8">
      <h1 className="font-display text-4xl mb-2" style={{ color: "var(--text)" }}>
        Verificaciones de DNI
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--dim)" }}>
        Revisá las fotos y aprobá o rechazá cada solicitud
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => (
          <a
            key={tab.value}
            href={`/admin/verificaciones?status=${tab.value}`}
            className="px-4 py-1.5 rounded-full text-sm font-medium border transition-colors"
            style={{
              backgroundColor: status === tab.value ? "var(--blue)" : "var(--bg2)",
              borderColor:     status === tab.value ? "var(--blue)" : "var(--border)",
              color:           status === tab.value ? "#fff" : "var(--muted)",
            }}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {!withUrls.length ? (
        <div
          className="rounded-2xl border py-16 text-center"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg2)" }}
        >
          <p className="text-3xl mb-2">✅</p>
          <p className="text-sm" style={{ color: "var(--dim)" }}>
            No hay verificaciones {status === "pending" ? "pendientes" : status === "approved" ? "aprobadas" : "rechazadas"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {withUrls.map((v) => (
            <DniReviewCard
              key={v.id}
              verification={v as Parameters<typeof DniReviewCard>[0]["verification"]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
