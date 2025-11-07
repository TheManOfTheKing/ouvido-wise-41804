import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PrazoIndicatorProps {
  prazo?: string | null;
  dataResposta?: string | null;
  status: string;
}

export function PrazoIndicator({ prazo, dataResposta, status }: PrazoIndicatorProps) {
  // Se já foi respondida ou encerrada
  if (status === "RESPONDIDA" || status === "ENCERRADA") {
    return (
      <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
        <CheckCircle className="mr-1 h-3 w-3" />
        Concluída
      </Badge>
    );
  }

  // Se não tem prazo definido
  if (!prazo) {
    return (
      <Badge variant="outline" className="bg-gray-500/10 text-gray-700 dark:text-gray-400">
        <Clock className="mr-1 h-3 w-3" />
        Sem prazo
      </Badge>
    );
  }

  const prazoDate = new Date(prazo);
  const hoje = new Date();
  const diasRestantes = differenceInDays(prazoDate, hoje);
  const vencido = isPast(prazoDate);

  // Vencido
  if (vencido) {
    const diasAtraso = Math.abs(diasRestantes);
    return (
      <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
        <AlertCircle className="mr-1 h-3 w-3" />
        Vencido há {diasAtraso}d
      </Badge>
    );
  }

  // Menos de 1 dia
  if (diasRestantes < 1) {
    return (
      <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
        <AlertCircle className="mr-1 h-3 w-3" />
        Vence hoje
      </Badge>
    );
  }

  // Entre 1 e 3 dias
  if (diasRestantes <= 3) {
    return (
      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20">
        <Clock className="mr-1 h-3 w-3" />
        {diasRestantes}d restantes
      </Badge>
    );
  }

  // Mais de 3 dias
  return (
    <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
      <Clock className="mr-1 h-3 w-3" />
      {diasRestantes}d restantes
    </Badge>
  );
}