import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  ClipboardList, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock,
  XCircle 
} from "lucide-react";
import { PlanoAcaoModal } from "./PlanoAcaoModal";
import { usePlanoAcao } from "../hooks/usePlanoAcao";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";

interface PlanoAcao {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  prazo: string | null;
  data_inicio: string | null;
  data_conclusao: string | null;
  observacoes: string | null;
  setor: { nome: string; sigla: string };
  responsavel: { nome: string } | null;
}

interface PlanosAcaoPanelProps {
  manifestacaoId: string;
  planos: PlanoAcao[];
}

const statusConfig = {
  PENDENTE: { label: "Pendente", icon: Circle, color: "bg-yellow-500" },
  EM_ANDAMENTO: { label: "Em Andamento", icon: Clock, color: "bg-blue-500" },
  CONCLUIDO: { label: "Concluído", icon: CheckCircle2, color: "bg-green-500" },
  CANCELADO: { label: "Cancelado", icon: XCircle, color: "bg-red-500" },
};

export function PlanosAcaoPanel({ manifestacaoId, planos }: PlanosAcaoPanelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editandoObservacoes, setEditandoObservacoes] = useState<string | null>(null);
  const [observacoes, setObservacoes] = useState("");
  const { atualizarPlano } = usePlanoAcao();

  const handleAtualizarStatus = (planoId: string, novoStatus: string) => {
    const updateData: any = { id: planoId, status: novoStatus };
    
    if (novoStatus === "EM_ANDAMENTO" && !planos.find(p => p.id === planoId)?.data_inicio) {
      updateData.dataInicio = new Date();
    }
    
    if (novoStatus === "CONCLUIDO") {
      updateData.dataConclusao = new Date();
    }

    atualizarPlano.mutate(updateData);
  };

  const handleSalvarObservacoes = (planoId: string) => {
    atualizarPlano.mutate(
      { id: planoId, observacoes },
      {
        onSuccess: () => {
          setEditandoObservacoes(null);
          setObservacoes("");
        }
      }
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              <CardTitle>Planos de Ação</CardTitle>
              <Badge variant="secondary">{planos.length}</Badge>
            </div>
            <Button onClick={() => setModalOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {planos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum plano de ação criado ainda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {planos.map((plano, index) => {
                const StatusIcon = statusConfig[plano.status as keyof typeof statusConfig].icon;
                const statusColor = statusConfig[plano.status as keyof typeof statusConfig].color;
                const statusLabel = statusConfig[plano.status as keyof typeof statusConfig].label;

                return (
                  <div key={plano.id}>
                    {index > 0 && <Separator className="my-4" />}
                    
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <StatusIcon className={`h-5 w-5 ${statusColor.replace('bg-', 'text-')}`} />
                            <h4 className="font-semibold">{plano.titulo}</h4>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">{plano.descricao}</p>
                          
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <strong>Setor:</strong> {plano.setor.nome}
                            </span>
                            {plano.responsavel && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <strong>Responsável:</strong> {plano.responsavel.nome}
                                </span>
                              </>
                            )}
                            {plano.prazo && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <strong>Prazo:</strong> {format(new Date(plano.prazo), "dd/MM/yyyy", { locale: ptBR })}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          {plano.status === "PENDENTE" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAtualizarStatus(plano.id, "EM_ANDAMENTO")}
                            >
                              Iniciar
                            </Button>
                          )}
                          {plano.status === "EM_ANDAMENTO" && (
                            <Button
                              size="sm"
                              onClick={() => handleAtualizarStatus(plano.id, "CONCLUIDO")}
                            >
                              Concluir
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Observações */}
                      <div>
                        <Label className="text-xs">Observações</Label>
                        {editandoObservacoes === plano.id ? (
                          <div className="space-y-2 mt-1">
                            <Textarea
                              value={observacoes}
                              onChange={(e) => setObservacoes(e.target.value)}
                              placeholder="Adicione observações sobre o andamento..."
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSalvarObservacoes(plano.id)}
                              >
                                Salvar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditandoObservacoes(null);
                                  setObservacoes("");
                                }}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="text-sm p-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80 mt-1"
                            onClick={() => {
                              setEditandoObservacoes(plano.id);
                              setObservacoes(plano.observacoes || "");
                            }}
                          >
                            {plano.observacoes || (
                              <span className="text-muted-foreground italic">Clique para adicionar observações</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <PlanoAcaoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        manifestacaoId={manifestacaoId}
      />
    </>
  );
}
