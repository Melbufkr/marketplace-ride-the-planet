-- Tabla de favoritos
CREATE TABLE IF NOT EXISTS public.favorites (
  user_id    uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);

-- RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Solo el propio usuario ve y gestiona sus favoritos
CREATE POLICY "favorites_select_own" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "favorites_insert_own" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites_delete_own" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Índice para queries rápidas por usuario
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON public.favorites (user_id);
