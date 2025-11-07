-- 1. Desabilitar RLS temporariamente para limpar políticas antigas (se houver)
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Allow authenticated users to view their own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Admins can manage all user profiles" ON public.usuarios;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.usuarios; -- Caso exista uma política genérica

-- 3. Habilitar RLS na tabela public.usuarios
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 4. Política para permitir que usuários autenticados vejam seu próprio perfil
CREATE POLICY "Allow authenticated users to view their own profile"
ON public.usuarios
FOR SELECT
TO authenticated
USING (auth_id = auth.uid());

-- 5. Política para permitir que usuários autenticados insiram seu próprio perfil (durante o registro)
CREATE POLICY "Allow authenticated users to insert their own profile"
ON public.usuarios
FOR INSERT
TO authenticated
WITH CHECK (auth_id = auth.uid());

-- 6. Política para permitir que usuários autenticados atualizem seu próprio perfil
CREATE POLICY "Allow authenticated users to update their own profile"
ON public.usuarios
FOR UPDATE
TO authenticated
USING (auth_id = auth.uid())
WITH CHECK (auth_id = auth.uid());

-- 7. Política para permitir que administradores gerenciem todos os perfis de usuário
-- Esta política usa a função is_admin() que já existe no seu banco de dados.
CREATE POLICY "Admins can manage all user profiles"
ON public.usuarios
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());