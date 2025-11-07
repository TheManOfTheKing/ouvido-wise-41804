-- 1. Remove o trigger existente (se houver)
DROP TRIGGER IF EXISTS set_protocolo_manifestacoes ON public.manifestacoes;
DROP TRIGGER IF EXISTS set_protocolo ON public.manifestacoes; -- Adicionado para cobrir um nome de trigger alternativo

-- 2. Remove a função existente com CASCADE para remover quaisquer dependências
DROP FUNCTION IF EXISTS public.gerar_protocolo() CASCADE;
DROP FUNCTION IF EXISTS public.set_manifestacao_protocolo_trigger_func() CASCADE; -- Adicionado para cobrir um nome de função alternativo

-- 3. Recria a tabela protocolo_sequencial se ela não existir
CREATE TABLE IF NOT EXISTS public.protocolo_sequencial (
    ano text NOT NULL,
    sequencial integer NOT NULL,
    CONSTRAINT protocolo_sequencial_pkey PRIMARY KEY (ano)
);

-- 4. Insere o ano atual se não existir, começando o sequencial em 0
INSERT INTO public.protocolo_sequencial (ano, sequencial)
VALUES (EXTRACT(YEAR FROM CURRENT_DATE)::text, 0)
ON CONFLICT (ano) DO NOTHING;

-- 5. Recria a função para gerar o protocolo
CREATE OR REPLACE FUNCTION public.gerar_protocolo()
RETURNS TRIGGER AS $$
DECLARE
    current_year TEXT;
    next_sequencial INT;
BEGIN
    current_year := EXTRACT(YEAR FROM NEW.data_recebimento)::text;

    -- Garante que o registro para o ano atual exista
    INSERT INTO public.protocolo_sequencial (ano, sequencial)
    VALUES (current_year, 0)
    ON CONFLICT (ano) DO NOTHING;

    -- Incrementa o sequencial para o ano atual
    UPDATE public.protocolo_sequencial
    SET sequencial = sequencial + 1
    WHERE ano = current_year
    RETURNING sequencial INTO next_sequencial;

    -- Formata o protocolo
    NEW.protocolo := 'OUV-' || current_year || '-' || LPAD(next_sequencial::text, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Recria o trigger para chamar a função antes de inserir uma nova manifestação
CREATE OR REPLACE TRIGGER set_protocolo_manifestacoes
BEFORE INSERT ON public.manifestacoes
FOR EACH ROW
EXECUTE FUNCTION public.gerar_protocolo();

-- 7. Adiciona/Atualiza valores padrão para colunas na tabela 'manifestacoes'
-- Isso garante que, mesmo que o trigger falhe por algum motivo, a coluna não seja nula.
-- O trigger ainda será responsável por preencher o valor correto para 'protocolo'.
ALTER TABLE public.manifestacoes ALTER COLUMN protocolo DROP DEFAULT; -- Remove default temporário se existir
ALTER TABLE public.manifestacoes ALTER COLUMN protocolo SET DEFAULT 'TEMP-PROTOCOL'; -- Adiciona um default temporário para segurança

ALTER TABLE public.manifestacoes ALTER COLUMN data_recebimento SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.manifestacoes ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.manifestacoes ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.manifestacoes ALTER COLUMN status SET DEFAULT 'NOVA';
ALTER TABLE public.manifestacoes ALTER COLUMN prioridade SET DEFAULT 'MEDIA';
ALTER TABLE public.manifestacoes ALTER COLUMN anonima SET DEFAULT FALSE;
ALTER TABLE public.manifestacoes ALTER COLUMN sigilosa SET DEFAULT FALSE;
ALTER TABLE public.manifestacoes ALTER COLUMN canal SET DEFAULT 'PORTAL';