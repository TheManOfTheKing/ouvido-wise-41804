import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface FilterSidebarProps {
  filters: {
    status: string[];
    tipo: string[];
    prioridade: string[];
    prazo: string[];
  };
  onFilterChange: (category: string, value: string) => void;
  onClearFilters: () => void;
}

const filterOptions = {
  status: [
    { value: "NOVA", label: "Nova" },
    { value: "EM_ANALISE", label: "Em Análise" },
    { value: "ENCAMINHADA", label: "Encaminhada" },
    { value: "EM_ATENDIMENTO", label: "Em Atendimento" },
    { value: "RESPONDIDA", label: "Respondida" },
    { value: "ENCERRADA", label: "Encerrada" }
  ],
  tipo: [
    { value: "ELOGIO", label: "Elogio" },
    { value: "SUGESTAO", label: "Sugestão" },
    { value: "RECLAMACAO", label: "Reclamação" },
    { value: "DENUNCIA", label: "Denúncia" },
    { value: "SOLICITACAO", label: "Solicitação" }
  ],
  prioridade: [
    { value: "BAIXA", label: "Baixa" },
    { value: "MEDIA", label: "Média" },
    { value: "ALTA", label: "Alta" },
    { value: "URGENTE", label: "Urgente" }
  ],
  prazo: [
    { value: "em_dia", label: "No Prazo" },
    { value: "proximo_vencimento", label: "Próximo do Vencimento" },
    { value: "vencido", label: "Vencido" }
  ]
};

export function FilterSidebar({ filters, onFilterChange, onClearFilters }: FilterSidebarProps) {
  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-semibold">Filtros</CardTitle>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="mr-2 h-4 w-4" />
            Limpar
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Status</Label>
          <div className="space-y-2">
            {filterOptions.status.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${option.value}`}
                  checked={filters.status.includes(option.value)}
                  onCheckedChange={() => onFilterChange("status", option.value)}
                />
                <label
                  htmlFor={`status-${option.value}`}
                  className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Tipo */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Tipo</Label>
          <div className="space-y-2">
            {filterOptions.tipo.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`tipo-${option.value}`}
                  checked={filters.tipo.includes(option.value)}
                  onCheckedChange={() => onFilterChange("tipo", option.value)}
                />
                <label
                  htmlFor={`tipo-${option.value}`}
                  className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Prioridade */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Prioridade</Label>
          <div className="space-y-2">
            {filterOptions.prioridade.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`prioridade-${option.value}`}
                  checked={filters.prioridade.includes(option.value)}
                  onCheckedChange={() => onFilterChange("prioridade", option.value)}
                />
                <label
                  htmlFor={`prioridade-${option.value}`}
                  className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Prazo */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Prazo</Label>
          <div className="space-y-2">
            {filterOptions.prazo.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`prazo-${option.value}`}
                  checked={filters.prazo.includes(option.value)}
                  onCheckedChange={() => onFilterChange("prazo", option.value)}
                />
                <label
                  htmlFor={`prazo-${option.value}`}
                  className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
