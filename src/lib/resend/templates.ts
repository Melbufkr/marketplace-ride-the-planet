// Templates HTML inline — sin dependencias de React Email
// Paleta de colores del proyecto para consistencia visual en email

const BASE = `
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #070c14;
  color: #eef4fb;
  margin: 0;
  padding: 0;
`;

function layout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ride the Planet Market</title>
</head>
<body style="${BASE}">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-family:sans-serif;font-size:22px;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;color:#7dd3fc;">
        RTP Market
      </span>
    </div>

    <!-- Card -->
    <div style="background:#0d1824;border:1px solid rgba(42,127,206,0.12);border-radius:16px;padding:32px;">
      ${content}
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;">
      <p style="font-size:12px;color:#5a7a94;margin:0;">
        Ride the Planet Market · market.ridetheplanet.ai
      </p>
      <p style="font-size:11px;color:#5a7a94;margin:8px 0 0;">
        Este email fue generado automáticamente. Por favor no respondas este correo.
      </p>
    </div>
  </div>
</body>
</html>`.trim();
}

function contactCard(
  title: string,
  person: { first_name: string; last_name: string; email: string; whatsapp_country_code: string; whatsapp_number: string }
): string {
  return `
    <div style="background:#070c14;border:1px solid rgba(42,127,206,0.12);border-radius:12px;padding:16px;margin-top:16px;">
      <p style="margin:0 0 4px;font-size:11px;color:#5a7a94;text-transform:uppercase;letter-spacing:0.05em;">${title}</p>
      <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#eef4fb;">
        ${person.first_name} ${person.last_name}
      </p>
      <p style="margin:0 0 4px;font-size:13px;color:#c8dff0;">
        📧 <a href="mailto:${person.email}" style="color:#7dd3fc;text-decoration:none;">${person.email}</a>
      </p>
      <p style="margin:0;font-size:13px;color:#c8dff0;">
        💬 <a href="https://wa.me/${person.whatsapp_country_code.replace('+','')}${person.whatsapp_number}"
              style="color:#7dd3fc;text-decoration:none;">
          ${person.whatsapp_country_code} ${person.whatsapp_number}
        </a>
      </p>
    </div>
  `;
}

// ─── Template: compra completada para el COMPRADOR ──────

export function purchaseBuyerEmail(params: {
  buyerFirstName: string;
  sellerFirstName: string;
  listingTitle: string;
  listingPrice: number;
  seller: { first_name: string; last_name: string; email: string; whatsapp_country_code: string; whatsapp_number: string };
}): string {
  const price = new Intl.NumberFormat("es-AR", {
    style: "currency", currency: "ARS", maximumFractionDigits: 0
  }).format(params.listingPrice);

  return layout(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;text-transform:uppercase;color:#eef4fb;">
      ¡Compra confirmada!
    </h1>
    <p style="margin:0 0 24px;color:#c8dff0;font-size:15px;">
      Hola ${params.buyerFirstName}, tu pago fue procesado exitosamente.
    </p>

    <div style="background:#070c14;border:1px solid rgba(42,127,206,0.12);border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:11px;color:#5a7a94;text-transform:uppercase;letter-spacing:0.05em;">Equipo comprado</p>
      <p style="margin:0 0 4px;font-size:16px;font-weight:600;color:#eef4fb;">${params.listingTitle}</p>
      <p style="margin:0;font-size:20px;font-weight:800;color:#7dd3fc;">${price}</p>
    </div>

    <p style="margin:0 0 8px;color:#c8dff0;font-size:14px;">
      Los datos del vendedor para coordinar la entrega:
    </p>
    ${contactCard("Vendedor", params.seller)}

    <p style="margin:24px 0 0;font-size:13px;color:#5a7a94;line-height:1.6;">
      Coordiná con ${params.sellerFirstName} el lugar y forma de entrega.<br/>
      Si tenés algún problema, podés contactarnos respondiendo este mail.
    </p>
  `);
}

// ─── Template: compra completada para el VENDEDOR ───────

