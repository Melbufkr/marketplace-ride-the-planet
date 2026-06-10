import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-7xl mb-4">🏔️</p>
      <h1 className="font-display text-5xl mb-3" style={{ color: "var(--text)" }}>
        404
      </h1>
      <p className="text-lg font-medium mb-2" style={{ color: "var(--text)" }}>
        Esta página no existe
      </p>
      <p className="text-sm mb-8" style={{ color: "var(--dim)" }}>
        Puede que la publicación fue eliminada o la URL es incorrecta.
      </p>
      <Link
        href="/"
        className="inline-flex px-6 py-2.5 rounded-full text-sm font-medium"
        style={{ backgroundColor: "var(--blue)", color: "#fff" }}
      >
        Volver al inicio
      </Link>
    </div>
  );
}
