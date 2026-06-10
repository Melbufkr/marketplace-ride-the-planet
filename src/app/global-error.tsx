"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <p className="text-7xl mb-4">⚠️</p>
          <h2 className="font-display text-4xl mb-3">Algo salió mal</h2>
          <p className="text-sm mb-8">
            Ocurrió un error inesperado. Podés intentar recargar la página.
          </p>
          <button
            onClick={reset}
            className="inline-flex px-6 py-2.5 rounded-full text-sm font-medium bg-blue-600 text-white"
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  );
}
