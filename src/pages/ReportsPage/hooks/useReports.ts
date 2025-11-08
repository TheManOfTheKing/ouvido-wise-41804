import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, endOfDay } from "date-fns";
import { Enums } from "@/integrations/supabase/types"; // Import Enums para tipagem

interface ReportFilters {
  startDate: Date;
  endDate: Date;
}

// Definir tipos para os valores de retorno das funções RPC
interface ManifestacoesByType {
  tipo: Enums<'tipo_manifestacao'>;
  count: number;
}

interface ManifestacoesByStatus {
  status: Enums<'status_manifestacao'>;
  count: number;
}

interface ManifestacoesOverTime {
  date: string; // O tipo 'date' do postgres será string em JS
  count: number;
}

export function useReports(filters: ReportFilters) {
  return useQuery({
    queryKey: ["reports", filters.startDate, filters.endDate],
    queryFn: async () => {
      const start = format(startOfDay(filters.startDate), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
      const end = format(endOfDay(filters.endDate), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

      // Manifestações por Tipo (usando RPC)
      const { data: byType, error: typeError } = await supabase
        .rpc("get_manifestacoes_by_type", {
          start_date_param: start,
          end_date_param: end,
        })
        .returns<ManifestacoesByType[]>();

      if (typeError) throw typeError;

      // Manifestações por Status (usando RPC)
      const { data: byStatus, error: statusError } = await supabase
        .rpc("get_manifestacoes_by_status", {
          start_date_param: start,
          end_date_param: end,
        })
        .returns<ManifestacoesByStatus[]>();

      if (statusError) throw statusError;

      // Manifestações ao Longo do Tempo (por dia) (já usando RPC)
      const { data: overTime, error: overTimeError } = await supabase
        .rpc("get_manifestacoes_by_day", {
          start_date_param: start, // Nome do parâmetro corrigido
          end_date_param: end,   // Nome do parâmetro corrigido
        })
        .returns<ManifestacoesOverTime[]>();

      if (overTimeError) throw overTimeError;

      return {
        byType: byType || [],
        byStatus: byStatus || [],
        overTime: overTime || [],
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}