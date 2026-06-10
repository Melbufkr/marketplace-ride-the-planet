import type { Metadata } from "next";
import { Barlow_Condensed, DM_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const barlowCondensed = Barlow_Condensed({
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-barlow",
  display: "swap",
});

const dmSans = DM_Sans({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://market.ridetheplanet.ai";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "RTP Market — Comprá y vendé equipo de ski y snowboard",
    template: "%s — RTP Market",
  },
  description:
    "El marketplace C2C de ski y snowboard más grande de Argentina. Comprá y vendé esquís, tablas de snowboard, botas, fijaciones, ropa y accesorios de forma segura.",
  keywords: [
    "ski", "snowboard", "equipo ski", "venta ski", "comprar snowboard",
    "marketplace ski", "equipo nieve", "ski segunda mano", "Argentina",
  ],
  authors: [{ name: "Ride the Planet", url: BASE_URL }],
  creator: "Ride the Planet",
  publisher: "Ride the Planet",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: BASE_URL,
    siteName: "RTP Market",
    title: "RTP Market — Comprá y vendé equipo de ski y snowboard",
    description:
      "El marketplace C2C de ski y snowboard más grande de Argentina. Compra segura, vendedores verificados.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "RTP Market — Marketplace de ski y snowboard en Argentina",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ridetheplanet",
    title: "RTP Market — Marketplace de ski y snowboard",
    description: "Comprá y vendé equipo de ski y snowboard en Argentina.",
    images: ["/og-default.png"],
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-theme="dark"
      suppressHydrationWarning
      className={`${barlowCondensed.variable} ${dmSans.variable} h-full`}
    >
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-K34DZWG3');`,
          }}
        />
        {/* Persist theme before first paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`,
          }}
        />
        {/* Organization JSON-LD — GEO / AI engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Ride the Planet Market",
              url: BASE_URL,
              logo: `${BASE_URL}/logo.png`,
              description:
                "Marketplace C2C de equipos de ski y snowboard en Argentina. Comprá y vendé esquís, tablas, botas, fijaciones y accesorios de forma segura.",
              sameAs: [
                "https://www.instagram.com/ridetheplanet",
              ],
              areaServed: {
                "@type": "Country",
                name: "Argentina",
              },
            }),
          }}
        />
        {/* WebSite JSON-LD con SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "RTP Market",
              url: BASE_URL,
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${BASE_URL}/publicaciones?search={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
          {/* Google Tag Manager (noscript) */}
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-K34DZWG3"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </body>
    </html>
  );
}
