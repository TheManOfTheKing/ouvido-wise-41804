import React, { useCallback } from "react"; // Import useCallback
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSetores } from "@/hooks/useSetores";
import { Loader2 } from "lucide-react";

interface ConfirmDeleteSectorModalProps {
  open: boolean;
  onClose: () => void;
  sectorId: string;
  sectorName: string;
}

export function ConfirmDeleteSectorModal({ open, onClose, sectorId, sectorName }: ConfirmDeleteSectorModalProps) {
  const { deleteSetor, isDeleting } = useSetores();

  const handleDelete = useCallback(async () => { // Usando useCallback
    console.log("handleDelete called for sectorId:", sectorId);
    console.log("Type of deleteSetor:", typeof deleteSetor); // Novo log
    console.log("Value of deleteSetor:", deleteSetor); // Novo log

    if (typeof deleteSetor === 'function') {
      deleteSetor(sectorId, {
        onSuccess: () => {
          console.log("deleteSetor onSuccess callback");
          onClose();
        },
        onError: (error) => {
          console.error("deleteSetor onError callback:", error);
        }
      });
    } else {
      console.error("deleteSetor is not a function. Cannot proceed with deletion.");
      // Opcionalmente, você pode adicionar um toast de erro aqui para o usuário
      // toast.error("Erro interno: A função de exclusão não está disponível.");
    }
  }, [deleteSetor, sectorId, onClose]); // Adicionando dependências

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Exclusão de Setor</DialogTitle>
        </DialogHeader>
        <p>Tem certeza de que deseja excluir o setor <strong>{sectorName}</strong>? Esta ação não pode ser desfeita.</p>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}