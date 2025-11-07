-- Habilita RLS na tabela manifestacoes (se ainda não estiver habilitado)
ALTER TABLE public.manifestacoes ENABLE ROW LEVEL SECURITY;

-- Cria uma política para permitir que usuários anônimos insiram novas manifestações
-- Esta política permite a inserção de novas linhas na tabela 'manifestacoes'
-- para qualquer usuário, incluindo usuários não autenticados (role 'anon').
-- É importante que esta política seja revisada e ajustada conforme as necessidades de segurança
-- e os campos que podem ser preenchidos publicamente.
CREATE POLICY "Allow anonymous insert for manifestacoes"
ON public.manifestacoes FOR INSERT
WITH CHECK (true);

-- Opcional: Se você também permitir que usuários anônimos criem manifestantes
-- (quando a manifestação não é anônima e o manifestante é novo),
-- você precisará de uma política semelhante para a tabela 'manifestantes'.
-- Habilita RLS na tabela manifestantes (se ainda não estiver habilitado)
ALTER TABLE public.manifestantes ENABLE ROW LEVEL SECURITY;

-- Cria uma política para permitir que usuários anônimos insiram novos manifestantes
CREATE POLICY "Allow anonymous insert for manifestantes"
ON public.manifestantes FOR INSERT
WITH CHECK (true);