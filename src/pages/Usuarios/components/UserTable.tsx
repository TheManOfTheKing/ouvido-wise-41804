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
import { UserFormModal } from "./UserFormModal";
import { useUsuarios } from "../hooks/useUsuarios";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConfirmDeleteUserModal } from "./ConfirmDeleteUserModal";
import { usePermissions } from "@/hooks/usePermissions"; // Import usePermissions

type Usuario = Tables<'usuarios'>;

interface UserTableProps {
  usuarios?: Usuario[];
  isLoading: boolean;
}

export function UserTable({ usuarios = [], isLoading }: UserTableProps) {
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);
  const { toggleAtivo, isToggling } = useUsuarios();
  const { canManageUsers } = usePermissions(); // Use permissions hook

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
              <TableHead>Email</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell>{usuario.nome}</TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>
                  <Badge variant={usuario.perfil === 'ADMIN' ? 'destructive' : 'default'}>
                    {
                      {
                        'ADMIN': 'Administrador',
                        'OUVIDOR': 'Ouvidor',
                        'GESTOR': 'Gestor',
                        'ASSISTENTE': 'Assistente',
                        'ANALISTA': 'Analista',
                        'CONSULTA': 'Consulta',
                      }[usuario.perfil]
                    }
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={usuario.ativo ? 'outline' : 'secondary'}>
                    {usuario.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell>{usuario.cargo || '-'}</TableCell>
                <TableCell>{usuario.telefone || '-'}</TableCell>
                <TableCell className="text-right">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingUser(usuario)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Editar usuário</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleAtivo({ id: usuario.id, ativo: !usuario.ativo })}
                        disabled={isToggling}
                        className={!usuario.ativo ? "text-muted-foreground opacity-70" : ""}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{usuario.ativo ? "Desativar usuário" : "Ativar usuário"}</p>
                    </TooltipContent>
                  </Tooltip>

                  {canManageUsers && ( // Only show delete button if user has permission
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setUserToDelete(usuario)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Excluir usuário</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {usuarios.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <UserFormModal
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        usuario={editingUser}
      />

      {userToDelete && (
        <ConfirmDeleteUserModal
          open={!!userToDelete}
          onClose={() => setUserToDelete(null)}
          userId={userToDelete.id}
          userName={userToDelete.nome}
        />
      )}
    </>
  );
}