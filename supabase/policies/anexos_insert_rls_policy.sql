-- Habilitar RLS na tabela 'anexos' se ainda não estiver habilitado
ALTER TABLE public.anexos ENABLE ROW LEVEL SECURITY;

-- Remover qualquer política de INSERT existente para 'anexos' para evitar conflitos
DROP POLICY IF EXISTS "Allow authenticated users to insert anexos" ON public.anexos;

-- Criar política para permitir que usuários autenticados insiram anexos
-- O 'upload_por_id' deve ser o ID do usuário logado na tabela 'usuarios'
CREATE POLICY "Allow authenticated users to insert anexos"
ON public.anexos FOR INSERT
TO authenticated
WITH CHECK (
  upload_por_id = (SELECT id FROM public.usuarios WHERE auth_id = auth.uid())
);

-- Opcional: Adicionar política para permitir que usuários autenticados visualizem seus próprios anexos
-- Isso é importante para que os anexos apareçam na interface após o upload
DROP POLICY IF EXISTS "Allow authenticated users to view their own anexos" ON public.anexos;

CREATE POLICY "Allow authenticated users to view their own anexos"
ON public.anexos FOR SELECT
TO authenticated
USING (
  upload_por_id = (SELECT id FROM public.usuarios WHERE auth_id = auth.uid())
);

-- Opcional: Adicionar política para permitir que usuários ADMIN e OUVIDOR vejam todos os anexos
DROP POLICY IF EXISTS "Admins and Ouvidores can view all anexos" ON public.anexos;

CREATE POLICY "Admins and Ouvidores can view all anexos"
ON public.anexos FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE auth_id = auth.uid() AND perfil IN ('ADMIN', 'OUVIDOR'))
);

-- Opcional: Adicionar política para permitir que usuários ADMIN e OUVIDOR deletem anexos
DROP POLICY IF EXISTS "Admins and Ouvidores can delete any anexos" ON public.anexos;

CREATE POLICY "Admins and Ouvidores can delete any anexos"
ON public.anexos FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE auth_id = auth.uid() AND perfil IN ('ADMIN', 'OUVIDOR'))
);