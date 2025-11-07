-- Verifica se RLS está habilitado na tabela manifestacoes
SELECT relrowsecurity FROM pg_class WHERE relname = 'manifestacoes';

-- Lista todas as políticas de RLS para a tabela manifestacoes
SELECT
    polname AS policy_name,
    CASE
        WHEN polpermissive THEN 'PERMISSIVE'
        ELSE 'RESTRICTIVE'
    END AS policy_type,
    pg_get_expr(polqual, polrelid) AS using_expression,
    pg_get_expr(polwithcheck, polrelid) AS with_check_expression,
    (SELECT array_agg(rolname) FROM pg_roles WHERE oid = ANY(polroles)) AS roles,
    CASE polcmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
    END AS command
FROM pg_policy
WHERE polrelid = (SELECT oid FROM pg_class WHERE relname = 'manifestacoes');