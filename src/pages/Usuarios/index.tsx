import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, ArrowLeft } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserTable } from "./components/UserTable";
import { UserFormModal } from "./components/UserFormModal";
import { useUsuarios } from "./hooks/useUsuarios";

export default function UsuariosPage() {
  const navigate = useNavigate();
  const { canManageUsers } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const { data: usuarios, isLoading, error } = useUsuarios();

  if (!canManageUsers) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate("/dashboard")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestão de Usuários</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-6">
          Erro ao carregar usuários. Tente novamente.
        </div>
      )}

      <UserTable 
        usuarios={usuarios?.filter(u => 
          u.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.cargo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.telefone?.toLowerCase().includes(searchTerm.toLowerCase())
        )}
        isLoading={isLoading}
      />

      <UserFormModal 
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}