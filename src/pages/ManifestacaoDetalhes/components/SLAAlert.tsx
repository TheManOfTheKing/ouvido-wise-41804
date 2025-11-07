import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { differenceInDays, differenceInHours, isPast } from "date-fns";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SLAAlertProps {
  prazoResposta?: string;
  status: string;
}

export function SLAAlert({ prazoResposta, status }: SLAAlertProps) {
  if (!prazoResposta || status === "ENCERRADA") return null;

  const prazoDate = new Date(prazoResposta);
  const hoje = new Date();
  const vencido = isPast(prazoDate);
  const diasRestantes = differenceInDays(prazoDate, hoje);
  const horasRestantes = differenceInHours(prazoDate, hoje);

  if (vencido) {
    const diasAtraso = Math.abs(diasRestantes);
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Prazo Vencido</AlertTitle>
        <AlertDescription>
          Esta manifestação está atrasada há <strong>{diasAtraso} dia(s)</strong>.
          <br />
          Prazo era: {format(prazoDate, "PPP", { locale: ptBR })}
        </AlertDescription>
      </Alert>
    );
  }

  if (diasRestantes <= 1) {
    return (
      <Alert variant="destructive" className="border-orange-500 bg-orange-50">
        <Clock className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-900">Prazo Urgente</AlertTitle>
        <AlertDescription className="text-orange-800">
          Restam apenas <strong>{horasRestantes} hora(s)</strong> para o vencimento.
          <br />
          Prazo: {format(prazoDate, "PPP 'às' HH:mm", { locale: ptBR })}
        </AlertDescription>
      </Alert>
    );
  }

  if (diasRestantes <= 3) {
    return (
      <Alert variant="default" className="border-yellow-500 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-900">Prazo Próximo do Vencimento</AlertTitle>
        <AlertDescription className="text-yellow-800">
          Restam <strong>{diasRestantes} dia(s)</strong> para o vencimento.
          <br />
          Prazo: {format(prazoDate, "PPP", { locale: ptBR })}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="default" className="border-green-500 bg-green-50">
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-900">Prazo em Dia</AlertTitle>
      <AlertDescription className="text-green-800">
        Você tem <strong>{diasRestantes} dia(s)</strong> para responder.
        <br />
        Prazo: {format(prazoDate, "PPP", { locale: ptBR })}
      </AlertDescription>
    </Alert>
  );
}