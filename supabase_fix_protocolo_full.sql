-- Desativar o trigger temporariamente se ele estiver ativo e causando problemas
-- DROP TRIGGER IF EXISTS set_protocolo_on_manifestacao ON public.manifestacoes;

-- 1. Remover o trigger existente (se houver)
DROP TRIGGER IF EXISTS set_protocolo_on_manifestacao ON public.manifestacoes;

-- 2. Remover a função de trigger (se houver)
DROP FUNCTION IF EXISTS public.set_manifestacao_protocolo_trigger_func();

-- 3. Remover a função gerar_protocolo (se houver)
DROP FUNCTION IF EXISTS public.gerar_protocolo();

-- 4. Recriar a função para gerar o protocolo
CREATE OR REPLACE FUNCTION public.gerar_protocolo()
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
    v_ano TEXT;
    v_sequencial INT;
    v_protocolo TEXT;
BEGIN
    v_ano := TO_CHAR(CURRENT_DATE, 'YYYY');

    -- Bloqueia a tabela para evitar condições de corrida
    LOCK TABLE public.manifestacoes IN EXCLUSIVE MODE;

    -- Obtém o último sequencial para o ano atual
    SELECT COALESCE(MAX(SUBSTRING(protocolo FROM 6 FOR 6)::INT), 0)
    INTO v_sequencial
    FROM public.manifestacoes
    WHERE SUBSTRING(protocolo FROM 1 FOR 4) = v_ano;

    v_sequencial := v_sequencial + 1;

    -- Formata o protocolo
    v_protocolo := 'OUV-' || v_ano || '-' || LPAD(v_sequencial::TEXT, 6, '0');

    RETURN v_protocolo;
END;
$function$;

-- 5. Recriar a função de trigger que chama gerar_protocolo
CREATE OR REPLACE FUNCTION public.set_manifestacao_protocolo_trigger_func()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
BEGIN
    IF NEW.protocolo IS NULL OR NEW.protocolo = '' THEN
        NEW.protocolo := public.gerar_protocolo();
    END IF;
    RETURN NEW;
END;
$function$;

-- 6. Recriar o trigger para atribuir o protocolo antes da inserção
CREATE OR REPLACE TRIGGER set_protocolo_on_manifestacao
BEFORE INSERT ON public.manifestacoes
FOR EACH ROW EXECUTE FUNCTION public.set_manifestacao_protocolo_trigger_func();

-- 7. Garantir que a coluna 'protocolo' não tenha um valor DEFAULT
ALTER TABLE public.manifestacoes ALTER COLUMN protocolo DROP DEFAULT;