import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useManifestacoes } from "./hooks/useManifestacoes";
import { ManifestacaoCard } from "./components/ManifestacaoCard";
import { ManifestacaoTable } from "./components/ManifestacaoTable";
import { FilterSidebar } from "./components/FilterSidebar";
import { AppLayout } from "@/components/AppLayout";
import {
  Search,
  Filter,
  LayoutGrid,
  LayoutList,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

export default function Manifestacoes() {
  const { usuario } = useAuth();
  const { canViewAll } = usePermissions();

  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [busca, setBusca] = useState("");
  const [debouncedBusca, setDebouncedBusca] = useState("");
  const [filters, setFilters] = useState({
    status: [] as string[],
    tipo: [] as string[],
    prioridade: [] as string[],
    prazo: [] as string[],
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [sortBy, setSortBy] = useState("data_recebimento");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Debounce da busca
  const handleBuscaChange = (value: string) => {
    setBusca(value);
    const timeout = setTimeout(() => {
      setDebouncedBusca(value);
      setPage(1);
    }, 500);
    return () => clearTimeout(timeout);
  };

  const { data, isLoading, error } = useManifestacoes({
    busca: debouncedBusca,
    status: filters.status,
    tipo: filters.tipo,
    prioridade: filters.prioridade,
    prazo: filters.prazo,
    page,
    pageSize,
    sortBy,
    sortOrder,
  });

  const handleFilterChange = (category: string, value: string) => {
    setFilters((prev) => {
      const current = prev[category as keyof typeof prev];
      const newValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [category]: newValues };
    });
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      status: [],
      tipo: [],
      prioridade: [],
      prazo: [],
    });
    setPage(1);
  };

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de Filtros - Desktop */}
          <aside className="hidden lg:block">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </aside>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-3 space-y-4">
            {/* Barra de Ações */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Busca */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por protocolo ou descrição..."
                        value={busca}
                        onChange={(e) => handleBuscaChange(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Controles */}
                  <div className="flex gap-2">
                    {/* Filtros Mobile */}
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="lg:hidden">
                          <Filter className="h-4 w-4" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left">
                        <FilterSidebar
                          filters={filters}
                          onFilterChange={handleFilterChange}
                          onClearFilters={handleClearFilters}
                        />
                      </SheetContent>
                    </Sheet>

                    {/* Ordenação */}
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="data_recebimento">Data de Recebimento</SelectItem>
                        <SelectItem value="prazo_resposta">Prazo</SelectItem>
                        <SelectItem value="prioridade">Prioridade</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Modo de Visualização */}
                    <div className="flex border rounded-md">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="icon"
                        onClick={() => setViewMode("grid")}
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "table" ? "default" : "ghost"}
                        size="icon"
                        onClick={() => setViewMode("table")}
                      >
                        <LayoutList className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Contadores */}
                <div className="mt-4 text-sm text-muted-foreground">
                  {isLoading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    <span>
                      Mostrando {data?.manifestacoes.length || 0} de {data?.total || 0} manifestações
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                {viewMode === "grid" ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i}>
                        <CardContent className="pt-6">
                          <Skeleton className="h-24 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <Skeleton className="h-96 w-full" />
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Error State */}
            {error && (
              <Card>
                <CardContent className="pt-6 text-center text-destructive">
                  <p>Erro ao carregar manifestações: {(error as Error).message}</p>
                </CardContent>
              </Card>
            )}

            {/* Resultados */}
            {!isLoading && !error && data && (
              <>
                {viewMode === "grid" ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {data.manifestacoes.map((manifestacao) => (
                      <ManifestacaoCard key={manifestacao.id} manifestacao={manifestacao} />
                    ))}
                  </div>
                ) : (
                  <ManifestacaoTable manifestacoes={data.manifestacoes} />
                )}

                {/* Paginação */}
                {totalPages > 1 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" />
                          Anterior
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Página {page} de {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                        >
                          Próxima
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
