-- Garante que RLS esteja habilitado na tabela manifestacoes
ALTER TABLE public.manifestacoes ENABLE ROW LEVEL SECURITY;

-- Remove a política de DELETE existente para manifestacoes, se houver, para evitar conflitos
DROP POLICY IF EXISTS "Allow ADMIN and OUVIDOR to delete all manifestations" ON public.manifestacoes;

-- Cria uma nova política que permite que usuários com perfil ADMIN ou OUVIDOR excluam manifestações
CREATE POLICY "Allow ADMIN and OUVIDOR to delete all manifestations"
ON public.manifestacoes
FOR DELETE
TO authenticated
USING (
  public.is_admin() OR public.is_ouvidor()
);