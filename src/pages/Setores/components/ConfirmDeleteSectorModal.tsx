import React from "react";
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
  const { mutate: deleteSetor, isDeleting } = useSetores();

  const handleDelete = async () => {
    console.log("handleDelete called for sectorId:", sectorId);
    deleteSetor(sectorId, {
      onSuccess: () => {
        console.log("deleteSetor onSuccess callback");
        onClose();
      },
      onError: (error) => {
        console.error("deleteSetor onError callback:", error);
        // The useSetores hook already handles toast.error, so no need to duplicate here
      }
    });
  };

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