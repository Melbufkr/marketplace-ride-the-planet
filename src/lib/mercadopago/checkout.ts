import { getPreferenceClient } from "./index";

export interface CheckoutItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
}

export interface CreatePreferenceParams {
  transactionId: string;
  item: CheckoutItem;
  buyerEmail: string;
  sellerMpUserId: string; // ID de usuario de MP del vendedor (obtenido via OAuth)
  platformFeeAmount: number;
  appUrl: string;
}

export interface PreferenceResult {
  preferenceId: string;
  initPoint: string; // URL de checkout de producción
  sandboxInitPoint: string; // URL de sandbox
}

export async function createCheckoutPreference(
  params: CreatePreferenceParams
): Promise<PreferenceResult> {
  const preference = getPreferenceClient();

  const appUrl = params.appUrl.replace(/\/$/, "");

  const result = await preference.create({
    body: {
      items: [
        {
          id: params.item.id,
          title: params.item.title,
          quantity: params.item.quantity,
          unit_price: params.item.unit_price,
          currency_id: params.item.currency_id ?? "ARS",
        },
      ],
      payer: {
        email: params.buyerEmail,
      },
      // Split automático: la comisión va a la cuenta de la plataforma
      // El resto (seller_amount) va a la cuenta del vendedor via collector_id
      marketplace_fee: params.platformFeeAmount,
      // El vendedor debe haber autorizado el marketplace via OAuth
      // Su access_token se referencia por collector_id
      // @ts-expect-error — el SDK no expone collector_id en sus tipos pero la API lo acepta
      collector_id: params.sellerMpUserId,
      // Referencia interna para el webhook
      external_reference: params.transactionId,
      back_urls: {
        success: `${appUrl}/compra/exitosa`,
        failure: `${appUrl}/compra/fallida`,
        pending: `${appUrl}/compra/pendiente`,
      },
      auto_return: "approved",
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      statement_descriptor: "RTP Market",
      expires: true,
      // Expira en 24 horas
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString(),
    },
  });

  return {
    preferenceId: result.id!,
    initPoint: result.init_point!,
    sandboxInitPoint: result.sandbox_init_point!,
  };
}
