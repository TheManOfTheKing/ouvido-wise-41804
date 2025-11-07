CREATE OR REPLACE FUNCTION public.get_my_user_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_id uuid;
BEGIN
  SELECT id INTO user_id FROM public.usuarios WHERE auth_id = auth.uid();
  RETURN user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_perfil text;
BEGIN
  SELECT perfil INTO user_perfil FROM public.usuarios WHERE auth_id = auth.uid();
  RETURN user_perfil = 'ADMIN';
END;
$$;

-- Grant usage to authenticated role
GRANT EXECUTE ON FUNCTION public.get_my_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;