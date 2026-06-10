-- ─────────────────────────────────────────────
-- 008: campo is_admin en public.users
-- ─────────────────────────────────────────────

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Solo un admin puede ver quién es admin (privacidad)
-- La política pública ya existe; este campo no necesita política extra
-- porque service_role bypasea todo RLS en las páginas admin.

-- Para convertir a alguien en admin, correr en SQL Editor:
--   UPDATE public.users SET is_admin = true WHERE email = 'tu@email.com';
