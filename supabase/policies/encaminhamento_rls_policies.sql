-- Enable RLS for encaminhamentos table if not already enabled (idempotent)
ALTER TABLE public.encaminhamentos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for encaminhamentos that might conflict
DROP POLICY IF EXISTS "Ouvidor_Admin can insert encaminhamentos" ON public.encaminhamentos;
DROP POLICY IF EXISTS "Allow authenticated read access to encaminhamentos" ON public.encaminhamentos;

-- Policy for OUVIDOR or ADMIN to insert into encaminhamentos
CREATE POLICY "Ouvidor_Admin can insert encaminhamentos" ON public.encaminhamentos
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (public.is_ouvidor() OR public.is_admin());

-- Policy to allow authenticated users to read encaminhamentos related to their sector or if they are admin/ouvidor
CREATE POLICY "Allow authenticated read access to encaminhamentos" ON public.encaminhamentos
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
    public.is_admin() OR
    public.is_ouvidor() OR
    setor_origem_id = public.get_my_sector_id() OR
    setor_destino_id = public.get_my_sector_id() OR
    usuario_origem_id = public.get_my_user_id() OR
    usuario_destino_id = public.get_my_user_id()
);