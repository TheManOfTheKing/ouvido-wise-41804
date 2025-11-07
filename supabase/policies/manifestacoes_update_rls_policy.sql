-- Habilita RLS na tabela manifestacoes, se ainda não estiver habilitado
ALTER TABLE public.manifestacoes ENABLE ROW LEVEL SECURITY;

-- Remove a política de UPDATE existente para manifestacoes, se houver, para evitar conflitos
DROP POLICY IF EXISTS "Allow ADMIN and OUVIDOR to update all manifestations" ON public.manifestacoes;

-- Cria uma nova política que permite que usuários com perfil ADMIN ou OUVIDOR atualizem manifestações
CREATE POLICY "Allow ADMIN and OUVIDOR to update all manifestations"
ON public.manifestacoes
FOR UPDATE
TO authenticated
USING (
  (
    SELECT perfil FROM public.usuarios
    WHERE auth_id = auth.uid()
  ) IN ('ADMIN', 'OUVIDOR')
);

-- Opcional: Adicione uma política para que o responsável atual possa atualizar sua própria manifestação
-- DROP POLICY IF EXISTS "Allow responsible user to update their assigned manifestation" ON public.manifestacoes;
-- CREATE POLICY "Allow responsible user to update their assigned manifestation"
-- ON public.manifestacoes
-- FOR UPDATE
-- TO authenticated
-- USING (
--   (
--     SELECT id FROM public.usuarios
--     WHERE auth_id = auth.uid()
--   ) = responsavel_id
-- );