import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  manifestacaoId: string;
}

export function ConfirmDeleteModal({ open, onClose, manifestacaoId }: ConfirmDeleteModalProps) {
  const handleDelete = async () => {
    const { error } = await supabase
      .from("manifestacoes")
      .delete()
      .eq("id", manifestacaoId);

    if (error) {
      console.error("Erro ao excluir manifestação:", error.message);
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
        </DialogHeader>
        <p>Tem certeza de que deseja excluir esta manifestação?</p>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Excluir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}