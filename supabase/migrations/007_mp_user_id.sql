-- ─────────────────────────────────────────────
-- 007: campo mp_user_id en users para split de pagos
-- ─────────────────────────────────────────────
-- El vendedor debe autorizar el marketplace via OAuth de MP.
-- Una vez autorizado, guardamos su collector_id (id numérico de MP).

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS mp_user_id text,
  ADD COLUMN IF NOT EXISTS mp_access_token text,      -- token del vendedor (encrypt en prod)
  ADD COLUMN IF NOT EXISTS mp_refresh_token text,     -- para renovar el token
  ADD COLUMN IF NOT EXISTS mp_token_expires_at timestamptz;

-- Índice para buscar usuarios por mp_user_id
CREATE INDEX IF NOT EXISTS users_mp_user_id_idx ON public.users (mp_user_id);

-- Solo el propio usuario puede ver/editar sus tokens de MP
-- (la política users_public_read existente no expone estos campos
-- porque usamos SELECT explícito en las queries — no SELECT *)
