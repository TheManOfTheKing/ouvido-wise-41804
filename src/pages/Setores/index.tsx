import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, ArrowLeft } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectorTable } from "./components/SectorTable";
import { SectorFormModal } from "./components/SectorFormModal";
import { useSetores } from "@/hooks/useSetores";
import { AppLayout } from "@/components/AppLayout";

export default function SetoresPage() {
  const navigate = useNavigate();
  const { canManageSectors } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const { data: setores, isLoading, error } = useSetores();

  if (!canManageSectors) {
    navigate("/dashboard");
    return null;
  }

  return (
    <AppLayout>
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
          <h1 className="text-2xl font-bold">Gestão de Setores</h1>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Setor
          </Button>
        </div>

        <div className="flex items-center space-x-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar setores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-6">
            Erro ao carregar setores. Tente novamente.
          </div>
        )}

        <SectorTable 
          setores={setores?.filter(s => 
            s.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.sigla?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email?.toLowerCase().includes(searchTerm.toLowerCase())
          )}
          isLoading={isLoading}
        />

        <SectorFormModal 
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </div>
    </AppLayout>
  );
}