SELECT tgname, pg_get_triggerdef(t.oid)
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'manifestacoes' AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');