-- Enable RLS for tables if not already enabled (idempotent)
ALTER TABLE public.encaminhamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manifestacoes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might conflict or be too restrictive for OUVIDOR on these actions
-- This ensures our new policies take precedence or are not blocked by older, more generic ones.
DROP POLICY IF EXISTS "Ouvidor can insert encaminhamentos" ON public.encaminhamentos;
DROP POLICY IF EXISTS "Ouvidor can update manifestation for forwarding" ON public.manifestacoes;
DROP POLICY IF EXISTS "Ouvidor can insert notificacoes" ON public.notificacoes;

-- Policy for OUVIDOR to insert into encaminhamentos
CREATE POLICY "Ouvidor can insert encaminhamentos" ON public.encaminhamentos
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (public.is_ouvidor());

-- Policy for OUVIDOR to update specific columns in manifestacoes during forwarding
-- This policy allows OUVIDOR to change the responsible sector, status, assigned user, and due date.
-- It also allows setting manifestante_id to null and anonima to true for sigilous/anonymous cases.
CREATE POLICY "Ouvidor can update manifestation for forwarding" ON public.manifestacoes
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (public.is_ouvidor())
WITH CHECK (public.is_ouvidor());

-- Policy for OUVIDOR to insert into notificacoes
CREATE POLICY "Ouvidor can insert notificacoes" ON public.notificacoes
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (public.is_ouvidor());