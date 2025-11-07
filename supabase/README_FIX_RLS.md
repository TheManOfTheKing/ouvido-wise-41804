# Correção RLS - registro de mudança

Este arquivo descreve a correção aplicada para resolver um problema onde o perfil do usuário
(nome, perfil/ADMIN, etc.) não era carregado no frontend após login.

Resumo da causa
---------------
- Policies de Row Level Security (RLS) na tabela `public.usuarios` dependiam de funções auxiliares
  que não estavam explicitamente marcadas como `STABLE` e `SECURITY DEFINER`. Isso pode causar
  comportamento inconsistente ou negações por RLS quando a função é executada no contexto do
  usuário autenticado.
- Havia também uma policy de administrador com lógica mista que podia levar a condições
  contraditórias (impedindo um admin de ver outros usuários em algumas condições).

O que foi feito
---------------
1. Recriei as funções auxiliares usadas em policies (`is_admin`, `is_ouvidor`, `is_gestor`,
   `is_assistente`, `is_analista`, `get_my_user_id`, `get_my_sector_id`) com `STABLE` e
   `SECURITY DEFINER` para garantir execução com privilégios do owner e comportamento estável
   quando chamadas dentro de policies.

2. Simplifiquei a policy de admin `usuarios_admin_all_access` para usar apenas `public.is_admin()`
   tanto no `USING` quanto no `WITH CHECK`, evitando a mistura de condições que gerava
   comportamento ambíguo.

3. Recriei/criei explicitamente as policies básicas que permitem que cada usuário visualize,
   insira e atualize seu próprio perfil (checando `auth_id = auth.uid()`).

4. Reabilitei RLS na tabela `public.usuarios` (se havia sido desabilitado para diagnóstico).

Arquivos aplicados
-------------------
- `supabase/FIX_RLS_FINAL_SOLUTION_CUSTOM.sql` — script SQL com diagnóstico e correção.

Como aplicar (passo a passo)
---------------------------
1. Abra o Supabase Project > SQL Editor.
2. Cole o conteúdo de `supabase/FIX_RLS_FINAL_SOLUTION_CUSTOM.sql` e execute como role admin.
   - Observação: execute como o owner/admin do projeto (Project SQL Editor) — funções com
     `SECURITY DEFINER` devem ser definidas pelo owner apropriado.
3. Teste no frontend: logout → login com um usuário normal e com um admin; confirme que o
   nome e o perfil aparecem conforme esperado.

Como reverter
-------------
Se precisar reverter, restaure o estado anterior do banco (dump/backup) ou rode manualmente os
`DROP FUNCTION`/`DROP POLICY` correspondentes e recrie as versões antigas. Recomenda-se manter
um backup antes de mudanças em RLS/funções.

Testes recomendados
-------------------
- Login com usuário comum: confirmar `nome` aparece e que o usuário só vê/edita seu próprio
  perfil.
- Login com admin: confirmar `nome` aparece, e o admin consegue listar/editar outros usuários
  conforme esperado.
- Executar queries de diagnóstico incluídas no SQL para verificar volatilidade/definer.

Notas finais
-----------
Se quiser, podemos commitar também um pequeno changelog em `supabase/CHANGELOG.md` com a
referência desta correção e a data.

Versão da correção: 2025-11-07
