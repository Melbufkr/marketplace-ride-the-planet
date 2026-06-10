# Ride the Planet Market

Marketplace C2C de equipos de ski y snowboard — `market.ridetheplanet.ai`

## Stack

Next.js 16 (App Router) · Tailwind CSS · Supabase · Mercado Pago · Resend · Vercel

## Setup

```bash
# 1. Instalar dependencias
npm install

# 2. Variables de entorno
cp .env.local.example .env.local
# Completar con tus keys de Supabase, MP y Resend

# 3. Migraciones — aplicar en orden en Supabase Dashboard → SQL Editor
#    001 → 002 → 003 → 004 → 005 → 006

# 4. Dev server
npm run dev
```

## Migraciones

| Archivo | Contenido |
|---------|-----------|
| `001_users.sql` | Tabla `users` + trigger desde `auth.users` |
| `002_listings.sql` | `listings` + `listing_media` + índices |
| `003_transactions.sql` | `transactions` + `contact_exchanges` |
| `004_reviews.sql` | `reviews` + trigger `reputation_score` |
| `005_storage.sql` | Bucket `listings-media` en Supabase Storage |
| `006_relevance_score.sql` | Función `calculate_relevance_score()` |

## Storage paths

```
listings-media/{user_id}/{listing_id}/{filename}
```

## Variables de entorno

Ver `.env.local.example`.  
`PLATFORM_FEE_PCT=0` arranca sin comisión — cambiar el valor cuando sea momento de monetizar.
