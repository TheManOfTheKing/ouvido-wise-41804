import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { PrioridadeBadge } from "./PrioridadeBadge";
import { PrazoIndicator } from "./PrazoIndicator";
import { Eye, FileText, User, Building2, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

interface Manifestacao {
  id: string;
  protocolo: string;
  tipo: string;
  status: string;
  prioridade: string;
  descricao: string;
  data_recebimento: string;
  prazo_resposta?: string | null;
  data_resposta?: string | null;
  anonima: boolean;
  sigilosa: boolean;
  manifestante?: { nome: string } | null;
  setor?: { nome: string; sigla: string } | null;
  responsavel?: { nome: string } | null;
}

interface ManifestacaoCardProps {
  manifestacao: Manifestacao;
}

const tipoLabels: Record<string, string> = {
  ELOGIO: "Elogio",
  SUGESTAO: "Sugestão",
  RECLAMACAO: "Reclamação",
  DENUNCIA: "Denúncia",
  SOLICITACAO: "Solicitação"
};

export function ManifestacaoCard({ manifestacao }: ManifestacaoCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link 
                  to={`/manifestacoes/${manifestacao.id}`}
                  className="font-semibold text-primary hover:underline"
                >
                  {manifestacao.protocolo}
                </Link>
                {manifestacao.sigilosa && (
                  <span title="Sigilosa">
                    <ShieldAlert className="h-4 w-4 text-red-500" />
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {tipoLabels[manifestacao.tipo] || manifestacao.tipo}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <StatusBadge status={manifestacao.status as any} />
              <PrioridadeBadge prioridade={manifestacao.prioridade as any} />
            </div>
          </div>

          {/* Descrição */}
          <p className="text-sm line-clamp-2">{manifestacao.descricao}</p>

          {/* Info */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{manifestacao.anonima ? "Anônimo" : manifestacao.manifestante?.nome || "N/A"}</span>
            </div>
            {manifestacao.setor && (
              <div className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                <span>{manifestacao.setor.sigla}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{format(new Date(manifestacao.data_recebimento), "dd/MM/yyyy", { locale: ptBR })}</span>
            </div>
          </div>

          {/* Prazo */}
          <div className="flex items-center justify-between">
            <PrazoIndicator 
              prazo={manifestacao.prazo_resposta} 
              dataResposta={manifestacao.data_resposta}
              status={manifestacao.status}
            />
            <Link to={`/manifestacoes/${manifestacao.id}`}>
              <Button variant="ghost" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalhes
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
