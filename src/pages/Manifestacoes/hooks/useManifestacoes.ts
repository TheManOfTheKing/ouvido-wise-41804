import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, isPast } from "date-fns";

interface ManifestacaoFilters {
  busca?: string;
  status: string[];
  tipo: string[];
  prioridade: string[];
  prazo: string[];
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export function useManifestacoes(filters: ManifestacaoFilters) {
  return useQuery({
    queryKey: ["manifestacoes", filters],
    queryFn: async () => {
      let query = supabase
        .from("manifestacoes")
        .select(
          `
          *,
          manifestante:manifestantes(id, nome),
          setor:setores(id, nome, sigla),
          responsavel:usuarios(id, nome)
        `,
          { count: "exact" }
        );

      // Busca textual
      if (filters.busca) {
        query = query.or(
          `protocolo.ilike.%${filters.busca}%,descricao.ilike.%${filters.busca}%`
        );
      }

      // Filtros de status
      if (filters.status.length > 0) {
        query = query.in("status", filters.status as any);
      }

      // Filtros de tipo
      if (filters.tipo.length > 0) {
        query = query.in("tipo", filters.tipo as any);
      }

      // Filtros de prioridade
      if (filters.prioridade.length > 0) {
        query = query.in("prioridade", filters.prioridade as any);
      }

      // Ordenação
      query = query.order(filters.sortBy, { ascending: filters.sortOrder === "asc" });

      // Paginação
      const from = (filters.page - 1) * filters.pageSize;
      const to = from + filters.pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Filtrar por prazo no client-side (pois depende de lógica de data)
      let filteredData = data || [];
      if (filters.prazo.length > 0) {
        filteredData = filteredData.filter((m) => {
          if (!m.prazo_resposta) return false;
          
          const prazoDate = new Date(m.prazo_resposta);
          const hoje = new Date();
          const diasRestantes = differenceInDays(prazoDate, hoje);
          const vencido = isPast(prazoDate);

          if (filters.prazo.includes("vencido") && vencido) return true;
          if (filters.prazo.includes("proximo_vencimento") && !vencido && diasRestantes <= 3) return true;
          if (filters.prazo.includes("em_dia") && !vencido && diasRestantes > 3) return true;

          return false;
        });
      }

      return { 
        manifestacoes: filteredData, 
        total: count || 0,
        filteredTotal: filteredData.length
      };
    },
    staleTime: 30000, // 30 segundos
  });
}
