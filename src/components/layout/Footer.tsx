import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="mt-auto border-t py-8"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-display text-lg" style={{ color: "var(--accent)" }}>
          RTP Market
        </p>
        <div className="flex items-center gap-6 text-sm" style={{ color: "var(--dim)" }}>
          <Link href="/publicaciones" className="hover:text-[var(--muted)] transition-colors">
            Explorar
          </Link>
          <Link href="/registro" className="hover:text-[var(--muted)] transition-colors">
            Registrarse
          </Link>
          <Link href="/terminos" className="hover:text-[var(--muted)] transition-colors">
            Términos
          </Link>
          <Link href="/privacidad" className="hover:text-[var(--muted)] transition-colors">
            Privacidad
          </Link>
        </div>
        <p className="text-xs" style={{ color: "var(--dim)" }}>
          © {new Date().getFullYear()} Ride the Planet
        </p>
      </div>
    </footer>
  );
}
