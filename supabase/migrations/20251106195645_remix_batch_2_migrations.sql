
-- Migration: 20251106194400

-- Migration: 20251106191930

-- Migration: 20251106190045

-- Migration: 20251106183639

-- Migration: 20251106175155
-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE perfil_usuario AS ENUM ('ADMIN', 'OUVIDOR', 'ASSISTENTE', 'GESTOR', 'ANALISTA', 'CONSULTA');
CREATE TYPE acao_permissao AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'APPROVE', 'FORWARD', 'CLOSE', 'REOPEN', 'MANAGE');
CREATE TYPE tipo_manifestacao AS ENUM ('ELOGIO', 'SUGESTAO', 'RECLAMACAO', 'DENUNCIA', 'SOLICITACAO');
CREATE TYPE prioridade_manifestacao AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE');
CREATE TYPE status_manifestacao AS ENUM ('NOVA', 'EM_ANALISE', 'ENCAMINHADA', 'EM_ATENDIMENTO', 'AGUARDANDO_RETORNO', 'RESPONDIDA', 'ENCERRADA', 'CANCELADA');
CREATE TYPE canal_manifestacao AS ENUM ('PORTAL', 'EMAIL', 'PRESENCIAL', 'TELEFONE', 'WHATSAPP', 'CARTA', 'OUTROS');
CREATE TYPE sentimento AS ENUM ('POSITIVO', 'NEUTRO', 'NEGATIVO');
CREATE TYPE status_encaminhamento AS ENUM ('PENDENTE', 'EM_ANALISE', 'RESPONDIDO', 'ATRASADO');
CREATE TYPE meio_comunicacao AS ENUM ('EMAIL', 'TELEFONE', 'PRESENCIAL', 'WHATSAPP');
CREATE TYPE tipo_comunicacao AS ENUM ('EMAIL', 'COMENTARIO', 'TELEFONE', 'PRESENCIAL', 'WHATSAPP', 'SISTEMA');

-- ============================================
-- SETORES
-- ============================================

CREATE TABLE setores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  sigla TEXT UNIQUE NOT NULL,
  descricao TEXT,
  email TEXT,
  telefone TEXT,
  gestor_id UUID,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_setores_sigla ON setores(sigla);

-- ============================================
-- USUÁRIOS
-- ============================================

CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  perfil perfil_usuario NOT NULL DEFAULT 'ANALISTA',
  setor_id UUID REFERENCES setores(id),
  ativo BOOLEAN NOT NULL DEFAULT true,
  primeiro_acesso BOOLEAN NOT NULL DEFAULT true,
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  avatar TEXT,
  telefone TEXT,
  cargo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_setor_id ON usuarios(setor_id);
CREATE INDEX idx_usuarios_auth_id ON usuarios(auth_id);

-- Adicionar FK de gestor após criar usuários
ALTER TABLE setores ADD CONSTRAINT fk_setores_gestor FOREIGN KEY (gestor_id) REFERENCES usuarios(id);

-- ============================================
-- PERMISSÕES
-- ============================================

CREATE TABLE permissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo TEXT NOT NULL,
  recurso TEXT NOT NULL,
  acao acao_permissao NOT NULL,
  descricao TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(modulo, recurso, acao)
);

CREATE TABLE usuarios_permissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  permissao_id UUID NOT NULL REFERENCES permissoes(id) ON DELETE CASCADE,
  concedido_por TEXT,
  concedido_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(usuario_id, permissao_id)
);

CREATE INDEX idx_usuarios_permissoes_usuario_id ON usuarios_permissoes(usuario_id);
CREATE INDEX idx_usuarios_permissoes_permissao_id ON usuarios_permissoes(permissao_id);

-- ============================================
-- MANIFESTANTES
-- ============================================

CREATE TABLE manifestantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  prefere_comunicacao BOOLEAN NOT NULL DEFAULT true,
  meio_comunicacao meio_comunicacao NOT NULL DEFAULT 'EMAIL',
  consentimento_lgpd BOOLEAN NOT NULL DEFAULT false,
  data_consentimento TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_manifestantes_cpf ON manifestantes(cpf);
CREATE INDEX idx_manifestantes_email ON manifestantes(email);

