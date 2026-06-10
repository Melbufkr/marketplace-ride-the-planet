import { getResend, FROM_ADDRESS } from "./index";
import {
  purchaseBuyerEmail,
  purchaseSellerEmail,
  contactBuyerEmail,
  contactSellerEmail,
  transactionCancelledBuyerEmail,
  dniApprovedEmail,
  dniRejectedEmail,
} from "./templates";

type ContactPerson = {
  first_name: string;
  last_name: string;
  email: string;
  whatsapp_country_code: string;
  whatsapp_number: string;
};

// ─── Compra completada (precio fijo) ────────────────────

export async function sendPurchaseEmails(params: {
  buyer: ContactPerson;
  seller: ContactPerson;
  listing: { title: string; price: number };
  sellerAmount: number;
  platformFeePct: number;
}) {
  const resend = getResend();

  await Promise.all([
    // Email al comprador
    resend.emails.send({
      from: FROM_ADDRESS,
      to: params.buyer.email,
      subject: `✅ Compra confirmada: ${params.listing.title}`,
      html: purchaseBuyerEmail({
        buyerFirstName: params.buyer.first_name,
        sellerFirstName: params.seller.first_name,
        listingTitle: params.listing.title,
        listingPrice: params.listing.price,
        seller: params.seller,
      }),
    }),
    // Email al vendedor
    resend.emails.send({
      from: FROM_ADDRESS,
      to: params.seller.email,
      subject: `🎉 Vendiste: ${params.listing.title}`,
      html: purchaseSellerEmail({
        sellerFirstName: params.seller.first_name,
        listingTitle: params.listing.title,
        listingPrice: params.listing.price,
        sellerAmount: params.sellerAmount,
        platformFeePct: params.platformFeePct,
        buyer: params.buyer,
      }),
    }),
  ]);
}

// ─── Pago rechazado/cancelado ────────────────────────────

export async function sendTransactionCancelledEmail(params: {
  buyer: { first_name: string; email: string };
  listing: { title: string };
  mpStatus: string;
}) {
  const resend = getResend();
  await resend.emails.send({
    from: FROM_ADDRESS,
    to: params.buyer.email,
    subject: `❌ Pago no procesado: ${params.listing.title}`,
    html: transactionCancelledBuyerEmail({
      buyerFirstName: params.buyer.first_name,
      listingTitle: params.listing.title,
      mpStatus: params.mpStatus,
    }),
  });
}

// ─── Verificación de DNI ─────────────────────────────────

export async function sendDniApprovedEmail(params: {
  user: { first_name: string; email: string };
}) {
  const resend = getResend();
  await resend.emails.send({
    from: FROM_ADDRESS,
    to: params.user.email,
    subject: "✅ Tu identidad fue verificada — RTP Market",
    html: dniApprovedEmail({ firstName: params.user.first_name }),
  });
}

export async function sendDniRejectedEmail(params: {
  user: { first_name: string; email: string };
  notes?: string | null;
}) {
  const resend = getResend();
  await resend.emails.send({
    from: FROM_ADDRESS,
    to: params.user.email,
    subject: "⚠️ Revisá tu verificación de identidad — RTP Market",
    html: dniRejectedEmail({ firstName: params.user.first_name, notes: params.notes }),
  });
}

// ─── Contacto iniciado (precio conversable) ─────────────

export async function sendContactEmails(params: {
  buyer: ContactPerson;
  seller: ContactPerson;
  listing: { title: string; price: number };
}) {
  const resend = getResend();

  await Promise.all([
    // Email al comprador
    resend.emails.send({
      from: FROM_ADDRESS,
      to: params.buyer.email,
      subject: `📬 Contacto iniciado: ${params.listing.title}`,
      html: contactBuyerEmail({
        buyerFirstName: params.buyer.first_name,
        listingTitle: params.listing.title,
        listingPrice: params.listing.price,
        seller: params.seller,
      }),
    }),
    // Email al vendedor
    resend.emails.send({
      from: FROM_ADDRESS,
      to: params.seller.email,
      subject: `👋 Alguien está interesado en: ${params.listing.title}`,
      html: contactSellerEmail({
        sellerFirstName: params.seller.first_name,
        listingTitle: params.listing.title,
        listingPrice: params.listing.price,
        buyer: params.buyer,
      }),
    }),
  ]);
}
