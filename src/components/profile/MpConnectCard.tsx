"use client";

interface MpConnectCardProps {
  isConnected: boolean;
  mpConnectedParam?: string;
  mpErrorParam?: string;
}

export function MpConnectCard({ isConnected, mpConnectedParam, mpErrorParam }: MpConnectCardProps) {
  const justConnected = mpConnectedParam === "1";
  const hadError = mpErrorParam === "1";

  return (
    <div
      className="rounded-2xl border p-6 flex flex-col gap-4"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-medium text-base mb-1" style={{ color: "var(--text)" }}>
            Mercado Pago
          </h2>
          <p className="text-sm" style={{ color: "var(--dim)" }}>
            Necesitás conectar tu cuenta de Mercado Pago para recibir pagos cuando
            alguien compre tu equipo.
          </p>
        </div>
        <span
          className="shrink-0 text-xs px-3 py-1 rounded-full font-medium"
          style={
            isConnected
              ? { backgroundColor: "rgba(34,197,94,0.12)", color: "#22c55e" }
              : { backgroundColor: "rgba(251,191,36,0.12)", color: "#fbbf24" }
          }
        >
          {isConnected ? "Conectado" : "Sin conectar"}
        </span>
      </div>

      {justConnected && (
        <div
          className="text-sm rounded-xl px-4 py-3"
          style={{ backgroundColor: "rgba(34,197,94,0.08)", color: "#22c55e" }}
        >
          ✅ Tu cuenta de Mercado Pago fue conectada exitosamente.
        </div>
      )}

      {hadError && (
        <div
          className="text-sm rounded-xl px-4 py-3"
          style={{ backgroundColor: "rgba(239,68,68,0.08)", color: "#f87171" }}
        >
          ❌ No se pudo conectar la cuenta. Intentá de nuevo.
        </div>
      )}

      {!isConnected && (
        <a
          href="/api/auth/mp"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors w-fit"
          style={{ backgroundColor: "var(--blue)", color: "#fff" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
          </svg>
          Conectar Mercado Pago
        </a>
      )}

      {isConnected && (
        <p className="text-xs" style={{ color: "var(--dim)" }}>
          Tu cuenta está lista para recibir pagos. El dinero se acredita según los
          tiempos habituales de Mercado Pago.
        </p>
      )}
    </div>
  );
}