-- ============================================
-- MANIFESTAÇÕES
-- ============================================

CREATE TABLE manifestacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo TEXT UNIQUE NOT NULL,
  tipo tipo_manifestacao NOT NULL,
  categoria TEXT,
  tags TEXT[] DEFAULT '{}',
  prioridade prioridade_manifestacao NOT NULL DEFAULT 'MEDIA',
  status status_manifestacao NOT NULL DEFAULT 'NOVA',
  descricao TEXT NOT NULL,
  anonima BOOLEAN NOT NULL DEFAULT false,
  sigilosa BOOLEAN NOT NULL DEFAULT false,
  canal canal_manifestacao NOT NULL,
  data_recebimento TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  prazo_resposta TIMESTAMP WITH TIME ZONE,
  data_resposta TIMESTAMP WITH TIME ZONE,
  data_encerramento TIMESTAMP WITH TIME ZONE,
  manifestante_id UUID REFERENCES manifestantes(id),
  responsavel_id UUID REFERENCES usuarios(id),
  setor_responsavel_id UUID REFERENCES setores(id),
  sentimento sentimento,
  palavras_chave TEXT[] DEFAULT '{}',
  tempo_resposta INTEGER,
  tempo_resolucao INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_manifestacoes_protocolo ON manifestacoes(protocolo);
CREATE INDEX idx_manifestacoes_status ON manifestacoes(status);
CREATE INDEX idx_manifestacoes_tipo ON manifestacoes(tipo);
CREATE INDEX idx_manifestacoes_data_recebimento ON manifestacoes(data_recebimento);
CREATE INDEX idx_manifestacoes_manifestante_id ON manifestacoes(manifestante_id);
CREATE INDEX idx_manifestacoes_responsavel_id ON manifestacoes(responsavel_id);
CREATE INDEX idx_manifestacoes_setor_responsavel_id ON manifestacoes(setor_responsavel_id);

-- ============================================
-- ENCAMINHAMENTOS
-- ============================================

CREATE TABLE encaminhamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manifestacao_id UUID NOT NULL REFERENCES manifestacoes(id) ON DELETE CASCADE,
  setor_origem_id UUID REFERENCES setores(id),
  setor_destino_id UUID NOT NULL REFERENCES setores(id),
  usuario_origem_id UUID NOT NULL REFERENCES usuarios(id),
  usuario_destino_id UUID REFERENCES usuarios(id),
  instrucoes TEXT,
  prazo TIMESTAMP WITH TIME ZONE,
  data_encaminhamento TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_retorno TIMESTAMP WITH TIME ZONE,
  status status_encaminhamento NOT NULL DEFAULT 'PENDENTE',
  resposta_setor TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_encaminhamentos_manifestacao_id ON encaminhamentos(manifestacao_id);
CREATE INDEX idx_encaminhamentos_setor_destino_id ON encaminhamentos(setor_destino_id);
CREATE INDEX idx_encaminhamentos_usuario_destino_id ON encaminhamentos(usuario_destino_id);
CREATE INDEX idx_encaminhamentos_status ON encaminhamentos(status);

-- ============================================
-- COMUNICAÇÕES
-- ============================================

CREATE TABLE comunicacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manifestacao_id UUID NOT NULL REFERENCES manifestacoes(id) ON DELETE CASCADE,
  tipo tipo_comunicacao NOT NULL,
  remetente TEXT NOT NULL,
  destinatario TEXT NOT NULL,
  assunto TEXT,
  mensagem TEXT NOT NULL,
  interno BOOLEAN NOT NULL DEFAULT false,
  usuario_id UUID REFERENCES usuarios(id),
  data_envio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_leitura TIMESTAMP WITH TIME ZONE,
  email_id TEXT,
  email_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_comunicacoes_manifestacao_id ON comunicacoes(manifestacao_id);
CREATE INDEX idx_comunicacoes_tipo ON comunicacoes(tipo);
CREATE INDEX idx_comunicacoes_data_envio ON comunicacoes(data_envio);

-- ============================================
-- ANEXOS
-- ============================================

