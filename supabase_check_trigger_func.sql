SELECT pg_get_functiondef(f.oid)
FROM pg_proc f
JOIN pg_namespace n ON n.oid = f.pronamespace
WHERE f.proname = 'set_manifestacao_protocolo_trigger_func' AND n.nspname = 'public';