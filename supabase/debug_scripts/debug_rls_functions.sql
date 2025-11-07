-- Verifica a definição da função is_admin()
SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'is_admin';

-- Verifica a definição da função is_ouvidor()
SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'is_ouvidor';

-- Verifica a definição da função get_my_user_id()
SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'get_my_user_id';