CREATE TABLE anexos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manifestacao_id UUID NOT NULL REFERENCES manifestacoes(id) ON DELETE CASCADE,
  nome_arquivo TEXT NOT NULL,
  nome_original TEXT NOT NULL,
  tipo_arquivo TEXT NOT NULL,
  tamanho INTEGER NOT NULL,
  url TEXT NOT NULL,
  upload_por_id UUID NOT NULL REFERENCES usuarios(id),
  data_upload TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_anexos_manifestacao_id ON anexos(manifestacao_id);

-- ============================================
-- LOGS DE AUDITORIA
-- ============================================

CREATE TABLE logs_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  acao TEXT NOT NULL,
  entidade TEXT NOT NULL,
  entidade_id TEXT NOT NULL,
  dados_antigos JSONB,
  dados_novos JSONB,
  ip TEXT,
  user_agent TEXT,
  data_acao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_logs_auditoria_usuario_id ON logs_auditoria(usuario_id);
CREATE INDEX idx_logs_auditoria_entidade ON logs_auditoria(entidade);
CREATE INDEX idx_logs_auditoria_data_acao ON logs_auditoria(data_acao);

-- ============================================
-- FUNÇÃO DE GERAÇÃO DE PROTOCOLO
-- ============================================

CREATE OR REPLACE FUNCTION gerar_protocolo()
RETURNS TEXT AS $$
DECLARE
  ano_atual TEXT;
  sequencia INTEGER;
  protocolo TEXT;
BEGIN
  ano_atual := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(protocolo FROM 10) AS INTEGER)), 0) + 1
  INTO sequencia
  FROM manifestacoes
  WHERE protocolo LIKE 'OUV-' || ano_atual || '-%';
  
  protocolo := 'OUV-' || ano_atual || '-' || LPAD(sequencia::TEXT, 6, '0');
  
  RETURN protocolo;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER PARA ATUALIZAR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_setores_updated_at BEFORE UPDATE ON setores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_permissoes_updated_at BEFORE UPDATE ON permissoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_manifestantes_updated_at BEFORE UPDATE ON manifestantes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_manifestacoes_updated_at BEFORE UPDATE ON manifestacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_encaminhamentos_updated_at BEFORE UPDATE ON encaminhamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CRIAR PERFIL DE USUÁRIO AUTOMATICAMENTE
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (auth_id, nome, email, perfil)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'perfil')::perfil_usuario, 'ANALISTA'::perfil_usuario)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- RLS POLICIES
-- ============================================

-- Setores
ALTER TABLE setores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Setores são visíveis para todos usuários autenticados" ON setores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Apenas admins podem gerenciar setores" ON setores FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM usuarios WHERE auth_id = auth.uid() AND perfil IN ('ADMIN', 'OUVIDOR')
  )
);

-- Usuários
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem ver seu próprio perfil" ON usuarios FOR SELECT TO authenticated USING (auth_id = auth.uid());
CREATE POLICY "Admins podem ver todos usuários" ON usuarios FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM usuarios WHERE auth_id = auth.uid() AND perfil IN ('ADMIN', 'OUVIDOR')
  )
);
CREATE POLICY "Apenas admins podem gerenciar usuários" ON usuarios FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM usuarios WHERE auth_id = auth.uid() AND perfil = 'ADMIN'
  )
);

-- Permissões
ALTER TABLE permissoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permissões visíveis para usuários autenticados" ON permissoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Apenas admins podem gerenciar permissões" ON permissoes FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM usuarios WHERE auth_id = auth.uid() AND perfil = 'ADMIN'
  )
);

-- Usuários Permissões
ALTER TABLE usuarios_permissoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem ver suas próprias permissões" ON usuarios_permissoes FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM usuarios WHERE id = usuario_id AND auth_id = auth.uid()
  )
);
CREATE POLICY "Apenas admins podem gerenciar permissões de usuários" ON usuarios_permissoes FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM usuarios WHERE auth_id = auth.uid() AND perfil = 'ADMIN'
  )
);

-- Manifestantes
ALTER TABLE manifestantes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manifestantes visíveis para usuários autenticados" ON manifestantes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sistema pode criar manifestantes" ON manifestantes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autorizados podem atualizar manifestantes" ON manifestantes FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM usuarios WHERE auth_id = auth.uid() AND perfil IN ('ADMIN', 'OUVIDOR', 'ASSISTENTE', 'ANALISTA')
  )
);

