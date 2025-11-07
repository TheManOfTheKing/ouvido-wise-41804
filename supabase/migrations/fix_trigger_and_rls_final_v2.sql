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

-- PASSO 4: REMOVER TODAS as políticas de RLS existentes relacionadas a 'user_roles'
DROP POLICY IF EXISTS "Allow authenticated users to view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins and Ouvidores can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins and Ouvidores can manage user roles" ON public.user_roles;

-- PASSO 5: REMOVER a tabela 'user_roles'
DROP TABLE IF EXISTS public.user_roles;

-- PASSO 6: REMOVER funções RPC antigas que dependiam de 'user_roles'
DROP FUNCTION IF EXISTS public.check_admin_users_exist();
DROP FUNCTION IF EXISTS public.has_any_role(public.app_role[], uuid);
DROP FUNCTION IF EXISTS public.has_role(public.app_role, uuid);

-- PASSO 7: CRIAR uma nova função RPC para verificar administradores na tabela 'usuarios'
CREATE OR REPLACE FUNCTION public.check_admin_users_exist()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.usuarios WHERE perfil = 'ADMIN'::public.perfil_usuario);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASSO 8: Reafirmar as políticas de RLS para 'usuarios'
-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Allow authenticated users to view their own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.usuarios;
DROP POLICY IF EXISTS "Admins can manage all user profiles" ON public.usuarios;

-- Habilitar RLS para a tabela 'usuarios' (se ainda não estiver)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Permitir que usuários autenticados vejam seu próprio perfil
CREATE POLICY "Allow authenticated users to view their own profile"
  ON public.usuarios
  FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid());

-- Permitir que usuários autenticados insiram seu próprio perfil
CREATE POLICY "Allow authenticated users to insert their own profile"
  ON public.usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_id = auth.uid());

-- Permitir que usuários autenticados atualizem seu próprio perfil
CREATE POLICY "Allow authenticated users to update their own profile"
  ON public.usuarios
  FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- Permitir que administradores (perfil ADMIN na tabela usuarios) vejam todos os perfis
CREATE POLICY "Admins can view all user profiles"
  ON public.usuarios
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE auth_id = auth.uid() AND perfil = 'ADMIN'::public.perfil_usuario
    )
  );

-- Permitir que administradores (perfil ADMIN na tabela usuarios) gerenciem (insert, update, delete) outros perfis
CREATE POLICY "Admins can manage all user profiles"
  ON public.usuarios
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE auth_id = auth.uid() AND perfil = 'ADMIN'::public.perfil_usuario
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE auth_id = auth.uid() AND perfil = 'ADMIN'::public.perfil_usuario
    )
  );

-- PASSO 9: Definir RLS para 'comunicacoes'
-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Allow authenticated users to insert communications" ON public.comunicacoes;
DROP POLICY IF EXISTS "Allow authenticated users to view relevant communications" ON public.comunicacoes;
DROP POLICY IF EXISTS "Admins can manage all communications" ON public.comunicacoes;

-- Habilitar RLS para a tabela 'comunicacoes' (se ainda não estiver)
ALTER TABLE public.comunicacoes ENABLE ROW LEVEL SECURITY;

-- Permitir que usuários autenticados insiram comunicações
CREATE POLICY "Allow authenticated users to insert communications"
  ON public.comunicacoes
  FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = (SELECT id FROM public.usuarios WHERE auth_id = auth.uid()));

-- Permitir que usuários autenticados vejam todas as comunicações (para simplificar, pode ser refinado depois)
CREATE POLICY "Allow authenticated users to view all communications"
  ON public.comunicacoes
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Permitir que administradores gerenciem todas as comunicações
CREATE POLICY "Admins can manage all communications"
  ON public.comunicacoes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE auth_id = auth.uid() AND perfil = 'ADMIN'::public.perfil_usuario
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE auth_id = auth.uid() AND perfil = 'ADMIN'::public.perfil_usuario
    )
  );