-- Substitua 'SEU_AUTH_UID_AQUI' pelo auth_id do usuário que está logado no frontend
SELECT
    id,
    auth_id,
    email,
    nome,
    perfil,
    ativo
FROM public.usuarios
WHERE auth_id = 'SEU_AUTH_UID_AQUI';

-- Exemplo: SELECT id, auth_id, email, nome, perfil, ativo FROM public.usuarios WHERE auth_id = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';