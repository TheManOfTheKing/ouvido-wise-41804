-- Criar tabela de planos de ação
CREATE TABLE IF NOT EXISTS public.planos_acao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manifestacao_id UUID NOT NULL REFERENCES public.manifestacoes(id) ON DELETE CASCADE,
  setor_id UUID NOT NULL REFERENCES public.setores(id),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  responsavel_id UUID REFERENCES public.usuarios(id),
  status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO')),
  prazo DATE,
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_planos_acao_manifestacao ON public.planos_acao(manifestacao_id);
CREATE INDEX idx_planos_acao_setor ON public.planos_acao(setor_id);
CREATE INDEX idx_planos_acao_responsavel ON public.planos_acao(responsavel_id);
CREATE INDEX idx_planos_acao_status ON public.planos_acao(status);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_planos_acao_updated_at
  BEFORE UPDATE ON public.planos_acao
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
ALTER TABLE public.planos_acao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Planos de ação visíveis para usuários autenticados"
  ON public.planos_acao
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autorizados podem criar planos de ação"
  ON public.planos_acao
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE usuarios.auth_id = auth.uid()
      AND usuarios.perfil = ANY(ARRAY['ADMIN'::perfil_usuario, 'OUVIDOR'::perfil_usuario, 'ASSISTENTE'::perfil_usuario, 'GESTOR'::perfil_usuario, 'ANALISTA'::perfil_usuario])
    )
  );

CREATE POLICY "Usuários autorizados podem atualizar planos de ação"
  ON public.planos_acao
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE usuarios.auth_id = auth.uid()
      AND usuarios.perfil = ANY(ARRAY['ADMIN'::perfil_usuario, 'OUVIDOR'::perfil_usuario, 'ASSISTENTE'::perfil_usuario, 'GESTOR'::perfil_usuario, 'ANALISTA'::perfil_usuario])
    )
  );

-- Criar bucket de storage para anexos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'anexos-manifestacoes',
  'anexos-manifestacoes',
  false,
  20971520, -- 20MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies para storage
CREATE POLICY "Usuários autenticados podem visualizar anexos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'anexos-manifestacoes');

CREATE POLICY "Usuários autenticados podem fazer upload de anexos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'anexos-manifestacoes'
    AND EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE usuarios.auth_id = auth.uid()
    )
  );

CREATE POLICY "Usuários autenticados podem deletar seus anexos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'anexos-manifestacoes'
    AND EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE usuarios.auth_id = auth.uid()
    )
  );