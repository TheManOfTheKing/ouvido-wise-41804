-- FIX_RLS_FINAL_SOLUTION_CUSTOM.sql
-- Script de correção para funções e policies usadas por RLS na tabela public.usuarios
-- Objetivo: garantir que as funções auxiliares usadas em policies sejam STABLE + SECURITY DEFINER
-- e simplificar a policy de admin para evitar lógica contraditória.
-- Uso: Cole/execute no SQL Editor do Supabase com um role admin (Project SQL Editor).

-- =====================
-- 1) Diagnóstico (opcional)
-- =====================
-- Verifica volatilidade (volatility) e se a função é security definer
SELECT p.proname,
       p.provolatile AS volatility, -- i=immutable, s=stable, v=volatile
       p.prosecdef AS security_definer,
       pg_get_functiondef(p.oid) AS ddl
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN ('is_admin','get_my_user_id','get_my_sector_id','is_ouvidor','is_gestor','is_assistente','is_analista');

-- =====================
-- 2) (Opcional) Desabilitar RLS para diagnóstico
-- =====================
-- ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;

-- =====================
-- 3) Recriar funções auxiliares como STABLE + SECURITY DEFINER
-- =====================
-- is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE auth_id = auth.uid()
      AND perfil = 'ADMIN'::public.perfil_usuario
      AND ativo = true
  );
$$;

-- is_ouvidor
CREATE OR REPLACE FUNCTION public.is_ouvidor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE auth_id = auth.uid()
      AND perfil = 'OUVIDOR'::public.perfil_usuario
      AND ativo = true
  );
$$;

-- is_gestor
CREATE OR REPLACE FUNCTION public.is_gestor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE auth_id = auth.uid()
      AND perfil = 'GESTOR'::public.perfil_usuario
      AND ativo = true
  );
$$;

-- is_assistente
CREATE OR REPLACE FUNCTION public.is_assistente()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE auth_id = auth.uid()
      AND perfil = 'ASSISTENTE'::public.perfil_usuario
      AND ativo = true
  );
$$;

-- is_analista
CREATE OR REPLACE FUNCTION public.is_analista()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE auth_id = auth.uid()
      AND perfil = 'ANALISTA'::public.perfil_usuario
      AND ativo = true
  );
$$;

-- get_my_user_id
CREATE OR REPLACE FUNCTION public.get_my_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM public.usuarios WHERE auth_id = auth.uid() LIMIT 1;
$$;

-- get_my_sector_id
CREATE OR REPLACE FUNCTION public.get_my_sector_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT setor_id FROM public.usuarios WHERE auth_id = auth.uid() LIMIT 1;
$$;

-- =====================
-- 4) Corrigir / simplificar policy de admin
-- =====================
-- Substitui a lógica mista por uma checagem única usando public.is_admin().
DROP POLICY IF EXISTS usuarios_admin_all_access ON public.usuarios;

CREATE POLICY usuarios_admin_all_access
  ON public.usuarios
  FOR ALL
  TO authenticated
  USING ( public.is_admin() )
  WITH CHECK ( public.is_admin() );

-- =====================
-- 5) Garantir policies básicas (visualizar/insert/update próprio perfil)
-- =====================
-- View own profile
DROP POLICY IF EXISTS usuarios_view_own_profile ON public.usuarios;
CREATE POLICY usuarios_view_own_profile
  ON public.usuarios
  FOR SELECT
  TO authenticated
  USING ( auth_id = auth.uid() );

-- Insert own profile
DROP POLICY IF EXISTS usuarios_insert_own_profile ON public.usuarios;
CREATE POLICY usuarios_insert_own_profile
  ON public.usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK ( auth_id = auth.uid() );

-- Update own profile
DROP POLICY IF EXISTS usuarios_update_own_profile ON public.usuarios;
CREATE POLICY usuarios_update_own_profile
  ON public.usuarios
  FOR UPDATE
  TO authenticated
  USING ( auth_id = auth.uid() )
  WITH CHECK ( auth_id = auth.uid() );

-- =====================
-- 6) Reabilitar RLS na tabela (se estiver desabilitado)
-- =====================
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- =====================
-- 7) Testes rápidos sugeridos (copiar/colar no SQL Editor)
-- =====================
-- Confirmar que um perfil existe para um auth_id específico:
-- SELECT id, auth_id, nome, perfil, ativo FROM public.usuarios WHERE auth_id = 'SEU-AUTH-ID-AQUI';

-- Listar policies atuais
-- SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'usuarios' AND schemaname = 'public';

-- Fim do script
