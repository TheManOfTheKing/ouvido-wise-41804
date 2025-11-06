import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Minus, TrendingUp, Zap } from "lucide-react";

const prioridadeConfig = {
  BAIXA: {
    label: "Baixa",
    icon: Minus,
    className: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
  },
  MEDIA: {
    label: "Média",
    icon: TrendingUp,
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
  },
  ALTA: {
    label: "Alta",
    icon: AlertTriangle,
    className: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20"
  },
  URGENTE: {
    label: "Urgente",
    icon: Zap,
    className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
  }
};

interface PrioridadeBadgeProps {
  prioridade: keyof typeof prioridadeConfig;
  showIcon?: boolean;
}

export function PrioridadeBadge({ prioridade, showIcon = true }: PrioridadeBadgeProps) {
  const config = prioridadeConfig[prioridade] || prioridadeConfig.MEDIA;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
