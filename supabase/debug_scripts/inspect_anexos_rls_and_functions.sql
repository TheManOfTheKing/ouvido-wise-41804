-- 1. Verificar se RLS está habilitado na tabela 'anexos'
SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'anexos';

-- 2. Listar todas as políticas RLS para a tabela 'anexos'
SELECT
    polname AS policy_name,
    p.polpermissive AS permissive,
    CASE p.polcmd -- CORREÇÃO AQUI: Usar p.polcmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
    END AS command,
    qual AS using_expression,
    with_check AS with_check_expression,
    rolname AS roles
FROM pg_policy p
JOIN pg_class c ON p.polrelid = c.oid
LEFT JOIN pg_roles r ON p.polroles @> ARRAY[r.oid]
WHERE c.relname = 'anexos';

-- 3. Mostrar a definição da função public.get_my_user_id()
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'get_my_user_id'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 4. Mostrar a definição da função public.is_admin()
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'is_admin'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 5. Mostrar a definição da função public.get_my_sector_id()
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'get_my_sector_id'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');