-- Manifestações
ALTER TABLE manifestacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manifestações visíveis para usuários autenticados" ON manifestacoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sistema pode criar manifestações" ON manifestacoes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autorizados podem atualizar manifestações" ON manifestacoes FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM usuarios WHERE auth_id = auth.uid() AND perfil IN ('ADMIN', 'OUVIDOR', 'ASSISTENTE', 'GESTOR', 'ANALISTA')
  )
);
CREATE POLICY "Apenas admins podem deletar manifestações" ON manifestacoes FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM usuarios WHERE auth_id = auth.uid() AND perfil = 'ADMIN'
  )
);

-- Encaminhamentos
ALTER TABLE encaminhamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Encaminhamentos visíveis para usuários autenticados" ON encaminhamentos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autorizados podem criar encaminhamentos" ON encaminhamentos FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios WHERE auth_id = auth.uid() AND perfil IN ('ADMIN', 'OUVIDOR', 'ASSISTENTE', 'GESTOR', 'ANALISTA')
  )
);
CREATE POLICY "Usuários autorizados podem atualizar encaminhamentos" ON encaminhamentos FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM usuarios WHERE auth_id = auth.uid() AND perfil IN ('ADMIN', 'OUVIDOR', 'ASSISTENTE', 'GESTOR', 'ANALISTA')
  )
);

-- Comunicações
ALTER TABLE comunicacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comunicações visíveis para usuários autenticados" ON comunicacoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autorizados podem criar comunicações" ON comunicacoes FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios WHERE auth_id = auth.uid()
  )
);

-- Anexos
ALTER TABLE anexos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anexos visíveis para usuários autenticados" ON anexos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autorizados podem criar anexos" ON anexos FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios WHERE auth_id = auth.uid()
  )
);

-- Logs de Auditoria
ALTER TABLE logs_auditoria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Logs visíveis apenas para admins" ON logs_auditoria FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM usuarios WHERE auth_id = auth.uid() AND perfil IN ('ADMIN', 'OUVIDOR')
  )
);
CREATE POLICY "Sistema pode criar logs" ON logs_auditoria FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Inserir permissões padrão
INSERT INTO permissoes (modulo, recurso, acao, descricao) VALUES
  ('manifestacoes', 'manifestacao', 'CREATE', 'Criar nova manifestação'),
  ('manifestacoes', 'manifestacao', 'READ', 'Visualizar manifestações'),
  ('manifestacoes', 'manifestacao', 'UPDATE', 'Atualizar manifestação'),
  ('manifestacoes', 'manifestacao', 'DELETE', 'Deletar manifestação'),
  ('manifestacoes', 'manifestacao', 'FORWARD', 'Encaminhar manifestação'),
  ('manifestacoes', 'manifestacao', 'CLOSE', 'Encerrar manifestação'),
  ('usuarios', 'usuario', 'CREATE', 'Criar novo usuário'),
  ('usuarios', 'usuario', 'READ', 'Visualizar usuários'),
  ('usuarios', 'usuario', 'UPDATE', 'Atualizar usuário'),
  ('usuarios', 'usuario', 'DELETE', 'Deletar usuário'),
  ('usuarios', 'usuario', 'MANAGE', 'Gerenciar permissões de usuários'),
  ('relatorios', 'relatorio', 'READ', 'Visualizar relatórios'),
  ('relatorios', 'relatorio', 'EXPORT', 'Exportar relatórios');

-- Inserir setores iniciais
INSERT INTO setores (nome, sigla, descricao, ativo) VALUES
  ('Ouvidoria Geral', 'OUVID', 'Setor responsável pela gestão da ouvidoria', true),
  ('Tecnologia da Informação', 'TI', 'Setor de suporte técnico e infraestrutura', true),
  ('Recursos Humanos', 'RH', 'Setor de gestão de pessoas', true),
  ('Administrativo', 'ADMIN', 'Setor administrativo geral', true);


-- Migration: 20251106184655
-- Remover política muito permissiva
DROP POLICY IF EXISTS "Manifestantes visíveis para usuários autenticados" ON manifestantes;

