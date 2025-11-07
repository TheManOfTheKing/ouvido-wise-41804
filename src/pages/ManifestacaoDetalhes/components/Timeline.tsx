import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  FileText,
  Send,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TimelineProps {
  manifestacao: any;
}

export function Timeline({ manifestacao }: TimelineProps) {
  const eventos = [];

  // Evento de criação
  eventos.push({
    id: `created-${manifestacao.id}`,
    tipo: "criacao",
    data: manifestacao.created_at,
    titulo: "Manifestação criada",
    descricao: `Registrada via ${manifestacao.canal}`,
    icon: FileText,
  });

  // Encaminhamentos
  if (manifestacao.encaminhamentos) {
    manifestacao.encaminhamentos.forEach((enc: any) => {
      eventos.push({
        id: enc.id,
        tipo: "encaminhamento",
        data: enc.data_encaminhamento,
        titulo: "Encaminhada",
        descricao: `De ${enc.setor_origem?.nome || "Ouvidoria"} para ${enc.setor_destino?.nome}`,
        subtitulo: enc.usuario_origem?.nome,
        icon: ArrowRight,
        detalhes: enc.instrucoes,
      });

      if (enc.data_retorno) {
        eventos.push({
          id: `${enc.id}-retorno`,
          tipo: "retorno",
          data: enc.data_retorno,
          titulo: "Retorno recebido",
          descricao: `${enc.setor_destino?.nome} respondeu`,
          icon: CheckCircle,
          detalhes: enc.resposta_setor,
        });
      }
    });
  }

  // Comunicações
  if (manifestacao.comunicacoes) {
    manifestacao.comunicacoes.forEach((com: any) => {
      eventos.push({
        id: com.id,
        tipo: com.tipo,
        data: com.data_envio,
        titulo: com.interno ? "Comentário interno" : "Comunicação enviada",
        descricao: com.assunto || `${com.tipo} enviado para ${com.destinatario}`,
        subtitulo: com.usuario?.nome,
        icon: com.interno ? MessageSquare : Send,
        avatar: com.usuario?.avatar,
      });
    });
  }

  // Status de resposta
  if (manifestacao.data_resposta) {
    eventos.push({
      id: `resposta-${manifestacao.id}`,
      tipo: "resposta",
      data: manifestacao.data_resposta,
      titulo: "Manifestação respondida",
      descricao: "Resposta formal enviada ao manifestante",
      icon: CheckCircle,
    });
  }

  // Status de encerramento
  if (manifestacao.data_encerramento) {
    eventos.push({
      id: `encerramento-${manifestacao.id}`,
      tipo: "encerramento",
      data: manifestacao.data_encerramento,
      titulo: "Manifestação encerrada",
      descricao: "Caso finalizado",
      icon: CheckCircle,
    });
  }

  // Ordenar por data (mais recente primeiro)
  eventos.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  return (
    <div className="space-y-4">
      {eventos.map((evento, index) => {
        const Icon = evento.icon;
        const isLast = index === eventos.length - 1;

        return (
          <div key={evento.id} className="relative">
            {!isLast && (
              <div className="absolute left-5 top-12 bottom-0 w-px bg-border" />
            )}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    {evento.avatar ? (
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{evento.titulo}</h4>
                      <time className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(evento.data), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </time>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {evento.descricao}
                    </p>
                    {evento.subtitulo && (
                      <p className="text-xs text-muted-foreground">
                        por {evento.subtitulo}
                      </p>
                    )}
                    {evento.detalhes && (
                      <div className="mt-2 p-3 bg-muted/50 rounded-md text-sm">
                        {evento.detalhes}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
