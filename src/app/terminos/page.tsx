import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Términos y condiciones de uso de RTP Market.",
  robots: { index: false, follow: false },
};

const SECTIONS = [
  {
    title: "1. Aceptación de los términos",
    content: "[Contenido pendiente]",
  },
  {
    title: "2. Descripción del servicio",
    content: "[Contenido pendiente]",
  },
  {
    title: "3. Registro y cuenta de usuario",
    content: "[Contenido pendiente]",
  },
  {
    title: "4. Verificación de identidad",
    content: "[Contenido pendiente]",
  },
  {
    title: "5. Publicaciones y contenido",
    content: "[Contenido pendiente]",
  },
  {
    title: "6. Transacciones y pagos",
    content: "[Contenido pendiente]",
  },
  {
    title: "7. Comisiones de la plataforma",
    content: "[Contenido pendiente]",
  },
  {
    title: "8. Responsabilidades del usuario",
    content: "[Contenido pendiente]",
  },
  {
    title: "9. Conductas prohibidas",
    content: "[Contenido pendiente]",
  },
  {
    title: "10. Resolución de disputas",
    content: "[Contenido pendiente]",
  },
  {
    title: "11. Limitación de responsabilidad",
    content: "[Contenido pendiente]",
  },
  {
    title: "12. Privacidad y datos personales",
    content: "[Contenido pendiente]",
  },
  {
    title: "13. Modificaciones",
    content: "[Contenido pendiente]",
  },
  {
    title: "14. Jurisdicción y ley aplicable",
    content: "[Contenido pendiente]",
  },
];

export default function TerminosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Encabezado */}
      <div className="mb-10">
        <h1
          className="font-display text-4xl mb-3"
          style={{ color: "var(--text)" }}
        >
          Términos y condiciones
        </h1>
        <p className="text-sm" style={{ color: "var(--dim)" }}>
          Última actualización: [fecha pendiente]
        </p>
        <div
          className="mt-4 rounded-xl border px-4 py-3 text-sm"
          style={{ backgroundColor: "var(--bg2)", borderColor: "var(--border)", color: "var(--muted)" }}
        >
          Al registrarte en RTP Market, aceptás estos términos y condiciones en su totalidad.
          Si no estás de acuerdo con alguna parte, no debés usar el servicio.
        </div>
      </div>

      {/* Secciones */}
      <div className="flex flex-col gap-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2
              className="font-display text-xl mb-2"
              style={{ color: "var(--text)" }}
            >
              {section.title}
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--muted)" }}
            >
              {section.content}
            </p>
          </section>
        ))}
      </div>

      {/* Footer de la página */}
      <div
        className="mt-12 pt-6 border-t text-sm"
        style={{ borderColor: "var(--border)", color: "var(--dim)" }}
      >
        <p>
          ¿Tenés preguntas sobre estos términos?{" "}
          <a
            href="mailto:hola@ridetheplanet.ai"
            style={{ color: "var(--accent)" }}
          >
            Contactanos
          </a>
          .
        </p>
      </div>
    </div>
  );
}