export function purchaseSellerEmail(params: {
  sellerFirstName: string;
  listingTitle: string;
  listingPrice: number;
  sellerAmount: number;
  platformFeePct: number;
  buyer: { first_name: string; last_name: string; email: string; whatsapp_country_code: string; whatsapp_number: string };
}): string {
  const fmtARS = (n: number) => new Intl.NumberFormat("es-AR", {
    style: "currency", currency: "ARS", maximumFractionDigits: 0
  }).format(n);

  return layout(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;text-transform:uppercase;color:#eef4fb;">
      ¡Vendiste tu equipo!
    </h1>
    <p style="margin:0 0 24px;color:#c8dff0;font-size:15px;">
      Hola ${params.sellerFirstName}, recibiste una compra exitosa.
    </p>

    <div style="background:#070c14;border:1px solid rgba(42,127,206,0.12);border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:11px;color:#5a7a94;text-transform:uppercase;letter-spacing:0.05em;">Publicación vendida</p>
      <p style="margin:0 0 12px;font-size:16px;font-weight:600;color:#eef4fb;">${params.listingTitle}</p>
      <div style="display:flex;gap:16px;flex-wrap:wrap;">
        <div>
          <p style="margin:0 0 2px;font-size:11px;color:#5a7a94;">Precio total</p>
          <p style="margin:0;font-size:15px;color:#eef4fb;">${fmtARS(params.listingPrice)}</p>
        </div>
        ${params.platformFeePct > 0 ? `
        <div>
          <p style="margin:0 0 2px;font-size:11px;color:#5a7a94;">Comisión plataforma (${params.platformFeePct}%)</p>
          <p style="margin:0;font-size:15px;color:#eef4fb;">- ${fmtARS(params.listingPrice - params.sellerAmount)}</p>
        </div>` : ""}
        <div>
          <p style="margin:0 0 2px;font-size:11px;color:#5a7a94;">Recibís vos</p>
          <p style="margin:0;font-size:20px;font-weight:800;color:#7dd3fc;">${fmtARS(params.sellerAmount)}</p>
        </div>
      </div>
    </div>

    <p style="margin:0 0 8px;color:#c8dff0;font-size:14px;">
      Los datos del comprador para coordinar la entrega:
    </p>
    ${contactCard("Comprador", params.buyer)}

    <p style="margin:24px 0 0;font-size:13px;color:#5a7a94;line-height:1.6;">
      El monto se acreditará en tu cuenta de Mercado Pago según los tiempos habituales.
    </p>
  `);
}

// ─── Template: contacto para precio conversable ─────────

export function contactBuyerEmail(params: {
  buyerFirstName: string;
  listingTitle: string;
  listingPrice: number;
  seller: { first_name: string; last_name: string; email: string; whatsapp_country_code: string; whatsapp_number: string };
}): string {
  const price = new Intl.NumberFormat("es-AR", {
    style: "currency", currency: "ARS", maximumFractionDigits: 0
  }).format(params.listingPrice);

  return layout(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;text-transform:uppercase;color:#eef4fb;">
      Contacto iniciado
    </h1>
    <p style="margin:0 0 24px;color:#c8dff0;font-size:15px;">
      Hola ${params.buyerFirstName}, compartimos tus datos de contacto con el vendedor.
    </p>

    <div style="background:#070c14;border:1px solid rgba(42,127,206,0.12);border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:11px;color:#5a7a94;text-transform:uppercase;letter-spacing:0.05em;">Equipo de interés</p>
      <p style="margin:0 0 4px;font-size:16px;font-weight:600;color:#eef4fb;">${params.listingTitle}</p>
      <p style="margin:0;font-size:15px;color:#7dd3fc;">Desde ${price} · A convenir</p>
    </div>

    <p style="margin:0 0 8px;color:#c8dff0;font-size:14px;">
      Podés contactar al vendedor directamente:
    </p>
    ${contactCard("Vendedor", params.seller)}

    <p style="margin:24px 0 0;font-size:13px;color:#5a7a94;line-height:1.6;">
      Coordiná el precio, forma de pago y entrega con el vendedor de forma directa.
    </p>
  `);
}

// ─── Template: pago rechazado/cancelado — COMPRADOR ────────

