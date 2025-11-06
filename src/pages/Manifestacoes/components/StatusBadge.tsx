import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, ArrowRight, CheckCircle, CheckCircle2 } from "lucide-react";

const statusConfig = {
  NOVA: {
    label: "Nova",
    variant: "default" as const,
    icon: AlertCircle,
    className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
  },
  EM_ANALISE: {
    label: "Em Análise",
    variant: "secondary" as const,
    icon: Clock,
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
  },
  ENCAMINHADA: {
    label: "Encaminhada",
    variant: "secondary" as const,
    icon: ArrowRight,
    className: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20"
  },
  EM_ATENDIMENTO: {
    label: "Em Atendimento",
    variant: "secondary" as const,
    icon: Clock,
    className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20"
  },
  RESPONDIDA: {
    label: "Respondida",
    variant: "default" as const,
    icon: CheckCircle,
    className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
  },
  ENCERRADA: {
    label: "Encerrada",
    variant: "outline" as const,
    icon: CheckCircle2,
    className: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
  }
};

interface StatusBadgeProps {
  status: keyof typeof statusConfig;
  showIcon?: boolean;
}

export function StatusBadge({ status, showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.NOVA;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
