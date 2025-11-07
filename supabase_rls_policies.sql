-- Habilitar RLS para todas as tabelas
ALTER TABLE public.anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encaminhamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manifestacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manifestantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos_acao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_permissoes ENABLE ROW LEVEL SECURITY;

-- RLS Policies para 'anexos'
CREATE POLICY "Anexos visíveis para usuários autenticados" ON public.anexos
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários autorizados podem criar anexos" ON public.anexos
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (EXISTS ( SELECT 1 FROM public.usuarios WHERE (public.usuarios.auth_id = auth.uid())));

-- RLS Policies para 'comunicacoes'
CREATE POLICY "Comunicações visíveis para usuários autenticados" ON public.comunicacoes
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários autorizados podem criar comunicações" ON public.comunicacoes
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (EXISTS ( SELECT 1 FROM public.usuarios WHERE (public.usuarios.auth_id = auth.uid())));

-- RLS Policies para 'encaminhamentos'
CREATE POLICY "Usuários autorizados podem criar encaminhamentos" ON public.encaminhamentos
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (public.has_any_role(ARRAY['admin'::public.app_role, 'ouvidor'::public.app_role, 'assistente'::public.app_role, 'gestor'::public.app_role, 'analista'::public.app_role], auth.uid()));

CREATE POLICY "Usuários autorizados podem atualizar encaminhamentos" ON public.encaminhamentos
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (public.has_any_role(ARRAY['admin'::public.app_role, 'ouvidor'::public.app_role, 'assistente'::public.app_role, 'gestor'::public.app_role, 'analista'::public.app_role], auth.uid()));

-- RLS Policies para 'logs_auditoria'
CREATE POLICY "Logs visíveis apenas para admins" ON public.logs_auditoria
AS PERMISSIVE FOR SELECT
TO authenticated
USING (public.has_any_role(ARRAY['admin'::public.app_role, 'ouvidor'::public.app_role], auth.uid()));

CREATE POLICY "Sistema pode criar logs" ON public.logs_auditoria
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

-- RLS Policies para 'manifestacoes'
CREATE POLICY "manifestacoes_select_by_role" ON public.manifestacoes
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
    public.has_any_role(ARRAY['admin'::public.app_role, 'ouvidor'::public.app_role], auth.uid()) OR
    (public.has_role('gestor'::public.app_role, auth.uid()) AND (setor_responsavel_id IN (SELECT public.usuarios.setor_id FROM public.usuarios WHERE public.usuarios.auth_id = auth.uid()))) OR
    (public.has_any_role(ARRAY['assistente'::public.app_role, 'analista'::public.app_role], auth.uid()) AND (responsavel_id IN (SELECT public.usuarios.id FROM public.usuarios WHERE public.usuarios.auth_id = auth.uid()) OR (setor_responsavel_id IN (SELECT public.usuarios.setor_id FROM public.usuarios WHERE public.usuarios.auth_id = auth.uid()))))
);

CREATE POLICY "manifestacoes_sigilosas_protection" ON public.manifestacoes
AS PERMISSIVE FOR SELECT
TO authenticated
USING ((NOT sigilosa) OR public.has_any_role(ARRAY['admin'::public.app_role, 'ouvidor'::public.app_role], auth.uid()));

CREATE POLICY "Sistema pode criar manifestações" ON public.manifestacoes
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Usuários autorizados podem atualizar manifestações" ON public.manifestacoes
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (public.has_any_role(ARRAY['admin'::public.app_role, 'ouvidor'::public.app_role, 'assistente'::public.app_role, 'gestor'::public.app_role, 'analista'::public.app_role], auth.uid()));

CREATE POLICY "Apenas admins podem deletar manifestações" ON public.manifestacoes
AS PERMISSIVE FOR DELETE
TO authenticated
USING (public.has_role('admin'::public.app_role, auth.uid()));

-- RLS Policies para 'manifestantes'
CREATE POLICY "Apenas admins e ouvidores podem visualizar manifestantes" ON public.manifestantes
AS PERMISSIVE FOR SELECT
TO authenticated
USING (public.has_any_role(ARRAY['admin'::public.app_role, 'ouvidor'::public.app_role], auth.uid()));

CREATE POLICY "Sistema pode criar manifestantes via portal" ON public.manifestantes
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Apenas perfis autorizados podem atualizar manifestantes" ON public.manifestantes
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (public.has_any_role(ARRAY['admin'::public.app_role, 'ouvidor'::public.app_role, 'assistente'::public.app_role], auth.uid()));

-- RLS Policies para 'notificacoes'
CREATE POLICY "Usuários veem suas próprias notificações" ON public.notificacoes
AS PERMISSIVE FOR SELECT
TO public
USING (usuario_id IN (SELECT public.usuarios.id FROM public.usuarios WHERE (public.usuarios.auth_id = auth.uid())));

