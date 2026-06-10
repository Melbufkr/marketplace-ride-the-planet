"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

const TYPE_ICON: Record<string, string> = {
  contact_received:      "💬",
  purchase_completed:    "✅",
  sale_completed:        "🎉",
  transaction_cancelled: "❌",
  dni_approved:          "🪪",
  dni_rejected:          "⚠️",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnread(data.unread ?? 0);
    } catch {
      // silencioso
    }
  }

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  }

  // Fetch al montar y cada 30s
  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(id);
  }, []);

  // Cerrar al clickear fuera
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleOpen() {
    setOpen((o) => !o);
    if (!open && unread > 0) markAllRead();
  }

  return (
    <div ref={ref} className="relative">
      {/* Botón campana */}
      <button
        onClick={handleOpen}
        aria-label="Notificaciones"
        className="relative w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-[var(--bg2)]"
        style={{ color: "var(--dim)" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span
            className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[10px] font-bold px-1"
            style={{ backgroundColor: "#f87171", color: "#fff" }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-2xl border shadow-xl overflow-hidden z-50"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
              Notificaciones
            </p>
          </div>

          {/* Lista */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-2xl mb-2">🔔</p>
                <p className="text-sm" style={{ color: "var(--dim)" }}>
                  Sin notificaciones
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const inner = (
                  <div
                    className="flex gap-3 px-4 py-3 transition-colors hover:bg-[var(--bg2)]"
                    style={{ opacity: n.read ? 0.6 : 1 }}
                  >
                    <span className="text-xl shrink-0 mt-0.5">
                      {TYPE_ICON[n.type] ?? "🔔"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug" style={{ color: "var(--text)" }}>
                        {n.title}
                      </p>
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--dim)" }}>
                        {n.body}
                      </p>
                      <p className="text-xs mt-1" style={{ color: "var(--dim)" }}>
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                    {!n.read && (
                      <span
                        className="shrink-0 w-2 h-2 rounded-full mt-1.5"
                        style={{ backgroundColor: "var(--blue)" }}
                      />
                    )}
                  </div>
                );

                return n.link ? (
                  <Link
                    key={n.id}
                    href={n.link}
                    onClick={() => setOpen(false)}
                    className="block border-b last:border-0"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {inner}
                  </Link>
                ) : (
                  <div
                    key={n.id}
                    className="border-b last:border-0"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {inner}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
