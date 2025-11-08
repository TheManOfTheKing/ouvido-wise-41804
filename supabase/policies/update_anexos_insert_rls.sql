-- Update RLS policy for INSERT on 'anexos' table.
-- This policy will now explicitly allow ADMIN and OUVIDOR roles to insert,
-- in addition to allowing any authenticated user to insert their own files.

-- Drop the existing INSERT policy to replace it with an updated version.
DROP POLICY IF EXISTS "Anexos: Permitir INSERT por usuário autenticado" ON public.anexos;

-- Create a new, more robust INSERT policy.
-- It allows insertion if:
-- 1. The 'upload_por_id' matches the current authenticated user's ID (for regular users).
-- OR
-- 2. The current authenticated user is an ADMIN or an OUVIDOR (granting them broader insert permissions).
CREATE POLICY "Anexos: Permitir INSERT por usuário autenticado"
ON public.anexos FOR INSERT
TO authenticated
WITH CHECK (
  upload_por_id = public.get_my_user_id() OR public.is_admin() OR public.is_ouvidor()
);

-- Re-confirm RLS is enabled (should already be from previous script, but good practice).
ALTER TABLE public.anexos ENABLE ROW LEVEL SECURITY;