-- ─────────────────────────────────────────────
-- 002: listings + listing_media
-- ─────────────────────────────────────────────

CREATE TYPE listing_category AS ENUM (
  'esquis',
  'tabla_snowboard',
  'botas',
  'fijaciones',
  'ropa',
  'mochilas',
  'antiparras',
  'cascos',
  'fundas_esquis',
  'fundas_snowboard',
  'accesorios'
);

CREATE TYPE listing_condition AS ENUM ('nuevo', 'muy_bueno', 'bueno', 'aceptable');
CREATE TYPE listing_status    AS ENUM ('active', 'paused', 'sold', 'deleted');
CREATE TYPE price_type        AS ENUM ('fixed', 'negotiable');

CREATE TABLE public.listings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title           text NOT NULL,
  category        listing_category NOT NULL,
  description     text NOT NULL,
  brand           text,
  size            text,
  seasons_used    integer,
  condition       listing_condition NOT NULL,
  price           numeric NOT NULL CHECK (price >= 0),
  price_type      price_type NOT NULL,
  location        text NOT NULL,
  status          listing_status NOT NULL DEFAULT 'active',
  relevance_score numeric DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Actualiza updated_at automáticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── listing_media ───
CREATE TABLE public.listing_media (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  url         text NOT NULL,
  media_type  text NOT NULL CHECK (media_type IN ('photo', 'video')),
  "order"     integer DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- ─── Índices ───
CREATE INDEX listings_status_idx    ON public.listings (status);
CREATE INDEX listings_category_idx  ON public.listings (category);
CREATE INDEX listings_user_id_idx   ON public.listings (user_id);
CREATE INDEX listings_relevance_idx ON public.listings (relevance_score DESC);
CREATE INDEX listing_media_listing_idx ON public.listing_media (listing_id);

-- ─── RLS listings ───
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "listings_public_read" ON public.listings
  FOR SELECT USING (status != 'deleted');

CREATE POLICY "listings_owner_insert" ON public.listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "listings_owner_update" ON public.listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "listings_owner_delete" ON public.listings
  FOR DELETE USING (auth.uid() = user_id);

-- ─── RLS listing_media ───
ALTER TABLE public.listing_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "listing_media_public_read" ON public.listing_media
  FOR SELECT USING (true);

CREATE POLICY "listing_media_owner_write" ON public.listing_media
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM public.listings WHERE id = listing_id)
  );
