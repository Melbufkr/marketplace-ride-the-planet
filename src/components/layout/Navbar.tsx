"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/Button";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const navLinks = [
    { href: "/publicaciones", label: "Explorar" },
    { href: "/categorias", label: "Categorías" },
  ];

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b"
      style={{
        backgroundColor: "var(--bg)",
        borderColor: "var(--border)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-xl tracking-wide shrink-0"
          style={{ color: "var(--accent)" }}
        >
          RTP Market
        </Link>

        {/* Links de nav — desktop */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm transition-colors"
              style={{
                color: pathname.startsWith(link.href)
                  ? "var(--accent)"
                  : "var(--muted)",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 ml-auto md:ml-0">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label="Cambiar tema"
            className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-[var(--bg2)]"
            style={{ color: "var(--dim)" }}
          >
            {theme === "dark" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {user ? (
            <>
              <NotificationBell />
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push("/publicar")}
                className="hidden sm:inline-flex"
              >
                + Publicar
              </Button>
              {/* Avatar / menú usuario */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium border"
                  style={{
                    backgroundColor: "var(--bg2)",
                    borderColor: "var(--border)",
                    color: "var(--accent)",
                  }}
                >
                  {user.email?.[0].toUpperCase()}
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-xl border shadow-lg py-1 z-50"
                    style={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                    }}
                  >
                    {[
                      { href: "/mis-publicaciones", label: "Mis publicaciones" },
                      { href: "/mis-compras", label: "Mis compras" },
                      { href: "/mis-ventas", label: "Mis ventas" },
                      { href: "/mis-favoritos", label: "Mis favoritos" },
                      { href: "/contactos", label: "Contactos" },
                      { href: "/perfil", label: "Mi perfil" },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm transition-colors hover:bg-[var(--bg2)]"
                        style={{ color: "var(--muted)" }}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div
                      className="my-1 border-t"
                      style={{ borderColor: "var(--border)" }}
                    />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[var(--bg2)]"
                      style={{ color: "var(--dim)" }}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Ingresar
                </Button>
              </Link>
              <Link href="/registro">
                <Button variant="primary" size="sm">
                  Registrarse
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
