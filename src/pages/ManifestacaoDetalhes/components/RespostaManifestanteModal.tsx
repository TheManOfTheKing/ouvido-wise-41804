import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface RespostaManifestanteModalProps {
  open: boolean;
  onClose: () => void;
  manifestacaoId: string;
  protocolo: string;
  manifestante: {
    nome: string;
    email?: string;
  } | null;
}

const TEMPLATES = {
  agradecimento: {
    nome: "Agradecimento",
    assunto: "Agradecimento - Manifestação {protocolo}",
    corpo: `Prezado(a) {nome},

Agradecemos por entrar em contato com nossa Ouvidoria através da manifestação {protocolo}.

Sua contribuição é muito importante para a melhoria contínua de nossos serviços.

Atenciosamente,
Equipe de Ouvidoria`
  },
  resolucao: {
    nome: "Resolução de Demanda",
    assunto: "Resolução - Manifestação {protocolo}",
    corpo: `Prezado(a) {nome},

Em resposta à sua manifestação de protocolo {protocolo}, informamos que:

[Descreva aqui as medidas tomadas e a resolução do caso]

Colocamo-nos à disposição para quaisquer esclarecimentos adicionais.

Atenciosamente,
Equipe de Ouvidoria`
  },
  andamento: {
    nome: "Andamento",
    assunto: "Andamento - Manifestação {protocolo}",
    corpo: `Prezado(a) {nome},

Informamos que sua manifestação {protocolo} está em andamento.

[Descreva aqui o status atual e as ações em curso]

Manteremos você informado sobre os próximos passos.

Atenciosamente,
Equipe de Ouvidoria`
  },
  personalizada: {
    nome: "Resposta Personalizada",
    assunto: "",
    corpo: ""
  }
};

export function RespostaManifestanteModal({ 
  open, 
  onClose, 
  manifestacaoId, 
  protocolo,
  manifestante 
}: RespostaManifestanteModalProps) {
  const [template, setTemplate] = useState<keyof typeof TEMPLATES>("resolucao");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [destinatario, setDestinatario] = useState(manifestante?.email || "");
  const [enviando, setEnviando] = useState(false);

  const aplicarTemplate = (templateKey: keyof typeof TEMPLATES) => {
    const t = TEMPLATES[templateKey];
    setTemplate(templateKey);
    
    const assuntoFormatado = t.assunto
      .replace("{protocolo}", protocolo)
      .replace("{nome}", manifestante?.nome || "");
    
    const corpoFormatado = t.corpo
      .replace(/{protocolo}/g, protocolo)
      .replace(/{nome}/g, manifestante?.nome || "");
    
    setAssunto(assuntoFormatado);
    setMensagem(corpoFormatado);
  };

  const handleEnviar = async () => {
    if (!destinatario || !assunto.trim() || !mensagem.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setEnviando(true);

    try {
      const { data, error } = await supabase.functions.invoke("enviar-resposta", {
        body: {
          manifestacaoId,
          destinatario,
          assunto,
          mensagem,
          protocolo,
          nomeManifestante: manifestante?.nome || "Manifestante",
        },
      });

      if (error) throw error;

      toast.success("Resposta enviada com sucesso!");
      onClose();
      
      // Reset form
      setTemplate("resolucao");
      setAssunto("");
      setMensagem("");
      setDestinatario(manifestante?.email || "");
    } catch (error: any) {
      console.error("Erro ao enviar resposta:", error);
      toast.error(error.message || "Erro ao enviar resposta");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enviar Resposta ao Manifestante</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="template">Template</Label>
            <Select
              value={template}
              onValueChange={(value: keyof typeof TEMPLATES) => aplicarTemplate(value)}
            >
              <SelectTrigger id="template">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TEMPLATES).map(([key, t]) => (
                  <SelectItem key={key} value={key}>
                    {t.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="destinatario">Destinatário *</Label>
            <Input
              id="destinatario"
              type="email"
              value={destinatario}
              onChange={(e) => setDestinatario(e.target.value)}
              placeholder="email@exemplo.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="assunto">Assunto *</Label>
            <Input
              id="assunto"
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              placeholder="Assunto do email"
              required
            />
          </div>

          <div>
            <Label htmlFor="mensagem">Mensagem *</Label>
            <Textarea
              id="mensagem"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Digite a mensagem..."
              rows={12}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              A mensagem será enviada por email ao manifestante
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleEnviar} disabled={enviando}>
              {enviando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Resposta
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
