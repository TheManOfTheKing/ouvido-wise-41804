-- PASSO 1: REMOVER trigger e função antigos para evitar conflitos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- PASSO 2: CRIAR a função handle_new_user() SIMPLIFICADA e segura (conforme sua solução)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_nome TEXT;
  user_perfil TEXT;
BEGIN
  -- Pegar nome e perfil do raw_user_meta_data
  user_nome := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'nome'), ''), 
    'Usuário'
  );
  
  user_perfil := UPPER(COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'perfil'), ''), 
    'ANALISTA'
  ));

  -- Log para debug
  RAISE NOTICE 'Criando usuário: email=%, nome=%, perfil=%', 
    NEW.email, user_nome, user_perfil;

  -- INSERT minimalista - apenas colunas essenciais
  INSERT INTO public.usuarios (
    auth_id,
    email,
    nome,
    perfil
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_nome,
    user_perfil::public.perfil_usuario
  );

  RETURN NEW;
  
EXCEPTION WHEN OTHERS THEN
  -- Log detalhado do erro
  RAISE WARNING 'Erro ao criar perfil do usuário %: %', NEW.email, SQLERRM;
  RAISE EXCEPTION 'Falha na criação do perfil: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASSO 3: CRIAR o trigger on_auth_user_created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- PASSO 4: REMOVER TODAS as políticas de RLS que dependem das funções has_any_role/has_role
-- Isso é crucial para permitir que as funções sejam dropadas.
-- As políticas são removidas com IF EXISTS para evitar erros caso já tenham sido removidas.
DROP POLICY IF EXISTS "Usuários autorizados podem criar encaminhamentos" ON public.encaminhamentos;
DROP POLICY IF EXISTS "Usuários autorizados podem atualizar encaminhamentos" ON public.encaminhamentos;
DROP POLICY IF EXISTS "Logs visíveis apenas para admins" ON public.logs_auditoria;
DROP POLICY IF EXISTS "manifestacoes_select_by_role" ON public.manifestacoes;
DROP POLICY IF EXISTS "manifestacoes_sigilosas_protection" ON public.manifestacoes;
DROP POLICY IF EXISTS "Usuários autorizados podem atualizar manifestações" ON public.manifestacoes;
DROP POLICY IF EXISTS "Apenas admins e ouvidores podem visualizar manifestantes" ON public.manifestantes;
DROP POLICY IF EXISTS "Apenas perfis autorizados podem atualizar manifestantes" ON public.manifestantes;
DROP POLICY IF EXISTS "Usuários autorizados podem criar planos de ação" ON public.planos_acao;
DROP POLICY IF EXISTS "Usuários autorizados podem atualizar planos de ação" ON public.planos_acao;
DROP POLICY IF EXISTS "Admins e Ouvidores podem ver todos usuários" ON public.usuarios;
DROP POLICY IF EXISTS "Allow authenticated users to view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins and Ouvidores can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins and Ouvidores can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to insert communications" ON public.comunicacoes;
DROP POLICY IF EXISTS "Allow authenticated users to view relevant communications" ON public.comunicacoes;
DROP POLICY IF EXISTS "Admins can manage all communications" ON public.comunicacoes;
DROP POLICY IF EXISTS "Allow authenticated users to view their own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.usuarios;
DROP POLICY IF EXISTS "Admins can manage all user profiles" ON public.usuarios;
-- Políticas adicionais identificadas no erro anterior
DROP POLICY IF EXISTS "Apenas admins podem deletar manifestações" ON public.manifestacoes;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar permissões" ON public.permissoes;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar setores" ON public.setores;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar roles" ON public.user_roles;
DROP POLICY IF EXISTS "Apenas admins podem criar usuários" ON public.usuarios;
DROP POLICY IF EXISTS "Apenas admins podem deletar usuários" ON public.usuarios;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar permissões de usuários" ON public.usuarios_permissoes;


-- PASSO 5: REMOVER funções RPC antigas que dependiam de 'user_roles'
DROP FUNCTION IF EXISTS public.has_any_role(public.app_role[], uuid);
DROP FUNCTION IF EXISTS public.has_role(public.app_role, uuid);
DROP FUNCTION IF EXISTS public.check_admin_users_exist(); -- Será recriada

-- PASSO 6: REMOVER a tabela 'user_roles'
DROP TABLE IF EXISTS public.user_roles;

