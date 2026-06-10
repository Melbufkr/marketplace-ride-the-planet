import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Política de privacidad y tratamiento de datos personales de RTP Market.",
  robots: { index: false, follow: false },
};

const SECTIONS = [
  {
    title: "1. Responsable del tratamiento",
    content: "[Contenido pendiente]",
  },
  {
    title: "2. Datos personales que recopilamos",
    content: "[Contenido pendiente]",
  },
  {
    title: "3. Finalidad del tratamiento",
    content: "[Contenido pendiente]",
  },
  {
    title: "4. Base legal para el tratamiento",
    content: "[Contenido pendiente]",
  },
  {
    title: "5. Conservación de los datos",
    content: "[Contenido pendiente]",
  },
  {
    title: "6. Compartición de datos con terceros",
    content: "[Contenido pendiente]",
  },
  {
    title: "7. Transferencias internacionales",
    content: "[Contenido pendiente]",
  },
  {
    title: "8. Derechos del titular",
    content: "[Contenido pendiente]",
  },
  {
    title: "9. Seguridad de los datos",
    content: "[Contenido pendiente]",
  },
  {
    title: "10. Cookies y tecnologías de seguimiento",
    content: "[Contenido pendiente]",
  },
  {
    title: "11. Menores de edad",
    content: "[Contenido pendiente]",
  },
  {
    title: "12. Modificaciones a esta política",
    content: "[Contenido pendiente]",
  },
  {
    title: "13. Contacto",
    content: "[Contenido pendiente]",
  },
];

export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Encabezado */}
      <div className="mb-10">
        <h1
          className="font-display text-4xl mb-3"
          style={{ color: "var(--text)" }}
        >
          Política de privacidad
        </h1>
        <p className="text-sm" style={{ color: "var(--dim)" }}>
          Última actualización: [fecha pendiente]
        </p>
        <div
          className="mt-4 rounded-xl border px-4 py-3 text-sm"
          style={{ backgroundColor: "var(--bg2)", borderColor: "var(--border)", color: "var(--muted)" }}
        >
          En RTP Market nos comprometemos a proteger tu privacidad y tratar tus datos
          personales de manera responsable, conforme a la Ley 25.326 de Protección de
          Datos Personales de la República Argentina.
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
          Para ejercer tus derechos o consultas sobre privacidad:{" "}
          <a
            href="mailto:hola@ridetheplanet.ai"
            style={{ color: "var(--accent)" }}
          >
            hola@ridetheplanet.ai
          </a>
          .
        </p>
      </div>
    </div>
  );
}