export function transactionCancelledBuyerEmail(params: {
  buyerFirstName: string;
  listingTitle: string;
  mpStatus: string;
}): string {
  const reason = params.mpStatus === "rejected" ? "fue rechazado por el medio de pago" : "fue cancelado";

  return layout(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;text-transform:uppercase;color:#eef4fb;">
      Pago no procesado
    </h1>
    <p style="margin:0 0 24px;color:#c8dff0;font-size:15px;">
      Hola ${params.buyerFirstName}, tu pago ${reason}.
    </p>

    <div style="background:#070c14;border:1px solid rgba(42,127,206,0.12);border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:11px;color:#5a7a94;text-transform:uppercase;letter-spacing:0.05em;">Publicación</p>
      <p style="margin:0;font-size:16px;font-weight:600;color:#eef4fb;">${params.listingTitle}</p>
    </div>

    <p style="margin:0;font-size:13px;color:#5a7a94;line-height:1.6;">
      Si querés intentarlo de nuevo, podés volver a la publicación e iniciar una nueva compra.
      El equipo sigue disponible mientras no sea vendido a otra persona.
    </p>
  `);
}

// ─── Template: DNI aprobado ─────────────────────────────

export function dniApprovedEmail(params: {
  firstName: string;
}): string {
  return layout(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;text-transform:uppercase;color:#eef4fb;">
      ¡Identidad verificada!
    </h1>
    <p style="margin:0 0 24px;color:#c8dff0;font-size:15px;">
      Hola ${params.firstName}, tu identidad fue verificada exitosamente.
    </p>

    <div style="background:#070c14;border:1px solid rgba(42,127,206,0.12);border-radius:12px;padding:16px;margin-bottom:24px;text-align:center;">
      <p style="margin:0;font-size:32px;">✅</p>
      <p style="margin:8px 0 0;font-size:15px;color:#eef4fb;">DNI aprobado</p>
    </div>

    <p style="margin:0;font-size:13px;color:#5a7a94;line-height:1.6;">
      Ya podés publicar equipo, comprar y contactar vendedores en RTP Market.
    </p>
  `);
}

// ─── Template: DNI rechazado ────────────────────────────

export function dniRejectedEmail(params: {
  firstName: string;
  notes?: string | null;
}): string {
  return layout(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;text-transform:uppercase;color:#eef4fb;">
      Verificación de identidad
    </h1>
    <p style="margin:0 0 24px;color:#c8dff0;font-size:15px;">
      Hola ${params.firstName}, no pudimos verificar tu identidad con las fotos enviadas.
    </p>

    ${params.notes ? `
    <div style="background:#070c14;border:1px solid rgba(42,127,206,0.12);border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:11px;color:#5a7a94;text-transform:uppercase;letter-spacing:0.05em;">Motivo</p>
      <p style="margin:0;font-size:14px;color:#eef4fb;">${params.notes}</p>
    </div>
    ` : ""}

    <p style="margin:0;font-size:13px;color:#5a7a94;line-height:1.6;">
      Podés volver a subir las fotos de tu DNI desde tu perfil en RTP Market.
      Asegurate de que las imágenes sean claras, bien iluminadas y sin reflejos.
    </p>
  `);
}

export function contactSellerEmail(params: {
  sellerFirstName: string;
  listingTitle: string;
  listingPrice: number;
  buyer: { first_name: string; last_name: string; email: string; whatsapp_country_code: string; whatsapp_number: string };
}): string {
  const price = new Intl.NumberFormat("es-AR", {
    style: "currency", currency: "ARS", maximumFractionDigits: 0
  }).format(params.listingPrice);

  return layout(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;text-transform:uppercase;color:#eef4fb;">
      Alguien quiere tu equipo
    </h1>
    <p style="margin:0 0 24px;color:#c8dff0;font-size:15px;">
      Hola ${params.sellerFirstName}, un comprador está interesado en tu publicación.
    </p>

    <div style="background:#070c14;border:1px solid rgba(42,127,206,0.12);border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:11px;color:#5a7a94;text-transform:uppercase;letter-spacing:0.05em;">Tu publicación</p>
      <p style="margin:0 0 4px;font-size:16px;font-weight:600;color:#eef4fb;">${params.listingTitle}</p>
      <p style="margin:0;font-size:15px;color:#7dd3fc;">Desde ${price} · A convenir</p>
    </div>

    <p style="margin:0 0 8px;color:#c8dff0;font-size:14px;">
      Datos del comprador interesado:
    </p>
    ${contactCard("Comprador", params.buyer)}

    <p style="margin:24px 0 0;font-size:13px;color:#5a7a94;line-height:1.6;">
      Contactalo directamente para coordinar precio y entrega.
    </p>
  `);
}
