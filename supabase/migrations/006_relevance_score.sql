-- ─────────────────────────────────────────────
-- 006: función para calcular relevance_score
-- ─────────────────────────────────────────────
-- Factores:
--   fotos (0-5)          →  hasta +25 pts
--   longitud descripción →  hasta +20 pts
--   antigüedad (boost)   →  hasta +30 pts para publicaciones nuevas
--   reputación vendedor  →  hasta +15 pts
--   precio competitivo   →  hasta +10 pts (relativo a categoría)

CREATE OR REPLACE FUNCTION public.calculate_relevance_score(listing_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_listing     public.listings%ROWTYPE;
  v_seller      public.users%ROWTYPE;
  v_photo_count integer;
  v_desc_len    integer;
  v_age_hours   numeric;
  v_avg_price   numeric;
  score         numeric := 0;
BEGIN
  SELECT * INTO v_listing FROM public.listings WHERE id = listing_id;
  SELECT * INTO v_seller  FROM public.users    WHERE id = v_listing.user_id;

  -- Fotos: 5 pts por foto, max 25
  SELECT COUNT(*) INTO v_photo_count
  FROM public.listing_media
  WHERE listing_id = v_listing.id AND media_type = 'photo';
  score := score + LEAST(v_photo_count * 5, 25);

  -- Descripción: escala hasta 20 pts en 500 chars
  v_desc_len := length(v_listing.description);
  score := score + LEAST((v_desc_len::numeric / 500) * 20, 20);

  -- Boost antigüedad: 30 pts si tiene < 24h, decae linealmente hasta 0 en 7 días
  v_age_hours := EXTRACT(EPOCH FROM (now() - v_listing.created_at)) / 3600;
  IF v_age_hours < 168 THEN
    score := score + GREATEST(30 - (v_age_hours / 168) * 30, 0);
  END IF;

  -- Reputación vendedor: escala 0-5 → 0-15 pts
  score := score + (v_seller.reputation_score / 5) * 15;

  -- Precio competitivo: si está en el cuartil inferior de la categoría, +10
  SELECT AVG(price) INTO v_avg_price
  FROM public.listings
  WHERE category = v_listing.category
    AND status = 'active'
    AND id != v_listing.id;

  IF v_avg_price IS NOT NULL AND v_listing.price < v_avg_price * 0.75 THEN
    score := score + 10;
  END IF;

  RETURN ROUND(score, 2);
END;
$$;

-- Recalcula al insertar o actualizar una publicación
CREATE OR REPLACE FUNCTION public.refresh_relevance_score()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.relevance_score := public.calculate_relevance_score(NEW.id);
  RETURN NEW;
END;
$$;

-- Nota: el trigger se activa en UPDATE para que los cambios de fotos
-- también disparen el recálculo a través de la API route.
-- Para INSERT, el score inicial es 0; se recalcula al subir la primera foto.