CREATE POLICY "Sistema pode criar notificações" ON public.notificacoes
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar suas notificações" ON public.notificacoes
AS PERMISSIVE FOR UPDATE
TO public
USING (usuario_id IN (SELECT public.usuarios.id FROM public.usuarios WHERE (public.usuarios.id = notificacoes.usuario_id AND public.usuarios.auth_id = auth.uid())));

-- RLS Policies para 'permissoes'
CREATE POLICY "Permissões visíveis para usuários autenticados" ON public.permissoes
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Apenas admins podem gerenciar permissões" ON public.permissoes
AS PERMISSIVE FOR ALL
TO authenticated
USING (public.has_role('admin'::public.app_role, auth.uid()));

-- RLS Policies para 'planos_acao'
CREATE POLICY "Planos de ação visíveis para usuários autenticados" ON public.planos_acao
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários autorizados podem criar planos de ação" ON public.planos_acao
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (public.has_any_role(ARRAY['admin'::public.app_role, 'ouvidor'::public.app_role, 'assistente'::public.app_role, 'gestor'::public.app_role, 'analista'::public.app_role], auth.uid()));

CREATE POLICY "Usuários autorizados podem atualizar planos de ação" ON public.planos_acao
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (public.has_any_role(ARRAY['admin'::public.app_role, 'ouvidor'::public.app_role, 'assistente'::public.app_role, 'gestor'::public.app_role, 'analista'::public.app_role], auth.uid()));

-- RLS Policies para 'setores'
CREATE POLICY "Setores são visíveis para todos usuários autenticados" ON public.setores
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Apenas admins podem gerenciar setores" ON public.setores
AS PERMISSIVE FOR ALL
TO authenticated
USING (public.has_role('admin'::public.app_role, auth.uid()));

-- RLS Policies para 'user_roles'
CREATE POLICY "Usuários podem ver seus próprios roles" ON public.user_roles
AS PERMISSIVE FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Apenas admins podem gerenciar roles" ON public.user_roles
AS PERMISSIVE FOR ALL
TO authenticated
USING (public.has_role('admin'::public.app_role, auth.uid()));

-- RLS Policies para 'usuarios' (ATUALIZADO para permitir o primeiro ADMIN)
-- Remove a política antiga de INSERT se existir
DROP POLICY IF EXISTS "Apenas admins podem criar usuários" ON public.usuarios;

CREATE POLICY "Allow user creation based on role and first user logic" ON public.usuarios
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
    -- Permite se o usuário autenticado já é um admin
    public.has_role('admin'::public.app_role, auth.uid())
    OR
    -- Permite se não há admins no sistema E o novo usuário está se registrando como ADMIN
    (
        (SELECT count(*) FROM public.usuarios WHERE perfil = 'ADMIN'::public.perfil_usuario) = 0
        AND perfil = 'ADMIN'::public.perfil_usuario
        AND auth_id = auth.uid()
    )
    OR
    -- Permite se não há admins no sistema E o novo usuário está se registrando como OUVIDOR (para o caso de o primeiro admin ser ouvidor)
    (
        (SELECT count(*) FROM public.usuarios WHERE perfil = 'ADMIN'::public.perfil_usuario) = 0
        AND perfil = 'OUVIDOR'::public.perfil_usuario
        AND auth_id = auth.uid()
    )
    OR
    -- Permite se não há admins no sistema E o novo usuário está se registrando como ANALISTA (padrão para outros usuários)
    (
        (SELECT count(*) FROM public.usuarios WHERE perfil = 'ADMIN'::public.perfil_usuario) = 0
        AND perfil = 'ANALISTA'::public.perfil_usuario
        AND auth_id = auth.uid()
    )
);


CREATE POLICY "Admins e Ouvidores podem ver todos usuários" ON public.usuarios
AS PERMISSIVE FOR SELECT
TO authenticated
USING (public.has_any_role(ARRAY['admin'::public.app_role, 'ouvidor'::public.app_role], auth.uid()));

CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.usuarios
AS PERMISSIVE FOR SELECT
TO authenticated
USING (auth_id = auth.uid());

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.usuarios
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (auth_id = auth.uid())
WITH CHECK (auth_id = auth.uid());

CREATE POLICY "Apenas admins podem deletar usuários" ON public.usuarios
AS PERMISSIVE FOR DELETE
TO authenticated
USING (public.has_role('admin'::public.app_role, auth.uid()));

-- RLS Policies para 'usuarios_permissoes'
CREATE POLICY "Usuários podem ver suas próprias permissões" ON public.usuarios_permissoes
AS PERMISSIVE FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.usuarios WHERE public.usuarios.id = usuarios_permissoes.usuario_id AND public.usuarios.auth_id = auth.uid()));

CREATE POLICY "Apenas admins podem gerenciar permissões de usuários" ON public.usuarios_permissoes
AS PERMISSIVE FOR ALL
TO authenticated
USING (public.has_role('admin'::public.app_role, auth.uid()));