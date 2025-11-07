CREATE OR REPLACE FUNCTION public.check_admin_users_exist()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Esta função será executada com os privilégios do usuário que a criou (geralmente supabase_admin), ignorando RLS para esta consulta específica.
AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(id)
  INTO admin_count
  FROM public.usuarios
  WHERE perfil = 'ADMIN';

  RETURN admin_count > 0;
END;
$$;

-- Concede permissão de execução para as roles 'anon' e 'authenticated'
GRANT EXECUTE ON FUNCTION public.check_admin_users_exist() TO anon, authenticated;