-- FINAL SCRIPT: Consolidating all RLS fixes for 'anexos' and helper functions.

-- 1. Update/Re-create helper functions with SECURITY DEFINER and STABLE attributes.
-- These functions will now bypass RLS on 'public.usuarios' when called from RLS policies,
-- ensuring they can always retrieve user profile information reliably.

-- Function to get the current authenticated user's ID from the 'usuarios' table.
CREATE OR REPLACE FUNCTION public.get_my_user_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_id uuid;
BEGIN
  SELECT id INTO user_id FROM public.usuarios WHERE auth_id = auth.uid();
  RETURN user_id;
END;
$$;

-- Function to check if the current authenticated user has the 'ADMIN' profile and is active.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.usuarios WHERE auth_id = auth.uid() AND perfil = 'ADMIN' AND ativo = TRUE);
END;
$$;

-- Function to check if the current authenticated user has the 'OUVIDOR' profile and is active.
CREATE OR REPLACE FUNCTION public.is_ouvidor()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.usuarios WHERE auth_id = auth.uid() AND perfil = 'OUVIDOR' AND ativo = TRUE);
END;
$$;

-- 2. Ensure RLS is enabled on the 'anexos' table.
ALTER TABLE public.anexos ENABLE ROW LEVEL SECURITY;

-- 3. Drop ALL existing RLS policies for 'anexos' to prevent any conflicts.
-- This step is crucial to ensure a clean slate before applying the new policies.
DROP POLICY IF EXISTS "Allow authenticated users to insert anexos" ON public.anexos;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own attachments" ON public.anexos;
DROP POLICY IF EXISTS "Usuários autorizados podem criar anexos" ON public.anexos;
DROP POLICY IF EXISTS "Anexos: Permitir INSERT por usuário autenticado" ON public.anexos;

DROP POLICY IF EXISTS "Allow authenticated users to view their own anexos" ON public.anexos;
DROP POLICY IF EXISTS "Allow authenticated users to view their own or associated manif" ON public.anexos;
DROP POLICY IF EXISTS "Anexos visíveis para usuários autenticados" ON public.anexos;
DROP POLICY IF EXISTS "Admins and Ouvidores can view all anexos" ON public.anexos;
DROP POLICY IF EXISTS "Anexos: Permitir SELECT de próprios anexos" ON public.anexos;
DROP POLICY IF EXISTS "Anexos: Admins e Ouvidores podem ver todos" ON public.anexos;

DROP POLICY IF EXISTS "Allow authenticated users to delete their own attachments" ON public.anexos;
DROP POLICY IF EXISTS "Admins and Ouvidores can delete any anexos" ON public.anexos;
DROP POLICY IF EXISTS "Anexos: Permitir DELETE de próprios anexos" ON public.anexos;
DROP POLICY IF EXISTS "Anexos: Admins e Ouvidores podem deletar todos" ON public.anexos;


-- 4. Create new, consolidated RLS policies for 'anexos'.
-- These policies now correctly rely on the SECURITY DEFINER helper functions.

-- Policy for INSERT: Allow authenticated users to insert if upload_por_id matches their user ID.
CREATE POLICY "Anexos: Permitir INSERT por usuário autenticado"
ON public.anexos FOR INSERT
TO authenticated
WITH CHECK (
  upload_por_id = public.get_my_user_id()
);

-- Policy for SELECT (own): Allow authenticated users to view their own anexos.
CREATE POLICY "Anexos: Permitir SELECT de próprios anexos"
ON public.anexos FOR SELECT
TO authenticated
USING (
  upload_por_id = public.get_my_user_id()
);

-- Policy for SELECT (admin/ouvidor): Allow ADMIN and OUVIDOR to view all anexos.
CREATE POLICY "Anexos: Admins e Ouvidores podem ver todos"
ON public.anexos FOR SELECT
TO authenticated
USING (
  public.is_admin() OR public.is_ouvidor()
);

-- Policy for DELETE (own): Allow authenticated users to delete their own anexos.
CREATE POLICY "Anexos: Permitir DELETE de próprios anexos"
ON public.anexos FOR DELETE
TO authenticated
USING (
  upload_por_id = public.get_my_user_id()
);

-- Policy for DELETE (admin/ouvidor): Allow ADMIN and OUVIDOR to delete any anexos.
CREATE POLICY "Anexos: Admins e Ouvidores podem deletar todos"
ON public.anexos FOR DELETE
TO authenticated
USING (
  public.is_admin() OR public.is_ouvidor()
);