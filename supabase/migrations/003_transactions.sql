-- ─────────────────────────────────────────────
-- 003: transactions + contact_exchanges
-- ─────────────────────────────────────────────

CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'cancelled');
CREATE TYPE mp_status           AS ENUM ('pending', 'approved', 'rejected', 'refunded');

CREATE TABLE public.transactions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id          uuid REFERENCES public.listings(id) NOT NULL,
  buyer_id            uuid REFERENCES public.users(id) NOT NULL,
  seller_id           uuid REFERENCES public.users(id) NOT NULL,
  amount              numeric NOT NULL CHECK (amount > 0),
  platform_fee_pct    numeric NOT NULL DEFAULT 0,
  platform_fee_amount numeric NOT NULL DEFAULT 0,
  seller_amount       numeric NOT NULL,
  mp_payment_id       text,
  mp_status           mp_status,
  status              transaction_status NOT NULL DEFAULT 'pending',
  created_at          timestamptz DEFAULT now(),
  completed_at        timestamptz
);

CREATE TABLE public.contact_exchanges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  uuid REFERENCES public.listings(id) NOT NULL,
  buyer_id    uuid REFERENCES public.users(id) NOT NULL,
  seller_id   uuid REFERENCES public.users(id) NOT NULL,
  type        text NOT NULL CHECK (type IN ('fixed_purchase', 'negotiable_contact')),
  email_sent  boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- ─── Índices ───
CREATE INDEX transactions_buyer_idx    ON public.transactions (buyer_id);
CREATE INDEX transactions_seller_idx   ON public.transactions (seller_id);
CREATE INDEX transactions_listing_idx  ON public.transactions (listing_id);
CREATE INDEX transactions_mp_id_idx    ON public.transactions (mp_payment_id);
CREATE INDEX contact_exchanges_buyer_idx   ON public.contact_exchanges (buyer_id);
CREATE INDEX contact_exchanges_seller_idx  ON public.contact_exchanges (seller_id);

-- ─── RLS transactions ───
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_participant_read" ON public.transactions
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Solo el sistema (service_role) puede insertar y actualizar
CREATE POLICY "transactions_service_insert" ON public.transactions
  FOR INSERT WITH CHECK (false); -- bloqueado para anon/authenticated; usar service_role

CREATE POLICY "transactions_service_update" ON public.transactions
  FOR UPDATE USING (false);

-- ─── RLS contact_exchanges ───
ALTER TABLE public.contact_exchanges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exchanges_participant_read" ON public.contact_exchanges
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "exchanges_buyer_insert" ON public.contact_exchanges
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);
