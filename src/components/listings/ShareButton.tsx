"use client";

import { useState } from "react";

interface ShareButtonProps {
  title: string;
  url?: string;
}

export function ShareButton({ title, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");

    // Web Share API (móvil / Safari)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Mirá este equipo en RTP Market: ${title}`,
          url: shareUrl,
        });
        return;
      } catch {
        // usuario canceló o no soportado — fallback
      }
    }

    // Fallback: copiar al portapapeles
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // noop
    }
  }

  return (
    <button
      onClick={handleShare}
      aria-label="Compartir publicación"
      className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full border transition-all duration-150 text-base"
      style={{
        backgroundColor: "var(--bg2)",
        borderColor: copied ? "var(--blue)" : "var(--border)",
        color: copied ? "var(--blue)" : "var(--dim)",
      }}
      title={copied ? "¡Link copiado!" : "Compartir"}
    >
      {copied ? "✓" : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      )}
    </button>
  );
}
