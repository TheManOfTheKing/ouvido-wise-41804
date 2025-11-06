import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificacoes } from "@/hooks/useNotificacoes";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function NotificationsDropdown() {
  const { notificacoes, naoLidas, marcarComoLida, marcarTodasComoLidas } = useNotificacoes();
  const navigate = useNavigate();

  const handleNotificationClick = (notificacao: any) => {
    if (!notificacao.lida) {
      marcarComoLida.mutate(notificacao.id);
    }
    if (notificacao.link) {
      navigate(notificacao.link);
    }
  };

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      ENCAMINHAMENTO: "text-blue-600",
      PRAZO_VENCIMENTO: "text-red-600",
      RESPOSTA: "text-green-600",
      COMENTARIO: "text-purple-600",
    };
    return colors[tipo] || "text-gray-600";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {naoLidas > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {naoLidas > 9 ? "9+" : naoLidas}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2">
          <h3 className="font-semibold">Notificações</h3>
          {naoLidas > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => marcarTodasComoLidas.mutate()}
              className="h-auto p-1 text-xs"
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {notificacoes.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma notificação
            </div>
          ) : (
            notificacoes.map((notificacao) => (
              <DropdownMenuItem
                key={notificacao.id}
                className={cn(
                  "flex flex-col items-start gap-1 p-4 cursor-pointer",
                  !notificacao.lida && "bg-accent/50"
                )}
                onClick={() => handleNotificationClick(notificacao)}
              >
                <div className="flex items-center gap-2 w-full">
                  <span className={cn("text-xs font-medium", getTipoColor(notificacao.tipo))}>
                    {notificacao.tipo.replace("_", " ")}
                  </span>
                  {!notificacao.lida && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <p className="text-sm font-medium">{notificacao.titulo}</p>
                <p className="text-xs text-muted-foreground">{notificacao.mensagem}</p>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notificacao.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
