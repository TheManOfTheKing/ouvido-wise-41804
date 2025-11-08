import { Book, User, Settings, FileText, BarChart, Info, HelpCircle } from "lucide-react";
import React from "react";

export interface ManualTopic {
  id: string;
  title: string;
  path: string;
  content: string; // Conteúdo HTML para o tópico
}

export interface ManualSection {
  id: string;
  title: string;
  icon: React.ElementType; // Componente de ícone Lucide
  topics: ManualTopic[];
}

export const manualSections: ManualSection[] = [
  {
    id: "introducao",
    title: "Introdução ao Sistema",
    icon: Book,
    topics: [
      {
        id: "bem-vindo",
        title: "Bem-vindo ao Sistema de Ouvidoria",
        path: "bem-vindo",
        content: `
          <h2 class="text-2xl font-bold mb-4">Bem-vindo ao Sistema de Ouvidoria</h2>
          <p class="mb-4">Este manual foi criado para auxiliar você na utilização do Sistema de Ouvidoria, uma ferramenta desenvolvida para gerenciar manifestações de forma eficiente e transparente.</p>
          <p class="mb-4">Aqui você encontrará guias passo a passo, explicações sobre as funcionalidades e dicas para otimizar seu trabalho.</p>
          <p>Nosso objetivo é facilitar sua jornada e garantir que você aproveite ao máximo todos os recursos disponíveis.</p>
        `,
      },
      {
        id: "primeiro-acesso",
        title: "Primeiro Acesso e Login",
        path: "primeiro-acesso",
        content: `
          <h2 class="text-2xl font-bold mb-4">Primeiro Acesso e Login</h2>
          <p class="mb-4">Para acessar o sistema pela primeira vez, siga os passos abaixo:</p>
          <ol class="list-decimal list-inside space-y-2 mb-4">
            <li>Acesse a URL do sistema fornecida pela administração.</li>
            <li>Na tela de login, utilize o e-mail e a senha que foram cadastrados para você.</li>
            <li>Ao realizar o primeiro login, o sistema poderá solicitar que você defina uma nova senha para sua segurança.</li>
            <li>Após o login bem-sucedido, você será direcionado para o painel principal (Dashboard).</li>
          </ol>
          <p>Em caso de problemas com o acesso, entre em contato com o administrador do sistema.</p>
        `,
      },
      {
        id: "navegacao-geral",
        title: "Navegação Geral",
        path: "navegacao-geral",
        content: `
          <h2 class="text-2xl font-bold mb-4">Navegação Geral do Sistema</h2>
          <p class="mb-4">O sistema de Ouvidoria é dividido em seções principais, acessíveis através do menu lateral (ou superior em dispositivos móveis).</p>
          <ul class="list-disc list-inside space-y-2 mb-4">
            <li><strong>Dashboard:</strong> Visão geral e estatísticas rápidas das manifestações.</li>
            <li><strong>Manifestações:</strong> Lista completa e detalhes de todas as manifestações.</li>
            <li><strong>Usuários (Admin):</strong> Gerenciamento de contas de usuários e seus perfis.</li>
            <li><strong>Setores (Admin):</strong> Cadastro e organização dos setores da instituição.</li>
            <li><strong>Relatórios:</strong> Análises e gráficos sobre o desempenho da ouvidoria.</li>
            <li><strong>Manual do Usuário:</strong> Este guia completo de uso do sistema.</li>
          </ul>
          <p>Utilize a barra de busca e os filtros em cada seção para encontrar informações específicas rapidamente.</p>
        `,
      },
    ],
  },
  {
    id: "gestao-manifestacoes",
    title: "Gestão de Manifestações",
    icon: FileText,
    topics: [
      {
        id: "registrar-manifestacao",
        title: "Registrar Nova Manifestação",
        path: "registrar-manifestacao",
        content: `
          <h2 class="text-2xl font-bold mb-4">Registrar Nova Manifestação</h2>
          <p class="mb-4">Para registrar uma nova manifestação no sistema, siga os passos:</p>
          <ol class="list-decimal list-inside space-y-2 mb-4">
            <li>No menu lateral, clique em "Manifestações".</li>
            <li>Na tela de Manifestações, clique no botão "Nova Manifestação" (geralmente no canto superior direito).</li>
            <li>Preencha os campos obrigatórios:
              <ul class="list-disc list-inside ml-4">
                <li><strong>Tipo:</strong> Elogio, Sugestão, Reclamação, Denúncia ou Solicitação.</li>
                <li><strong>Descrição:</strong> Detalhes da manifestação.</li>
                <li><strong>Prioridade:</strong> Baixa, Média, Alta ou Urgente.</li>
                <li><strong>Canal:</strong> Por onde a manifestação foi recebida (Portal, E-mail, Telefone, etc.).</li>
              </ul>
            </li>
            <li>Se a manifestação for identificada, preencha os dados do manifestante (Nome, E-mail, CPF, Telefone).</li>
            <li>Clique em "Salvar" para registrar a manifestação. Um número de protocolo será gerado automaticamente.</li>
          </ol>
          <p>Lembre-se de que manifestações anônimas ou sigilosas têm tratamento diferenciado em relação aos dados do manifestante.</p>
        `,
      },
      {
        id: "consultar-filtrar",
        title: "Consultar e Filtrar Manifestações",
        path: "consultar-filtrar",
        content: `
          <h2 class="text-2xl font-bold mb-4">Consultar e Filtrar Manifestações</h2>
          <p class="mb-4">A tela de Manifestações permite uma busca e filtragem avançada para encontrar o que você precisa.</p>
          <h3 class="text-xl font-semibold mb-2">Consulta por Busca:</h3>
          <p class="mb-4">Utilize a barra de busca na parte superior da tela para pesquisar por:</p>
          <ul class="list-disc list-inside space-y-1 mb-4">
            <li>Número de Protocolo</li>
            <li>Palavras-chave na Descrição</li>
            <li>Nome do Manifestante</li>
          </ul>
          <h3 class="text-xl font-semibold mb-2">Filtros Avançados:</h3>
          <p class="mb-4">No painel lateral esquerdo, você encontrará diversas opções de filtro:</p>
          <ul class="list-disc list-inside space-y-1 mb-4">
            <li><strong>Status:</strong> Nova, Em Análise, Encaminhada, Respondida, Encerrada, etc.</li>
            <li><strong>Tipo:</strong> Elogio, Sugestão, Reclamação, Denúncia, Solicitação.</li>
            <li><strong>Prioridade:</strong> Baixa, Média, Alta, Urgente.</li>
            <li><strong>Prazo:</strong> No Prazo, Próximo do Vencimento, Vencido.</li>
            <li><strong>Setor Responsável:</strong> Filtra por setor atribuído.</li>
            <li><strong>Responsável:</strong> Filtra por usuário responsável.</li>
          </ul>
          <p>Você pode combinar múltiplos filtros para refinar sua busca. Clique em "Limpar Filtros" para remover todas as seleções.</p>
        `,
      },
      {
        id: "detalhes-acoes",
        title: "Detalhes e Ações da Manifestação",
        path: "detalhes-acoes",
        content: `
          <h2 class="text-2xl font-bold mb-4">Detalhes e Ações da Manifestação</h2>
          <p class="mb-4">Ao clicar em uma manifestação na lista, você acessará a tela de detalhes, onde pode visualizar todas as informações e realizar ações.</p>
          <h3 class="text-xl font-semibold mb-2">Informações Disponíveis:</h3>
          <ul class="list-disc list-inside space-y-1 mb-4">
            <li><strong>Header:</strong> Protocolo, Tipo, Status, Prioridade, Prazo, Canal de Entrada.</li>
            <li><strong>Descrição:</strong> O texto completo da manifestação, categoria e tags.</li>
            <li><strong>Informações Gerais:</strong> Datas de recebimento, encerramento, tempo de resolução, sentimento.</li>
            <li><strong>Dados do Manifestante:</strong> Nome, e-mail, telefone, cidade (se não for anônima/sigilosa).</li>
            <li><strong>Responsável Atual:</strong> Usuário e setor atualmente responsáveis.</li>
          </ul>
          <h3 class="text-xl font-semibold mb-2">Painel de Ações:</h3>
          <p class="mb-4">No painel lateral direito, você encontrará as ações disponíveis (dependendo do seu perfil e do status da manifestação):</p>
          <ul class="list-disc list-inside space-y-1 mb-4">
            <li><strong>Editar:</strong> Modificar informações da manifestação.</li>
            <li><strong>Encaminhar:</strong> Atribuir a manifestação a outro setor ou usuário.</li>
            <li><strong>Responder Manifestante:</strong> Enviar uma resposta formal por e-mail.</li>
            <li><strong>Adicionar Comentário:</strong> Registrar notas internas sobre o andamento.</li>
            <li><strong>Encerrar:</strong> Finalizar a manifestação (disponível após ser respondida).</li>
            <li><strong>Excluir (Admin):</strong> Remover a manifestação do sistema.</li>
          </ul>
          <h3 class="text-xl font-semibold mb-2">Abas de Detalhes:</h3>
          <p class="mb-4">As abas abaixo da descrição fornecem informações adicionais:</p>
          <ul class="list-disc list-inside space-y-1 mb-4">
            <li><strong>Timeline:</strong> Histórico cronológico de todas as ações e eventos.</li>
            <li><strong>Planos de Ação:</strong> Gerenciamento de tarefas e etapas para resolver a manifestação.</li>
            <li><strong>Comunicações:</strong> Registro de todos os contatos e comentários.</li>
            <li><strong>Encaminhamentos:</strong> Histórico de para onde a manifestação foi encaminhada.</li>
            <li><strong>Anexos:</strong> Upload e download de documentos relacionados.</li>
          </ul>
        `,
      },
    ],
  },
  {
    id: "gestao-usuarios",
    title: "Gestão de Usuários (Admin)",
    icon: Users,
    topics: [
      {
        id: "criar-editar-usuarios",
        title: "Criar e Editar Usuários",
        path: "criar-editar-usuarios",
        content: `
          <h2 class="text-2xl font-bold mb-4">Criar e Editar Usuários</h2>
          <p class="mb-4">A gestão de usuários é uma funcionalidade exclusiva para administradores do sistema.</p>
          <h3 class="text-xl font-semibold mb-2">Para criar um novo usuário:</h3>
          <ol class="list-decimal list-inside space-y-2 mb-4">
            <li>No menu lateral, clique em "Gestão de Usuários".</li>
            <li>Na tela de Gestão de Usuários, clique no botão "Novo Usuário".</li>
            <li>Preencha os dados do usuário (Nome, E-mail, Cargo, Telefone).</li>
            <li>Defina o <strong>Perfil de Acesso</strong> e o <strong>Setor</strong> ao qual o usuário pertence.</li>
            <li>Crie uma senha inicial para o usuário.</li>
            <li>Clique em "Salvar" para criar a conta.</li>
          </ol>
          <h3 class="text-xl font-semibold mb-2">Para editar um usuário existente:</h3>
          <p class="mb-4">Na tabela de usuários, clique no ícone de "Editar" (lápis) ao lado do nome do usuário. Você poderá atualizar suas informações, perfil e setor.</p>
          <h3 class="text-xl font-semibold mb-2">Ativar/Desativar Usuários:</h3>
          <p>Utilize o ícone de "Ligar/Desligar" (botão de energia) para ativar ou desativar uma conta de usuário. Usuários inativos não conseguem fazer login no sistema.</p>
        `,
      },
      {
        id: "perfis-acesso",
        title: "Perfis de Acesso",
        path: "perfis-acesso",
        content: `
          <h2 class="text-2xl font-bold mb-4">Perfis de Acesso</h2>
          <p class="mb-4">O sistema de Ouvidoria possui diferentes perfis de acesso para controlar as permissões dos usuários:</p>
          <ul class="list-disc list-inside space-y-2 mb-4">
            <li><strong>Administrador (ADMIN):</strong> Acesso total a todas as funcionalidades do sistema, incluindo gestão de usuários, setores e configurações.</li>
            <li><strong>Ouvidor (OUVIDOR):</strong> Gerencia manifestações, encaminhamentos, respostas e tem acesso completo aos relatórios.</li>
            <li><strong>Gestor (GESTOR):</strong> Gerencia manifestações do seu setor, pode encaminhar e responder, e visualiza relatórios.</li>
            <li><strong>Assistente (ASSISTENTE):</strong> Auxilia na gestão de manifestações, pode adicionar comentários e gerenciar anexos.</li>
            <li><strong>Analista (ANALISTA):</strong> Acessa e atua nas manifestações atribuídas a ele ou ao seu setor.</li>
            <li><strong>Consulta (CONSULTA):</strong> Apenas visualiza manifestações e relatórios, sem permissão para realizar ações de modificação.</li>
          </ul>
          <p>É fundamental atribuir o perfil correto a cada usuário para garantir a segurança e a integridade dos dados.</p>
        `,
      },
    ],
  },
  {
    id: "gestao-setores",
    title: "Gestão de Setores (Admin)",
    icon: Building2,
    topics: [
      {
        id: "cadastrar-editar-setores",
        title: "Cadastrar e Editar Setores",
        path: "cadastrar-editar-setores",
        content: `
          <h2 class="text-2xl font-bold mb-4">Cadastrar e Editar Setores</h2>
          <p class="mb-4">A gestão de setores é uma funcionalidade exclusiva para administradores do sistema.</p>
          <h3 class="text-xl font-semibold mb-2">Para cadastrar um novo setor:</h3>
          <ol class="list-decimal list-inside space-y-2 mb-4">
            <li>No menu lateral, clique em "Gestão de Setores".</li>
            <li>Na tela de Setores, clique no botão "Novo Setor".</li>
            <li>Preencha os campos: Nome, Sigla, E-mail e Telefone (opcionais), e uma Descrição (opcional).</li>
            <li>Clique em "Salvar".</li>
          </ol>
          <h3 class="text-xl font-semibold mb-2">Para editar um setor existente:</h3>
          <p class="mb-4">Na tabela de setores, clique no ícone de "Editar" (lápis) ao lado do nome do setor. Você poderá atualizar suas informações.</p>
          <h3 class="text-xl font-semibold mb-2">Ativar/Desativar Setores:</h3>
          <p>Utilize o ícone de "Ligar/Desligar" (botão de energia) para ativar ou desativar um setor. Setores inativos não podem ser atribuídos a manifestações ou usuários.</p>
        `,
      },
    ],
  },
  {
    id: "relatorios",
    title: "Relatórios e Métricas",
    icon: BarChart,
    topics: [
      {
        id: "visualizar-relatorios",
        title: "Visualizar Relatórios",
        path: "visualizar-relatorios",
        content: `
          <h2 class="text-2xl font-bold mb-4">Visualizar Relatórios</h2>
          <p class="mb-4">A seção de Relatórios oferece uma visão analítica sobre as manifestações, ajudando na tomada de decisões e na identificação de tendências.</p>
          <h3 class="text-xl font-semibold mb-2">Tipos de Relatórios Disponíveis:</h3>
          <ul class="list-disc list-inside space-y-2 mb-4">
            <li><strong>Manifestações por Tipo:</strong> Gráfico de pizza mostrando a distribuição das manifestações entre Elogio, Sugestão, Reclamação, Denúncia e Solicitação.</li>
            <li><strong>Manifestações por Status:</strong> Gráfico de barras que exibe o número de manifestações em cada status (Nova, Em Análise, Encaminhada, Respondida, Encerrada).</li>
            <li><strong>Manifestações ao Longo do Tempo:</strong> Gráfico de linha que mostra o volume de manifestações registradas em um determinado período, permitindo identificar picos e tendências.</li>
          </ul>
          <h3 class="text-xl font-semibold mb-2">Filtragem por Período:</h3>
          <p>Você pode selecionar um intervalo de datas para visualizar os relatórios, permitindo análises específicas por mês, trimestre ou ano.</p>
        `,
      },
    ],
  },
  {
    id: "ajuda-suporte",
    title: "Ajuda e Suporte",
    icon: HelpCircle,
    topics: [
      {
        id: "faq",
        title: "Perguntas Frequentes (FAQ)",
        path: "faq",
        content: `
          <h2 class="text-2xl font-bold mb-4">Perguntas Frequentes (FAQ)</h2>
          <p class="mb-4">Aqui você encontra respostas para as dúvidas mais comuns sobre o sistema.</p>
          <h3 class="text-xl font-semibold mb-2">Minha senha não funciona. O que fazer?</h3>
          <p class="mb-4">Verifique se o Caps Lock está ativado. Se o problema persistir, utilize a opção "Esqueceu sua senha?" na tela de login para redefinir. Caso não receba o e-mail de recuperação, contate o administrador do sistema.</p>
          <h3 class="text-xl font-semibold mb-2">Não consigo acessar uma funcionalidade. Por quê?</h3>
          <p class="mb-4">O acesso a certas funcionalidades é restrito por perfil de usuário. Verifique seu perfil de acesso com o administrador do sistema. Somente administradores podem alterar permissões.</p>
          <h3 class="text-xl font-semibold mb-2">Como faço para anexar um documento a uma manifestação?</h3>
          <p class="mb-4">Na tela de detalhes da manifestação, vá para a aba "Anexos" e clique no botão "Upload". Selecione o arquivo desejado (tamanho máximo de 20MB).</p>
          <h3 class="text-xl font-semibold mb-2">Posso editar uma manifestação depois de registrada?</h3>
          <p class="mb-4">Sim, manifestações podem ser editadas por usuários com permissão (Administrador, Ouvidor) ou enquanto estiverem nos status iniciais (Nova, Em Análise). Na tela de detalhes, utilize o botão "Editar" no painel de ações.</p>
        `,
      },
      {
        id: "contato-suporte",
        title: "Contato para Suporte",
        path: "contato-suporte",
        content: `
          <h2 class="text-2xl font-bold mb-4">Contato para Suporte</h2>
          <p class="mb-4">Se você não encontrou a resposta para sua dúvida neste manual ou precisa de assistência técnica, entre em contato com nossa equipe de suporte.</p>
          <p class="mb-4"><strong>E-mail:</strong> suporte@ouvidoria.com.br</p>
          <p class="mb-4"><strong>Telefone:</strong> (XX) XXXX-XXXX</p>
          <p>Nosso horário de atendimento é de segunda a sexta-feira, das 9h às 18h.</p>
        `,
      },
    ],
  },
];