-- Criar política restrita: apenas ADMIN e OUVIDOR podem ver todos os manifestantes
CREATE POLICY "Apenas admins e ouvidores podem visualizar manifestantes"
ON manifestantes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE auth_id = auth.uid() 
    AND perfil IN ('ADMIN', 'OUVIDOR', 'ASSISTENTE')
  )
);

-- Manter política de inserção (necessária para o portal público)
-- mas remover a antiga se existir
DROP POLICY IF EXISTS "Sistema pode criar manifestantes" ON manifestantes;

CREATE POLICY "Sistema pode criar manifestantes via portal"
ON manifestantes
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Atualizar política de UPDATE para ser mais restritiva
DROP POLICY IF EXISTS "Usuários autorizados podem atualizar manifestantes" ON manifestantes;

CREATE POLICY "Apenas perfis autorizados podem atualizar manifestantes"
ON manifestantes
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE auth_id = auth.uid() 
    AND perfil IN ('ADMIN', 'OUVIDOR', 'ASSISTENTE')
  )
);

-- Migration: 20251106185322
-- Criar trigger para gerar protocolo automaticamente ao inserir manifestação
CREATE OR REPLACE FUNCTION public.trigger_gerar_protocolo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ano_atual TEXT;
  sequencia INTEGER;
  novo_protocolo TEXT;
BEGIN
  -- Se o protocolo já foi definido, não fazer nada
  IF NEW.protocolo IS NOT NULL AND NEW.protocolo != '' THEN
    RETURN NEW;
  END IF;
  
  -- Gerar novo protocolo
  ano_atual := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(m.protocolo FROM 10) AS INTEGER)), 0) + 1
  INTO sequencia
  FROM manifestacoes m
  WHERE m.protocolo LIKE 'OUV-' || ano_atual || '-%';
  
  novo_protocolo := 'OUV-' || ano_atual || '-' || LPAD(sequencia::TEXT, 6, '0');
  
  NEW.protocolo := novo_protocolo;
  
  RETURN NEW;
END;
$$;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS trigger_set_protocolo ON manifestacoes;

-- Criar trigger que executa ANTES do INSERT
CREATE TRIGGER trigger_set_protocolo
  BEFORE INSERT ON manifestacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_gerar_protocolo();

-- Migration: 20251106185418
-- Criar trigger para gerar protocolo automaticamente ao inserir manifestação
CREATE OR REPLACE FUNCTION public.trigger_gerar_protocolo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ano_atual TEXT;
  sequencia INTEGER;
  novo_protocolo TEXT;
BEGIN
  -- Se o protocolo já foi definido, não fazer nada
  IF NEW.protocolo IS NOT NULL AND NEW.protocolo != '' THEN
    RETURN NEW;
  END IF;
  
  -- Gerar novo protocolo
  ano_atual := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(m.protocolo FROM 10) AS INTEGER)), 0) + 1
  INTO sequencia
  FROM manifestacoes m
  WHERE m.protocolo LIKE 'OUV-' || ano_atual || '-%';
  
  novo_protocolo := 'OUV-' || ano_atual || '-' || LPAD(sequencia::TEXT, 6, '0');
  
  NEW.protocolo := novo_protocolo;
  
  RETURN NEW;
END;
$$;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS trigger_set_protocolo ON manifestacoes;

-- Criar trigger que executa ANTES do INSERT
CREATE TRIGGER trigger_set_protocolo
  BEFORE INSERT ON manifestacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_gerar_protocolo();


-- Migration: 20251106190751
-- ====================================
-- FASE 1: CORREÇÕES CRÍTICAS DE SEGURANÇA
-- ====================================

-- 1. Criar enum de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'ouvidor', 'assistente', 'gestor', 'analista');

-- 2. Criar tabela de roles separada (evita privilege escalation)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- 3. Habilitar RLS na tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies para user_roles
CREATE POLICY "Usuários podem ver seus próprios roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Apenas admins podem gerenciar roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
);

-- 5. Criar função SECURITY DEFINER para verificar role específico
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 6. Criar função SECURITY DEFINER para verificar múltiplos roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles app_role[])
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = ANY(_roles)
  )
$$;