-- PASSO 7: CRIAR uma nova função RPC para verificar administradores na tabela 'usuarios'
CREATE OR REPLACE FUNCTION public.check_admin_users_exist()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.usuarios WHERE perfil = 'ADMIN'::public.perfil_usuario);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASSO 8: CRIAR FUNÇÕES AUXILIARES PARA RLS (baseadas em perfil de usuário)
-- Remover funções auxiliares antigas se existirem, para garantir recriação limpa
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_ouvidor();
DROP FUNCTION IF EXISTS is_gestor();
DROP FUNCTION IF EXISTS is_assistente();
DROP FUNCTION IF EXISTS is_analista();
DROP FUNCTION IF EXISTS get_my_user_id();
DROP FUNCTION IF EXISTS get_my_sector_id();

CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN EXISTS (SELECT 1 FROM public.usuarios WHERE auth_id = auth.uid() AND perfil = 'ADMIN'::public.perfil_usuario); END; $$;
CREATE OR REPLACE FUNCTION is_ouvidor() RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN EXISTS (SELECT 1 FROM public.usuarios WHERE auth_id = auth.uid() AND perfil = 'OUVIDOR'::public.perfil_usuario); END; $$;
CREATE OR REPLACE FUNCTION is_gestor() RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN EXISTS (SELECT 1 FROM public.usuarios WHERE auth_id = auth.uid() AND perfil = 'GESTOR'::public.perfil_usuario); END; $$;
CREATE OR REPLACE FUNCTION is_assistente() RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN EXISTS (SELECT 1 FROM public.usuarios WHERE auth_id = auth.uid() AND perfil = 'ASSISTENTE'::public.perfil_usuario); END; $$;
CREATE OR REPLACE FUNCTION is_analista() RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN EXISTS (SELECT 1 FROM public.usuarios WHERE auth_id = auth.uid() AND perfil = 'ANALISTA'::public.perfil_usuario); END; $$;
CREATE OR REPLACE FUNCTION get_my_user_id() RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN (SELECT id FROM public.usuarios WHERE auth_id = auth.uid()); END; $$;
CREATE OR REPLACE FUNCTION get_my_sector_id() RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN (SELECT setor_id FROM public.usuarios WHERE auth_id = auth.uid()); END; $$;


-- PASSO 9: HABILITAR RLS E DEFINIR NOVAS POLÍTICAS PARA TODAS AS TABELAS AFETADAS

-- Tabela: public.usuarios
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view their own profile"
  ON public.usuarios FOR SELECT TO authenticated USING (auth_id = auth.uid());
CREATE POLICY "Allow authenticated users to insert their own profile"
  ON public.usuarios FOR INSERT TO authenticated WITH CHECK (auth_id = auth.uid());
CREATE POLICY "Allow authenticated users to update their own profile"
  ON public.usuarios FOR UPDATE TO authenticated USING (auth_id = auth.uid()) WITH CHECK (auth_id = auth.uid());
CREATE POLICY "Admins can manage all user profiles"
  ON public.usuarios FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Tabela: public.comunicacoes
ALTER TABLE public.comunicacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to insert communications"
  ON public.comunicacoes FOR INSERT TO authenticated WITH CHECK (usuario_id = get_my_user_id());
CREATE POLICY "Allow authenticated users to view all communications"
  ON public.comunicacoes FOR SELECT TO authenticated USING (TRUE); -- Simplificado, pode ser refinado
CREATE POLICY "Admins can manage all communications"
  ON public.comunicacoes FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Tabela: public.encaminhamentos
ALTER TABLE public.encaminhamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow relevant users to view encaminhamentos"
  ON public.encaminhamentos FOR SELECT TO authenticated
  USING (
    is_admin() OR is_ouvidor() OR is_gestor() OR
    (usuario_origem_id = get_my_user_id()) OR
    (usuario_destino_id = get_my_user_id()) OR
    (setor_origem_id = get_my_sector_id()) OR
    (setor_destino_id = get_my_sector_id())
  );
CREATE POLICY "Allow relevant users to insert encaminhamentos"
  ON public.encaminhamentos FOR INSERT TO authenticated
  WITH CHECK (is_admin() OR is_ouvidor() OR is_assistente());
CREATE POLICY "Allow relevant users to update encaminhamentos"
  ON public.encaminhamentos FOR UPDATE TO authenticated
  USING (is_admin() OR is_ouvidor() OR is_assistente() OR usuario_origem_id = get_my_user_id())
  WITH CHECK (is_admin() OR is_ouvidor() OR is_assistente() OR usuario_origem_id = get_my_user_id());
