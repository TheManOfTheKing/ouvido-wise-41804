-- Concede permissão de EXECUTE na função gerar_protocolo para o papel 'anon'
GRANT EXECUTE ON FUNCTION public.gerar_protocolo() TO anon;

-- Concede permissão de SELECT na tabela manifestacoes para o papel 'anon'
-- Isso é necessário se a função gerar_protocolo precisar ler a tabela para gerar o próximo protocolo.
GRANT SELECT ON TABLE public.manifestacoes TO anon;