-- Cria a sequência se ela ainda não existir
CREATE SEQUENCE IF NOT EXISTS public.protocolo_sequencial_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 999999
    CACHE 1;

-- Atualiza a função gerar_protocolo para usar a sequência de forma não ambígua
CREATE OR REPLACE FUNCTION public.gerar_protocolo()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    ano TEXT;
    sequencial_val BIGINT; -- Renomeado para evitar ambiguidade
    protocolo TEXT;
BEGIN
    ano := TO_CHAR(NOW(), 'YYYY');
    SELECT nextval('public.protocolo_sequencial_seq') INTO sequencial_val;
    protocolo := 'OUV-' || ano || '-' || LPAD(sequencial_val::TEXT, 6, '0');
    RETURN protocolo;
END;
$$;

-- Opcional: Se a coluna 'protocolo' na tabela 'manifestacoes' não tiver um DEFAULT que chame 'gerar_protocolo()',
-- você pode adicionar ou verificar se já existe um.
-- Exemplo: ALTER TABLE public.manifestacoes ALTER COLUMN protocolo SET DEFAULT public.gerar_protocolo();