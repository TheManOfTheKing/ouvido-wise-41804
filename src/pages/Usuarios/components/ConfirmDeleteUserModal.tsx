import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteUsuario } from "../hooks/useDeleteUsuario";
import { Loader2 } from "lucide-react";

interface ConfirmDeleteUserModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export function ConfirmDeleteUserModal({ open, onClose, userId, userName }: ConfirmDeleteUserModalProps) {
  const { mutate: deleteUsuario, isPending } = useDeleteUsuario();

  const handleDelete = async () => {
    deleteUsuario(userId, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Exclusão de Usuário</DialogTitle>
        </DialogHeader>
        <p>Tem certeza de que deseja excluir o usuário <strong>{userName}</strong>? Esta ação não pode ser desfeita.</p>
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