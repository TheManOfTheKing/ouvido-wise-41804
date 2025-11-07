import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Forward,
  MessageSquare,
  CheckCircle,
  Edit,
  Trash2,
  FileText,
  AlertTriangle,
  Send,
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { EncaminharModal } from "./EncaminharModal";
import { RespostaManifestanteModal } from "./RespostaManifestanteModal";

interface ActionPanelProps {
  manifestacao: any;
}

export function ActionPanel({ manifestacao }: ActionPanelProps) {
  const { isAdmin, isOuvidor, isAssistente, canViewAll } = usePermissions();
  const [encaminharModalOpen, setEncaminharModalOpen] = useState(false);
  const [respostaModalOpen, setRespostaModalOpen] = useState(false);
  
  const canEdit = canViewAll || manifestacao.status === "NOVA" || manifestacao.status === "EM_ANALISE";
  const canForward = canViewAll || isAssistente;
  const canRespond = canViewAll || isAssistente;
  const canClose = (isAdmin || isOuvidor) && manifestacao.status === "RESPONDIDA";
  const canDelete = isAdmin;

  const isEncerrada = manifestacao.status === "ENCERRADA";

  return (
    <>
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="text-lg">Ações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!isEncerrada && (
            <>
              {canEdit && (
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              )}

              {canForward && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  size="sm"
                  onClick={() => setEncaminharModalOpen(true)}
                >
                  <Forward className="mr-2 h-4 w-4" />
                  Encaminhar
                </Button>
              )}

            {canRespond && manifestacao.status !== "RESPONDIDA" && (
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                size="sm"
                onClick={() => setRespostaModalOpen(true)}
                disabled={!manifestacao.manifestante?.email}
              >
                <Send className="mr-2 h-4 w-4" />
                Responder Manifestante
              </Button>
            )}

            <Button variant="outline" className="w-full justify-start" size="sm">
              <MessageSquare className="mr-2 h-4 w-4" />
              Adicionar Comentário
            </Button>

            {canClose && (
              <Button variant="default" className="w-full justify-start" size="sm">
                <CheckCircle className="mr-2 h-4 w-4" />
                Encerrar
              </Button>
            )}
          </>
        )}

        {isEncerrada && (
          <div className="text-sm text-muted-foreground text-center py-4">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p>Manifestação encerrada</p>
            <p className="text-xs mt-1">Não é possível realizar ações</p>
          </div>
        )}

        {canDelete && (
          <>
            <div className="border-t pt-2 mt-4" />
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              size="sm"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </>
        )}
        </CardContent>
      </Card>

      <EncaminharModal
        open={encaminharModalOpen}
        onOpenChange={setEncaminharModalOpen}
        manifestacaoId={manifestacao.id}
        isSigilosa={manifestacao.sigilosa}
        tipo={manifestacao.tipo}
      />

      <RespostaManifestanteModal
        open={respostaModalOpen}
        onClose={() => setRespostaModalOpen(false)}
        manifestacaoId={manifestacao.id}
        protocolo={manifestacao.protocolo}
        manifestante={manifestacao.manifestante}
      />
    </>
  );
}