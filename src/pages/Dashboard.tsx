import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import {
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
  AlertCircle,
  Building2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AtividadesRecentes } from "@/components/AtividadesRecentes";

export default function Dashboard() {
  const { usuario } = useAuth();
  const { canManageUsers, canManageSectors, canViewReports } = usePermissions();
  const [stats, setStats] = useState({
    total: 0,
    novas: 0,
    emAndamento: 0,
    respondidas: 0,
    tempoMedio: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Total de manifestações
      const { count: total } = await supabase
        .from("manifestacoes")
        .select("*", { count: "exact", head: true });

      // Novas
      const { count: novas } = await supabase
        .from("manifestacoes")
        .select("*", { count: "exact", head: true })
        .eq("status", "NOVA");

      // Em andamento
      const { count: emAndamento } = await supabase
        .from("manifestacoes")
        .select("*", { count: "exact", head: true })
        .in("status", ["EM_ANALISE", "ENCAMINHADA", "EM_ATENDIMENTO"]);

      // Respondidas
      const { count: respondidas } = await supabase
        .from("manifestacoes")
        .select("*", { count: "exact", head: true })
        .in("status", ["RESPONDIDA", "ENCERRADA"]);

      setStats({
        total: total || 0,
        novas: novas || 0,
        emAndamento: emAndamento || 0,
        respondidas: respondidas || 0,
        tempoMedio: 0 // TODO: calcular tempo médio
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total de Manifestações",
      value: stats.total,
      icon: FileText,
      color: "text-primary"
    },
    {
      title: "Aguardando Análise",
      value: stats.novas,
      icon: AlertCircle,
      color: "text-warning"
    },
    {
      title: "Em Andamento",
      value: stats.emAndamento,
      icon: Clock,
      color: "text-info"
    },
    {
      title: "Finalizadas",
      value: stats.respondidas,
      icon: CheckCircle,
      color: "text-success"
    }
  ];

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Olá, {usuario?.nome}!</h2>
          <p className="text-muted-foreground">
            Bem-vindo ao painel de controle da ouvidoria. Aqui você pode acompanhar todas as manifestações.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{loading ? "..." : stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link to="/manifestacoes">
                <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="text-center">
                    <div className="font-semibold">Ver Manifestações</div>
                    <div className="text-xs text-muted-foreground">Visualizar e gerenciar</div>
                  </div>
                </Button>
              </Link>
              
              {canManageUsers && (
                <Link to="/usuarios">
                  <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                    <Users className="h-8 w-8 text-primary" />
                    <div className="text-center">
                      <div className="font-semibold">Gerenciar Usuários</div>
                      <div className="text-xs text-muted-foreground">Administrar equipe</div>
                    </div>
                  </Button>
                </Link>
              )}

              {canManageSectors && (
                <Link to="/setores">
                  <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                    <Building2 className="h-8 w-8 text-primary" />
                    <div className="text-center">
                      <div className="font-semibold">Gerenciar Setores</div>
                      <div className="text-xs text-muted-foreground">Cadastrar e editar</div>
                    </div>
                  </Button>
                </Link>
              )}
              
              {canViewReports && ( // Renderiza o link apenas se o usuário tiver permissão
                <Link to="/relatorios">
                  <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    <div className="text-center">
                      <div className="font-semibold">Relatórios</div>
                      <div className="text-xs text-muted-foreground">Análises e métricas</div>
                    </div>
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Atividades Recentes */}
        <div className="mt-8">
          <AtividadesRecentes />
        </div>
      </div>
    </AppLayout>
  );
}