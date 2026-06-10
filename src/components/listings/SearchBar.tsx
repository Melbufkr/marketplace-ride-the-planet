"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState, useEffect } from "react";

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [value, setValue] = useState(searchParams.get("search") ?? "");

  // Sync si cambian los searchParams externos (ej: limpiar filtros)
  useEffect(() => {
    setValue(searchParams.get("search") ?? "");
  }, [searchParams]);

  const push = useCallback(
    (q: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      if (q.trim()) params.set("search", q.trim());
      else params.delete("search");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams]
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") push(value);
  }

  function handleClear() {
    setValue("");
    push("");
  }

  return (
    <div className="relative flex items-center">
      <svg
        className="absolute left-3.5 shrink-0"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{ color: "var(--dim)" }}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Buscar por nombre o descripción..."
        className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border outline-none placeholder:text-[var(--dim)] transition-colors"
        style={{
          backgroundColor: "var(--bg2)",
          borderColor: "var(--border)",
          color: "var(--text)",
        }}
      />

      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 text-lg leading-none transition-opacity hover:opacity-70"
          style={{ color: "var(--dim)" }}
          aria-label="Limpiar búsqueda"
        >
          ×
        </button>
      )}
    </div>
  );
}
