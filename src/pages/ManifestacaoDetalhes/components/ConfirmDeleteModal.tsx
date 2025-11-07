import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteManifestacao } from "../hooks/useDeleteManifestacao";
import { Loader2 } from "lucide-react";

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  manifestacaoId: string;
}

export function ConfirmDeleteModal({ open, onClose, manifestacaoId }: ConfirmDeleteModalProps) {
  const { mutate: deleteManifestacao, isPending } = useDeleteManifestacao();

  const handleDelete = async () => {
    deleteManifestacao(manifestacaoId, {
      onSuccess: () => {
        onClose(); // Fecha o modal após o sucesso
      },
      // onError é tratado pelo hook, então não precisamos de um callback aqui
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
        </DialogHeader>
        <p>Tem certeza de que deseja excluir esta manifestação? Esta ação não pode ser desfeita.</p>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}