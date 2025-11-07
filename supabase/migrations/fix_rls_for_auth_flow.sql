-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Administrators and Ouvidores can manage all users" ON public.usuarios;
DROP POLICY IF EXISTS "Authenticated users can view their own user profile" ON public.usuarios;
DROP POLICY IF EXISTS "Administrators and Ouvidores can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users can view their own roles" ON public.user_roles;

-- Habilitar RLS para a tabela 'usuarios' (se ainda não estiver)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Novas políticas para 'usuarios':
-- 1. Permitir que usuários autenticados vejam seu próprio perfil
CREATE POLICY "Authenticated users can view their own profile"
  ON public.usuarios
  FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid());

-- 2. Permitir que administradores e ouvidores vejam todos os perfis
CREATE POLICY "Admins and Ouvidores can view all user profiles"
  ON public.usuarios
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = ANY(ARRAY['admin'::app_role, 'ouvidor'::app_role])
    )
  );

-- 3. Permitir que usuários autenticados insiram seu próprio perfil (para auto-criação no useAuth)
CREATE POLICY "Authenticated users can insert their own profile"
  ON public.usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_id = auth.uid());

-- 4. Permitir que administradores e ouvidores insiram novos perfis
CREATE POLICY "Admins and Ouvidores can insert user profiles"
  ON public.usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = ANY(ARRAY['admin'::app_role, 'ouvidor'::app_role])
    )
  );

-- 5. Permitir que usuários autenticados atualizem seu próprio perfil
CREATE POLICY "Authenticated users can update their own profile"
  ON public.usuarios
  FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- 6. Permitir que administradores e ouvidores atualizem todos os perfis
CREATE POLICY "Admins and Ouvidores can update all user profiles"
  ON public.usuarios
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = ANY(ARRAY['admin'::app_role, 'ouvidor'::app_role])
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = ANY(ARRAY['admin'::app_role, 'ouvidor'::app_role])
    )
  );

-- 7. Permitir que administradores deletem perfis
CREATE POLICY "Admins can delete user profiles"
  ON public.usuarios
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

-- Habilitar RLS para a tabela 'user_roles' (se ainda não estiver)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Novas políticas para 'user_roles':
-- 1. Permitir que usuários autenticados vejam suas próprias roles
CREATE POLICY "Authenticated users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 2. Permitir que administradores e ouvidores vejam todas as roles
CREATE POLICY "Admins and Ouvidores can view all user roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = ANY(ARRAY['admin'::app_role, 'ouvidor'::app_role])
    )
  );

-- 3. Permitir que administradores e ouvidores insiram, atualizem e deletem roles
CREATE POLICY "Admins and Ouvidores can manage user roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = ANY(ARRAY['admin'::app_role, 'ouvidor'::app_role])
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = ANY(ARRAY['admin'::app_role, 'ouvidor'::app_role])
    )
  );