-- 1. Garante que RLS esteja habilitado na tabela public.usuarios
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 2. Cria ou substitui a função is_admin() com as propriedades corretas
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE auth_id = auth.uid() AND perfil = 'ADMIN' AND ativo = TRUE
  );
$function$;

-- 3. Cria ou substitui a função is_ouvidor() com as propriedades corretas
CREATE OR REPLACE FUNCTION public.is_ouvidor()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE auth_id = auth.uid() AND perfil = 'OUVIDOR' AND ativo = TRUE
  );
$function$;

-- 4. Garante que RLS esteja habilitado na tabela manifestacoes
ALTER TABLE public.manifestacoes ENABLE ROW LEVEL SECURITY;

-- 5. Remove a política de UPDATE existente para manifestacoes, se houver, para evitar conflitos
DROP POLICY IF EXISTS "Allow ADMIN and OUVIDOR to update all manifestations" ON public.manifestacoes;

-- 6. Cria uma nova política que permite que usuários com perfil ADMIN ou OUVIDOR atualizem manifestações
CREATE POLICY "Allow ADMIN and OUVIDOR to update all manifestations"
ON public.manifestacoes
FOR UPDATE
TO authenticated
USING (
  public.is_admin() OR public.is_ouvidor()
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