-- 7. Migrar dados existentes da coluna 'perfil' para a tabela user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT 
  auth_id,
  CASE perfil::TEXT
    WHEN 'ADMIN' THEN 'admin'::app_role
    WHEN 'OUVIDOR' THEN 'ouvidor'::app_role
    WHEN 'ASSISTENTE' THEN 'assistente'::app_role
    WHEN 'GESTOR' THEN 'gestor'::app_role
    WHEN 'ANALISTA' THEN 'analista'::app_role
    ELSE 'analista'::app_role
  END
FROM public.usuarios
WHERE auth_id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 8. Remover policies antigas inseguras das manifestações
DROP POLICY IF EXISTS "Manifestações visíveis para usuários autenticados" ON public.manifestacoes;

-- 9. Criar policies SEGURAS para manifestações usando as funções SECURITY DEFINER
CREATE POLICY "manifestacoes_select_by_role"
ON public.manifestacoes
FOR SELECT
TO authenticated
USING (
  -- Admins e Ouvidores veem tudo
  public.has_any_role(auth.uid(), ARRAY['admin', 'ouvidor']::app_role[])
  OR
  -- Gestores veem manifestações do seu setor
  (
    public.has_role(auth.uid(), 'gestor'::app_role)
    AND setor_responsavel_id IN (
      SELECT setor_id FROM public.usuarios WHERE auth_id = auth.uid()
    )
  )
  OR
  -- Assistentes e Analistas veem manifestações do seu setor ou atribuídas a eles
  (
    public.has_any_role(auth.uid(), ARRAY['assistente', 'analista']::app_role[])
    AND (
      responsavel_id IN (SELECT id FROM public.usuarios WHERE auth_id = auth.uid())
      OR setor_responsavel_id IN (SELECT setor_id FROM public.usuarios WHERE auth_id = auth.uid())
    )
  )
);

-- 10. Policy especial para proteger manifestações sigilosas
CREATE POLICY "manifestacoes_sigilosas_protection"
ON public.manifestacoes
FOR SELECT
TO authenticated
USING (
  -- Manifestações não sigilosas são visíveis (dentro das outras regras)
  NOT sigilosa 
  OR 
  -- Apenas Admin e Ouvidor podem ver sigilosas
  public.has_any_role(auth.uid(), ARRAY['admin', 'ouvidor']::app_role[])
);

-- 11. Atualizar função gerar_protocolo para ser mais segura
CREATE OR REPLACE FUNCTION public.gerar_protocolo()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  ano_atual TEXT;
  sequencia INTEGER;
  protocolo TEXT;
BEGIN
  ano_atual := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(protocolo FROM 10) AS INTEGER)), 0) + 1
  INTO sequencia
  FROM manifestacoes
  WHERE protocolo LIKE 'OUV-' || ano_atual || '-%';
  
  protocolo := 'OUV-' || ano_atual || '-' || LPAD(sequencia::TEXT, 6, '0');
  
  RETURN protocolo;
END;
$function$;

-- 12. Atualizar função handle_new_user para criar role padrão na tabela user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Inserir perfil na tabela usuarios
  INSERT INTO public.usuarios (auth_id, nome, email, perfil)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'perfil')::perfil_usuario, 'ANALISTA'::perfil_usuario)
  );
  
  -- Inserir role padrão 'analista' na tabela user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE(
      (NEW.raw_user_meta_data->>'perfil')::TEXT::app_role,
      'analista'::app_role
    )
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- Migration: 20251106190948
-- Atualizar função handle_new_user para lidar corretamente com perfil em diferentes formatos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  perfil_role app_role;
BEGIN
  -- Inserir perfil na tabela usuarios
  INSERT INTO public.usuarios (auth_id, nome, email, perfil)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'perfil')::perfil_usuario, 'ANALISTA'::perfil_usuario)
  );
  
  -- Converter perfil para app_role (aceita tanto uppercase quanto lowercase)
  perfil_role := CASE UPPER(COALESCE(NEW.raw_user_meta_data->>'perfil', 'ANALISTA'))
    WHEN 'ADMIN' THEN 'admin'::app_role
    WHEN 'OUVIDOR' THEN 'ouvidor'::app_role
    WHEN 'ASSISTENTE' THEN 'assistente'::app_role
    WHEN 'GESTOR' THEN 'gestor'::app_role
    WHEN 'ANALISTA' THEN 'analista'::app_role
    ELSE 'analista'::app_role
  END;
  
  -- Inserir role na tabela user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, perfil_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- Migration: 20251106191010
