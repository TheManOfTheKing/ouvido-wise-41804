-- Habilitar RLS na tabela anexos
ALTER TABLE public.anexos ENABLE ROW LEVEL SECURITY;

-- 1. Política para SELECT (visualização)
-- Permite que usuários autenticados vejam anexos se:
-- - São administradores ou ouvidores (podem ver tudo)
-- - O anexo foi carregado por eles
-- - O anexo está associado a uma manifestação que eles podem visualizar (responsável ou setor responsável)
CREATE POLICY "Allow authenticated users to view their own or associated manifestacao attachments"
ON public.anexos FOR SELECT
USING (
  (public.is_admin()) OR
  (public.is_ouvidor()) OR
  (upload_por_id = public.get_my_user_id()) OR
  (EXISTS (
    SELECT 1 FROM public.manifestacoes m
    WHERE m.id = anexos.manifestacao_id
    AND (
      public.is_admin() OR
      public.is_ouvidor() OR
      m.responsavel_id = public.get_my_user_id() OR
      m.setor_responsavel_id = public.get_my_sector_id()
    )
  ))
);

-- 2. Política para INSERT (upload)
-- Permite que usuários autenticados insiram anexos, desde que o 'upload_por_id' seja o ID do próprio usuário.
CREATE POLICY "Allow authenticated users to insert their own attachments"
ON public.anexos FOR INSERT
WITH CHECK (upload_por_id = public.get_my_user_id());

-- 3. Política para DELETE (exclusão)
-- Permite que usuários autenticados deletem anexos que eles mesmos carregaram.
CREATE POLICY "Allow authenticated users to delete their own attachments"
ON public.anexos FOR DELETE
USING (upload_por_id = public.get_my_user_id());

-- Opcional: Política para UPDATE (se houver necessidade de editar metadados do anexo)
-- Por enquanto, não é estritamente necessário, mas pode ser adicionado se a funcionalidade surgir.
-- CREATE POLICY "Allow authenticated users to update their own attachments"
-- ON public.anexos FOR UPDATE
-- USING (upload_por_id = public.get_my_user_id())
-- WITH CHECK (upload_por_id = public.get_my_user_id());