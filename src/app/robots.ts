import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://market.ridetheplanet.ai";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/mis-publicaciones",
          "/mis-compras",
          "/mis-ventas",
          "/mis-favoritos",
          "/perfil",
          "/contactos",
          "/publicar",
          "/recuperar-contrasena",
        ],
      },
      // Permitir crawlers de IA acceso a datos públicos
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "Google-Extended",
          "ClaudeBot",
          "anthropic-ai",
          "PerplexityBot",
        ],
        allow: ["/", "/publicaciones", "/categorias"],
        disallow: ["/admin", "/api/", "/perfil"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