-- Corrigir todas as funções restantes com problemas de search_path

CREATE OR REPLACE FUNCTION public.trigger_gerar_protocolo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  ano_atual TEXT;
  sequencia INTEGER;
  novo_protocolo TEXT;
BEGIN
  -- Se o protocolo já foi definido, não fazer nada
  IF NEW.protocolo IS NOT NULL AND NEW.protocolo != '' THEN
    RETURN NEW;
  END IF;
  
  -- Gerar novo protocolo
  ano_atual := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(m.protocolo FROM 10) AS INTEGER)), 0) + 1
  INTO sequencia
  FROM manifestacoes m
  WHERE m.protocolo LIKE 'OUV-' || ano_atual || '-%';
  
  novo_protocolo := 'OUV-' || ano_atual || '-' || LPAD(sequencia::TEXT, 6, '0');
  
  NEW.protocolo := novo_protocolo;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;


-- Migration: 20251106192222
-- Remover trigger antigo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Criar função melhorada para criar primeiro usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  perfil_role app_role;
  is_first_user boolean;
BEGIN
  -- Verificar se é o primeiro usuário (não há nenhum admin ainda)
  SELECT NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  ) INTO is_first_user;
  
  -- Se for o primeiro usuário, forçar role de admin
  IF is_first_user THEN
    perfil_role := 'admin'::app_role;
    
    -- Inserir perfil na tabela usuarios como ADMIN
    INSERT INTO public.usuarios (auth_id, nome, email, perfil)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
      NEW.email,
      'ADMIN'::perfil_usuario
    );
  ELSE
    -- Converter perfil para app_role (aceita tanto uppercase quanto lowercase)
    perfil_role := CASE UPPER(COALESCE(NEW.raw_user_meta_data->>'perfil', 'ANALISTA'))
      WHEN 'ADMIN' THEN 'admin'::app_role
      WHEN 'OUVIDOR' THEN 'ouvidor'::app_role
      WHEN 'ASSISTENTE' THEN 'assistente'::app_role
      WHEN 'GESTOR' THEN 'gestor'::app_role
      WHEN 'ANALISTA' THEN 'analista'::app_role
      ELSE 'analista'::app_role
    END;
    
    -- Inserir perfil na tabela usuarios
    INSERT INTO public.usuarios (auth_id, nome, email, perfil)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
      NEW.email,
      COALESCE((NEW.raw_user_meta_data->>'perfil')::perfil_usuario, 'ANALISTA'::perfil_usuario)
    );
  END IF;
  
  -- Inserir role na tabela user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, perfil_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- Migration: 20251106194530
-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  manifestacao_id UUID REFERENCES public.manifestacoes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('ENCAMINHAMENTO', 'PRAZO_VENCIMENTO', 'RESPOSTA', 'COMENTARIO')),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN NOT NULL DEFAULT false,
  data_leitura TIMESTAMP WITH TIME ZONE,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver apenas suas notificações
CREATE POLICY "Usuários veem suas próprias notificações"
ON public.notificacoes
FOR SELECT
USING (usuario_id IN (SELECT id FROM usuarios WHERE auth_id = auth.uid()));

-- Policy: Sistema pode criar notificações
CREATE POLICY "Sistema pode criar notificações"
ON public.notificacoes
FOR INSERT
WITH CHECK (true);

-- Policy: Usuários podem marcar suas notificações como lidas
CREATE POLICY "Usuários podem atualizar suas notificações"
ON public.notificacoes
FOR UPDATE
USING (usuario_id IN (SELECT id FROM usuarios WHERE auth_id = auth.uid()));

-- Índices para performance
CREATE INDEX idx_notificacoes_usuario_id ON public.notificacoes(usuario_id);
CREATE INDEX idx_notificacoes_lida ON public.notificacoes(lida);
CREATE INDEX idx_notificacoes_created_at ON public.notificacoes(created_at DESC);

-- Habilitar realtime para notificações
ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;
