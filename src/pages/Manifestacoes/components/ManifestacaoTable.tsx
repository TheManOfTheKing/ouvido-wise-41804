import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { PrioridadeBadge } from "./PrioridadeBadge";
import { PrazoIndicator } from "./PrazoIndicator";
import { Eye, ShieldAlert } from "lucide-react";
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

interface ManifestacaoTableProps {
  manifestacoes: Manifestacao[];
}

const tipoLabels: Record<string, string> = {
  ELOGIO: "Elogio",
  SUGESTAO: "Sugestão",
  RECLAMACAO: "Reclamação",
  DENUNCIA: "Denúncia",
  SOLICITACAO: "Solicitação"
};

export function ManifestacaoTable({ manifestacoes }: ManifestacaoTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">Protocolo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Manifestante</TableHead>
            <TableHead>Setor</TableHead>
            <TableHead>Prazo</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {manifestacoes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                Nenhuma manifestação encontrada.
              </TableCell>
            </TableRow>
          ) : (
            manifestacoes.map((manifestacao) => (
              <TableRow key={manifestacao.id}>
                <TableCell className="font-medium">
                  <Link 
                    to={`/manifestacoes/${manifestacao.id}`}
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    {manifestacao.protocolo}
                    {manifestacao.sigilosa && (
                      <span title="Sigilosa">
                        <ShieldAlert className="h-3 w-3 text-red-500" />
                      </span>
                    )}
                  </Link>
                </TableCell>
                <TableCell>{tipoLabels[manifestacao.tipo] || manifestacao.tipo}</TableCell>
                <TableCell>
                  <StatusBadge status={manifestacao.status as any} showIcon={false} />
                </TableCell>
                <TableCell>
                  <PrioridadeBadge prioridade={manifestacao.prioridade as any} showIcon={false} />
                </TableCell>
                <TableCell className="max-w-[150px] truncate">
                  {manifestacao.anonima ? "Anônimo" : manifestacao.manifestante?.nome || "N/A"}
                </TableCell>
                <TableCell>{manifestacao.setor?.sigla || "N/A"}</TableCell>
                <TableCell>
                  <PrazoIndicator 
                    prazo={manifestacao.prazo_resposta} 
                    dataResposta={manifestacao.data_resposta}
                    status={manifestacao.status}
                  />
                </TableCell>
                <TableCell>
                  <Link to={`/manifestacoes/${manifestacao.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
