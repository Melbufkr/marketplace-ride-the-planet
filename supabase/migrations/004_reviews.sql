-- ─────────────────────────────────────────────
-- 004: reviews + actualización de reputation_score
-- ─────────────────────────────────────────────

CREATE TABLE public.reviews (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES public.transactions(id) ON DELETE SET NULL,
  exchange_id    uuid REFERENCES public.contact_exchanges(id) ON DELETE SET NULL,
  reviewer_id    uuid REFERENCES public.users(id) NOT NULL,
  reviewed_id    uuid REFERENCES public.users(id) NOT NULL,
  rating         integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment        text,
  created_at     timestamptz DEFAULT now(),
  -- Una reseña pertenece a exactamente una transacción o un exchange
  CONSTRAINT reviews_source_check CHECK (
    (transaction_id IS NOT NULL AND exchange_id IS NULL)
    OR (transaction_id IS NULL AND exchange_id IS NOT NULL)
  ),
  -- Un reviewer no puede calificar dos veces la misma transacción
  UNIQUE (transaction_id, reviewer_id),
  UNIQUE (exchange_id, reviewer_id)
);

-- Recalcula reputation_score en users después de cada reseña
CREATE OR REPLACE FUNCTION public.update_reputation_score()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.users
  SET reputation_score = (
    SELECT ROUND(AVG(rating)::numeric, 2)
    FROM public.reviews
    WHERE reviewed_id = NEW.reviewed_id
  )
  WHERE id = NEW.reviewed_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER reviews_update_reputation
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_reputation_score();

-- ─── Índices ───
CREATE INDEX reviews_reviewed_idx ON public.reviews (reviewed_id);
CREATE INDEX reviews_reviewer_idx ON public.reviews (reviewer_id);

-- ─── RLS ───
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_public_read" ON public.reviews
  FOR SELECT USING (true);

-- Solo el reviewer puede insertar, y solo si participó en la transacción/exchange
-- La validación compleja de "¿puede calificar?" la hace la API route
CREATE POLICY "reviews_reviewer_insert" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