CREATE POLICY "Admins can delete encaminhamentos"
  ON public.encaminhamentos FOR DELETE TO authenticated USING (is_admin());

-- Tabela: public.logs_auditoria
ALTER TABLE public.logs_auditoria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs"
  ON public.logs_auditoria FOR SELECT TO authenticated USING (is_admin());

-- Tabela: public.manifestacoes
ALTER TABLE public.manifestacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow relevant users to view manifestacoes"
  ON public.manifestacoes FOR SELECT TO authenticated
  USING (
    is_admin() OR is_ouvidor() OR is_gestor() OR
    (responsavel_id = get_my_user_id()) OR
    (setor_responsavel_id = get_my_sector_id()) OR
    (NOT sigilosa AND NOT anonima) -- Public manifestações for all authenticated
  );
CREATE POLICY "Allow public to insert manifestacoes"
  ON public.manifestacoes FOR INSERT TO anon, authenticated WITH CHECK (TRUE); -- Qualquer um pode criar
CREATE POLICY "Allow relevant users to update manifestacoes"
  ON public.manifestacoes FOR UPDATE TO authenticated
  USING (
    is_admin() OR is_ouvidor() OR is_gestor() OR
    (responsavel_id = get_my_user_id()) OR
    (setor_responsavel_id = get_my_sector_id() AND (is_assistente() OR is_analista()))
  )
  WITH CHECK (
    is_admin() OR is_ouvidor() OR is_gestor() OR
    (responsavel_id = get_my_user_id()) OR
    (setor_responsavel_id = get_my_sector_id() AND (is_assistente() OR is_analista()))
  );
CREATE POLICY "Admins can delete manifestacoes"
  ON public.manifestacoes FOR DELETE TO authenticated USING (is_admin());

-- Tabela: public.manifestantes
ALTER TABLE public.manifestantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to insert manifestantes"
  ON public.manifestantes FOR INSERT TO anon, authenticated WITH CHECK (TRUE);
CREATE POLICY "Admins and Ouvidores can view manifestantes"
  ON public.manifestantes FOR SELECT TO authenticated USING (is_admin() OR is_ouvidor());
CREATE POLICY "Admins and Ouvidores can update manifestantes"
  ON public.manifestantes FOR UPDATE TO authenticated USING (is_admin() OR is_ouvidor()) WITH CHECK (is_admin() OR is_ouvidor());
CREATE POLICY "Admins can delete manifestantes"
  ON public.manifestantes FOR DELETE TO authenticated USING (is_admin());

-- Tabela: public.planos_acao
ALTER TABLE public.planos_acao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow relevant users to view planos_acao"
  ON public.planos_acao FOR SELECT TO authenticated
  USING (
    is_admin() OR is_ouvidor() OR is_gestor() OR
    (responsavel_id = get_my_user_id()) OR
    (setor_id = get_my_sector_id())
  );
CREATE POLICY "Allow relevant users to insert planos_acao"
  ON public.planos_acao FOR INSERT TO authenticated
  WITH CHECK (is_admin() OR is_ouvidor() OR is_assistente() OR is_gestor());
CREATE POLICY "Allow relevant users to update planos_acao"
  ON public.planos_acao FOR UPDATE TO authenticated
  USING (
    is_admin() OR is_ouvidor() OR is_gestor() OR
    (responsavel_id = get_my_user_id()) OR
    (setor_id = get_my_sector_id() AND (is_assistente() OR is_analista()))
  )
  WITH CHECK (
    is_admin() OR is_ouvidor() OR is_gestor() OR
    (responsavel_id = get_my_user_id()) OR
    (setor_id = get_my_sector_id() AND (is_assistente() OR is_analista()))
  );
CREATE POLICY "Admins can delete planos_acao"
  ON public.planos_acao FOR DELETE TO authenticated USING (is_admin());

-- Tabela: public.permissoes
ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all permissions"
  ON public.permissoes FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins can manage permissions"
  ON public.permissoes FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Tabela: public.setores
ALTER TABLE public.setores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and Ouvidores can view all sectors"
  ON public.setores FOR SELECT TO authenticated USING (is_admin() OR is_ouvidor());
CREATE POLICY "Admins can manage sectors"
  ON public.setores FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Tabela: public.usuarios_permissoes
ALTER TABLE public.usuarios_permissoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all user permissions"
  ON public.usuarios_permissoes FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins can manage user permissions"
  ON public.usuarios_permissoes FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());