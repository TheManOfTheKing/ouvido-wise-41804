import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

interface AdicionarComentarioModalProps {
  open: boolean;
  onClose: () => void;
  manifestacaoId: string;
}

export function AdicionarComentarioModal({ open, onClose, manifestacaoId }: AdicionarComentarioModalProps) {
  const [comentario, setComentario] = useState("");

  const handleSave = async () => {
    const { error } = await supabase
      .from("comunicacoes")
      .insert({
        manifestacao_id: manifestacaoId,
        mensagem: comentario,
        tipo: "COMENTARIO",
        destinatario: "Sistema",
        remetente: "Sistema",
      });

    if (error) {
      console.error("Erro ao adicionar comentário:", error.message);
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Comentário</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Escreva seu comentário aqui"
          />
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}