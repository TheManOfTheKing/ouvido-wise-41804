import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/pages/Manifestacoes/components/StatusBadge";
import { PrioridadeBadge } from "@/pages/Manifestacoes/components/PrioridadeBadge";
import { PrazoIndicator } from "@/pages/Manifestacoes/components/PrazoIndicator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ManifestacaoHeaderProps {
  manifestacao: any;
}

const tipoLabels = {
  ELOGIO: "Elogio",
  SUGESTAO: "Sugestão",
  RECLAMACAO: "Reclamação",
  DENUNCIA: "Denúncia",
  SOLICITACAO: "Solicitação",
};

const canalLabels = {
  PORTAL: "Portal Web",
  EMAIL: "E-mail",
  TELEFONE: "Telefone",
  PRESENCIAL: "Presencial",
  CARTA: "Carta",
  WHATSAPP: "WhatsApp",
};

export function ManifestacaoHeader({ manifestacao }: ManifestacaoHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-start justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/manifestacoes")}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Protocolo {manifestacao.protocolo}
            </h1>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-primary/10">
                {tipoLabels[manifestacao.tipo as keyof typeof tipoLabels]}
              </Badge>
              <StatusBadge status={manifestacao.status} />
              <PrioridadeBadge prioridade={manifestacao.prioridade} />
              <PrazoIndicator
                prazo={manifestacao.prazo_resposta}
                dataResposta={manifestacao.data_resposta}
                status={manifestacao.status}
              />
              {manifestacao.anonima && (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                  Anônima
                </Badge>
              )}
              {manifestacao.sigilosa && (
                <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400">
                  Sigilosa
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Canal de entrada</p>
              <p className="font-medium">
                {canalLabels[manifestacao.canal as keyof typeof canalLabels]}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Data de recebimento</p>
              <p className="font-medium">
                {format(new Date(manifestacao.data_recebimento), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </p>
            </div>
            {manifestacao.setor && (
              <div>
                <p className="text-muted-foreground mb-1">Setor responsável</p>
                <p className="font-medium">
                  {manifestacao.setor.sigla} - {manifestacao.setor.nome}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
