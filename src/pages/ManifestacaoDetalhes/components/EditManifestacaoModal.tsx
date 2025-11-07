import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EditManifestacaoModalProps {
  open: boolean;
  onClose: () => void;
  manifestacao: any;
}

export function EditManifestacaoModal({ open, onClose, manifestacao }: EditManifestacaoModalProps) {
  const [descricao, setDescricao] = useState(manifestacao.descricao);

  const handleSave = async () => {
    const { error } = await supabase
      .from("manifestacoes")
      .update({ descricao })
      .eq("id", manifestacao.id);

    if (error) {
      console.error("Erro ao salvar manifestação:", error.message);
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Manifestação</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição da manifestação"
          />
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}