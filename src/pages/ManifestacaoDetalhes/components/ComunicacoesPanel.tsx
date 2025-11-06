import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Mail, Phone, User, Lock, Send } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useComunicacao } from "../hooks/useComunicacao";
import { Separator } from "@/components/ui/separator";

interface Comunicacao {
  id: string;
  tipo: string;
  mensagem: string;
  interno: boolean;
  destinatario: string;
  remetente: string;
  assunto: string | null;
  data_envio: string;
  usuario: { nome: string } | null;
}

interface ComunicacoesPanelProps {
  manifestacaoId: string;
  comunicacoes: Comunicacao[];
}

const tipoIcons = {
  EMAIL: Mail,
  TELEFONE: Phone,
  PRESENCIAL: User,
  COMENTARIO: MessageSquare,
};

export function ComunicacoesPanel({ manifestacaoId, comunicacoes }: ComunicacoesPanelProps) {
  const [novaComunicacao, setNovaComunicacao] = useState({
    tipo: "COMENTARIO" as "EMAIL" | "TELEFONE" | "PRESENCIAL" | "COMENTARIO",
    mensagem: "",
    interno: true,
  });

  const { adicionarComunicacao } = useComunicacao();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!novaComunicacao.mensagem.trim()) return;

    adicionarComunicacao.mutate({
      manifestacaoId,
      tipo: novaComunicacao.tipo,
      mensagem: novaComunicacao.mensagem,
      interno: novaComunicacao.interno,
    }, {
      onSuccess: () => {
        setNovaComunicacao({
          tipo: "COMENTARIO",
          mensagem: "",
          interno: true,
        });
      }
    });
  };

  const comunicacoesOrdenadas = [...comunicacoes].sort(
    (a, b) => new Date(b.data_envio).getTime() - new Date(a.data_envio).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <CardTitle>Comunicações</CardTitle>
          <Badge variant="secondary">{comunicacoes.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Formulário para nova comunicação */}
        <form onSubmit={handleSubmit} className="space-y-3 mb-6 p-4 bg-muted rounded-lg">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="tipo-comunicacao">Tipo</Label>
              <Select
                value={novaComunicacao.tipo}
                onValueChange={(value: any) => setNovaComunicacao({ ...novaComunicacao, tipo: value })}
              >
                <SelectTrigger id="tipo-comunicacao">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMENTARIO">Comentário</SelectItem>
                  <SelectItem value="TELEFONE">Telefone</SelectItem>
                  <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                  <SelectItem value="EMAIL">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={novaComunicacao.interno}
                  onChange={(e) => setNovaComunicacao({ ...novaComunicacao, interno: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Comunicação interna
                </span>
              </label>
            </div>
          </div>

          <div>
            <Label htmlFor="mensagem-comunicacao">Mensagem</Label>
            <Textarea
              id="mensagem-comunicacao"
              value={novaComunicacao.mensagem}
              onChange={(e) => setNovaComunicacao({ ...novaComunicacao, mensagem: e.target.value })}
              placeholder="Registre aqui a comunicação..."
              rows={3}
            />
          </div>

          <Button type="submit" size="sm" disabled={adicionarComunicacao.isPending}>
            <Send className="h-4 w-4 mr-2" />
            Adicionar Comunicação
          </Button>
        </form>

        <Separator className="my-6" />

        {/* Timeline de comunicações */}
        <div className="space-y-4">
          {comunicacoesOrdenadas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nenhuma comunicação registrada ainda</p>
            </div>
          ) : (
            comunicacoesOrdenadas.map((comunicacao, index) => {
              const Icon = tipoIcons[comunicacao.tipo as keyof typeof tipoIcons];
              
              return (
                <div key={comunicacao.id}>
                  {index > 0 && <Separator className="my-4" />}
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{comunicacao.usuario?.nome || comunicacao.remetente}</span>
                        <Badge variant="outline" className="text-xs">
                          {comunicacao.tipo}
                        </Badge>
                        {comunicacao.interno && (
                          <Badge variant="secondary" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Interno
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {format(new Date(comunicacao.data_envio), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      
                      {comunicacao.assunto && (
                        <p className="text-sm font-medium">{comunicacao.assunto}</p>
                      )}
                      
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {comunicacao.mensagem}
                      </p>
                      
                      {!comunicacao.interno && (
                        <p className="text-xs text-muted-foreground">
                          Para: {comunicacao.destinatario}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
