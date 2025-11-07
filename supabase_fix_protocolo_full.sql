-- 1. Garante que a sequência para o protocolo exista e esteja configurada corretamente
CREATE SEQUENCE IF NOT EXISTS public.protocolo_sequencial_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 999999
    CACHE 1;

-- 2. Cria ou substitui a função gerar_protocolo com variáveis locais explícitas
CREATE OR REPLACE FUNCTION public.gerar_protocolo()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_ano TEXT;
    v_sequencial BIGINT; -- Usando prefixo 'v_' para evitar qualquer ambiguidade
    v_protocolo TEXT;
BEGIN
    v_ano := TO_CHAR(NOW(), 'YYYY');
    SELECT nextval('public.protocolo_sequencial_seq') INTO v_sequencial;
    v_protocolo := 'OUV-' || v_ano || '-' || LPAD(v_sequencial::TEXT, 6, '0');
    RETURN v_protocolo;
END;
$$;

-- 3. Cria ou substitui a função de trigger que chama gerar_protocolo
CREATE OR REPLACE FUNCTION public.set_manifestacao_protocolo_trigger_func()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Verifica se o protocolo já foi definido (pode ser preenchido manualmente em alguns casos)
    IF NEW.protocolo IS NULL OR NEW.protocolo = '' THEN
        NEW.protocolo := public.gerar_protocolo();
    END IF;
    RETURN NEW;
END;
$$;

-- 4. Remove o trigger existente (se houver) e o recria para usar a nova função
DROP TRIGGER IF EXISTS set_protocolo_on_manifestacao ON public.manifestacoes;
CREATE TRIGGER set_protocolo_on_manifestacao
BEFORE INSERT ON public.manifestacoes
FOR EACH ROW EXECUTE FUNCTION public.set_manifestacao_protocolo_trigger_func();

-- 5. Remove qualquer valor DEFAULT da coluna 'protocolo' para garantir que o trigger seja a única fonte
ALTER TABLE public.manifestacoes ALTER COLUMN protocolo DROP DEFAULT;

-- Opcional: Se você quiser que a coluna 'protocolo' tenha um DEFAULT caso o trigger não seja ativado por algum motivo,
-- você pode adicionar esta linha, mas o trigger é o método preferencial.
-- ALTER TABLE public.manifestacoes ALTER COLUMN protocolo SET DEFAULT public.gerar_protocolo();