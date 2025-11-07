-- Habilitar RLS para a tabela 'usuarios'
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Política para 'usuarios':
-- Administradores e Ouvidores podem ver e gerenciar todos os usuários.
-- Outros usuários autenticados podem ver seus próprios dados.
CREATE POLICY "Administrators and Ouvidores can manage all users"
  ON public.usuarios
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = ANY(ARRAY['admin'::app_role, 'ouvidor'::app_role])
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = ANY(ARRAY['admin'::app_role, 'ouvidor'::app_role])
    )
  );

CREATE POLICY "Authenticated users can view their own user profile"
  ON public.usuarios
  FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid());

-- Habilitar RLS para a tabela 'setores'
ALTER TABLE public.setores ENABLE ROW LEVEL SECURITY;

-- Política para 'setores':
-- Administradores e Ouvidores podem gerenciar todos os setores.
-- Outros usuários autenticados podem ver todos os setores.
CREATE POLICY "Administrators and Ouvidores can manage all sectors"
  ON public.setores
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = ANY(ARRAY['admin'::app_role, 'ouvidor'::app_role])
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = ANY(ARRAY['admin'::app_role, 'ouvidor'::app_role])
    )
  );

CREATE POLICY "Authenticated users can view all sectors"
  ON public.setores
  FOR SELECT
  TO authenticated
  USING (true);

-- Habilitar RLS para a tabela 'user_roles'
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Política para 'user_roles':
-- Administradores e Ouvidores podem gerenciar todas as atribuições de roles.
-- Outros usuários autenticados podem ver suas próprias roles.
CREATE POLICY "Administrators and Ouvidores can manage all user roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = ANY(ARRAY['admin'::app_role, 'ouvidor'::app_role])
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = ANY(ARRAY['admin'::app_role, 'ouvidor'::app_role])
    )
  );

CREATE POLICY "Authenticated users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Habilitar RLS para a tabela 'logs_auditoria'
ALTER TABLE public.logs_auditoria ENABLE ROW LEVEL SECURITY;

-- Política para 'logs_auditoria':
-- Apenas Administradores podem ver os logs de auditoria.
CREATE POLICY "Administrators can view audit logs"
  ON public.logs_auditoria
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

-- Criar função para registrar logs de auditoria automaticamente em INSERT/UPDATE/DELETE
-- Esta função será chamada por triggers nas tabelas que queremos auditar.
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  user_id UUID;
  client_ip TEXT;
  user_agent TEXT;
BEGIN
  -- Tenta obter o ID do usuário autenticado
  BEGIN
    user_id := auth.uid();
  EXCEPTION
    WHEN OTHERS THEN
      user_id := NULL; -- Se não houver usuário autenticado (ex: operação de sistema)
  END;

  -- Tenta obter o IP do cliente e User-Agent (pode variar dependendo de como a requisição chega ao Supabase)
  -- Estas informações podem ser mais difíceis de obter diretamente de um trigger de banco de dados
  -- e podem exigir configuração adicional no nível da API Gateway ou Edge Functions.
  -- Por enquanto, vamos deixar como NULL ou tentar obter de variáveis de ambiente se disponíveis.
  client_ip := current_setting('request.ip_address', true);
  user_agent := current_setting('request.user_agent', true);

  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.logs_auditoria (usuario_id, acao, entidade, entidade_id, dados_novos, ip, user_agent)
    VALUES (user_id, 'CREATE', TG_TABLE_NAME, NEW.id, to_jsonb(NEW), client_ip, user_agent);
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.logs_auditoria (usuario_id, acao, entidade, entidade_id, dados_antigos, dados_novos, ip, user_agent)
    VALUES (user_id, 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW), client_ip, user_agent);
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO public.logs_auditoria (usuario_id, acao, entidade, entidade_id, dados_antigos, ip, user_agent)
    VALUES (user_id, 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD), client_ip, user_agent);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar triggers de auditoria para as tabelas relevantes
-- Exemplo para a tabela 'usuarios':
CREATE TRIGGER audit_usuarios_changes
AFTER INSERT OR UPDATE OR DELETE ON public.usuarios
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- Exemplo para a tabela 'setores':
CREATE TRIGGER audit_setores_changes
AFTER INSERT OR UPDATE OR DELETE ON public.setores
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- Exemplo para a tabela 'manifestacoes' (já existente e importante para auditoria)
CREATE TRIGGER audit_manifestacoes_changes
AFTER INSERT OR UPDATE OR DELETE ON public.manifestacoes
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- Exemplo para a tabela 'planos_acao' (já existente e importante para auditoria)
CREATE TRIGGER audit_planos_acao_changes
AFTER INSERT OR UPDATE OR DELETE ON public.planos_acao
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- Exemplo para a tabela 'comunicacoes' (já existente e importante para auditoria)
CREATE TRIGGER audit_comunicacoes_changes
AFTER INSERT OR UPDATE OR DELETE ON public.comunicacoes
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- Exemplo para a tabela 'anexos' (já existente e importante para auditoria)
CREATE TRIGGER audit_anexos_changes
AFTER INSERT OR UPDATE OR DELETE ON public.anexos
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- Exemplo para a tabela 'encaminhamentos' (já existente e importante para auditoria)
CREATE TRIGGER audit_encaminhamentos_changes
AFTER INSERT OR UPDATE OR DELETE ON public.encaminhamentos
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- Exemplo para a tabela 'notificacoes' (já existente e importante para auditoria)
CREATE TRIGGER audit_notificacoes_changes
AFTER INSERT OR UPDATE OR DELETE ON public.notificacoes
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- Grant usage on audit_trigger function to authenticated users
GRANT EXECUTE ON FUNCTION public.audit_trigger() TO authenticated;

-- Grant select, insert, update, delete on logs_auditoria to service_role
-- This is important for the audit_trigger function to be able to write to the logs_auditoria table
ALTER PUBLICATION supabase_realtime ADD TABLE logs_auditoria;