-- ─────────────────────────────────────────────
-- 001: tabla public.users + trigger desde auth
-- ─────────────────────────────────────────────

CREATE TABLE public.users (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 text UNIQUE NOT NULL,
  first_name            text NOT NULL,
  last_name             text NOT NULL,
  whatsapp_country_code text NOT NULL,
  whatsapp_number       text NOT NULL,
  dni                   text NOT NULL,
  birth_date            date NOT NULL,
  terms_accepted        boolean NOT NULL DEFAULT false,
  terms_accepted_at     timestamptz,
  reputation_score      numeric DEFAULT 0,
  created_at            timestamptz DEFAULT now()
);

-- El id de public.users == auth.users.id para joins simples
-- El trigger lo garantiza en el INSERT

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Los campos adicionales vienen en raw_user_meta_data
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    whatsapp_country_code,
    whatsapp_number,
    dni,
    birth_date,
    terms_accepted,
    terms_accepted_at
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'whatsapp_country_code',
    NEW.raw_user_meta_data->>'whatsapp_number',
    NEW.raw_user_meta_data->>'dni',
    (NEW.raw_user_meta_data->>'birth_date')::date,
    true,
    now()
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ─── RLS ───
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Lectura pública de nombre y reputación (para mostrar en publicaciones)
CREATE POLICY "users_public_read" ON public.users
  FOR SELECT USING (true);

-- Sólo el propio usuario puede editar sus datos
CREATE POLICY "users_self_update" ON public.users
  FOR UPDATE USING (auth.uid() = id);
