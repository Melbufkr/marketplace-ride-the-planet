import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

// Cliente singleton — se inicializa con el access token de la plataforma
let _client: MercadoPagoConfig | null = null;

export function getMpClient(): MercadoPagoConfig {
  if (!_client) {
    if (!process.env.MP_ACCESS_TOKEN) {
      throw new Error("MP_ACCESS_TOKEN no configurado");
    }
    _client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });
  }
  return _client;
}

export function getPreferenceClient() {
  return new Preference(getMpClient());
}

export function getPaymentClient() {
  return new Payment(getMpClient());
}
