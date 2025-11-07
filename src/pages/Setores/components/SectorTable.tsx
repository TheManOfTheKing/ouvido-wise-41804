import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Power, Loader2, Trash2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { SectorFormModal } from "./SectorFormModal";
import { useSetores } from "@/hooks/useSetores";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConfirmDeleteSectorModal } from "./ConfirmDeleteSectorModal";

type Setor = Tables<'setores'>;

interface SectorTableProps {
  setores?: Setor[];
  isLoading: boolean;
}

export function SectorTable({ setores = [], isLoading }: SectorTableProps) {
  const [editingSetor, setEditingSetor] = useState<Setor | null>(null);
  const [setorToDelete, setSetorToDelete] = useState<Setor | null>(null);
  const { toggleAtivo, isToggling } = useSetores();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Sigla</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {setores.map((setor) => (
              <TableRow key={setor.id}>
                <TableCell>{setor.nome}</TableCell>
                <TableCell>{setor.sigla}</TableCell>
                <TableCell>{setor.email || '-'}</TableCell>
                <TableCell>{setor.telefone || '-'}</TableCell>
                <TableCell>
                  <Badge variant={setor.ativo ? 'outline' : 'secondary'}>
                    {setor.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingSetor(setor)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Editar setor</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleAtivo({ id: setor.id, ativo: !setor.ativo })}
                        disabled={isToggling}
                        className={!setor.ativo ? "text-muted-foreground opacity-70" : ""}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{setor.ativo ? "Desativar setor" : "Ativar setor"}</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSetorToDelete(setor)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Excluir setor</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {setores.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Nenhum setor encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <SectorFormModal
        open={!!editingSetor}
        onClose={() => setEditingSetor(null)}
        setor={editingSetor}
      />

      {setorToDelete && (
        <ConfirmDeleteSectorModal
          open={!!setorToDelete}
          onClose={() => setSetorToDelete(null)}
          sectorId={setorToDelete.id}
          sectorName={setorToDelete.nome}
        />
      )}
    </>
  );
}