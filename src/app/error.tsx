"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-7xl mb-4">⚠️</p>
      <h2 className="font-display text-4xl mb-3" style={{ color: "var(--text)" }}>
        Algo salió mal
      </h2>
      <p className="text-sm mb-8" style={{ color: "var(--dim)" }}>
        Ocurrió un error inesperado. Podés intentar recargar la página.
      </p>
      <button
        onClick={reset}
        className="inline-flex px-6 py-2.5 rounded-full text-sm font-medium"
        style={{ backgroundColor: "var(--blue)", color: "#fff" }}
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
