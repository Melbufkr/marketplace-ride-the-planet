-- ─────────────────────────────────────────────
-- 009: verificación de DNI
-- ─────────────────────────────────────────────

-- Campo en users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS dni_verified boolean NOT NULL DEFAULT false;

-- Tabla de verificaciones
CREATE TABLE public.dni_verifications (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  front_url     text NOT NULL,
  back_url      text NOT NULL,
  status        text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_notes text,
  reviewed_at   timestamptz,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE TRIGGER dni_verifications_updated_at
  BEFORE UPDATE ON public.dni_verifications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.dni_verifications ENABLE ROW LEVEL SECURITY;

-- El usuario solo ve su propia verificación
CREATE POLICY "dni_own_read" ON public.dni_verifications
  FOR SELECT USING (auth.uid() = user_id);

-- El usuario puede insertar/actualizar la suya (si está pending o no existe)
CREATE POLICY "dni_own_insert" ON public.dni_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "dni_own_update" ON public.dni_verifications
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Storage bucket dni-documents (privado — no público)
-- Correr en SQL Editor de Supabase:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dni-documents',
  'dni-documents',
  false,
  10485760, -- 10 MB
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage: solo el dueño puede subir, service_role lee todo
CREATE POLICY "dni_owner_upload" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'dni-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "dni_owner_read" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'dni-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
