-- 1. Cria a função que será executada pelo trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (auth_id, email, nome, perfil)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'nome',
    (NEW.raw_user_meta_data->>'perfil')::public.perfil_usuario
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Remove o trigger existente (se houver) para evitar duplicação
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Cria o trigger que chama a função após cada inserção em auth.users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();