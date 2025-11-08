import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, endOfDay } from "date-fns";

interface ReportFilters {
  startDate: Date;
  endDate: Date;
}

export function useReports(filters: ReportFilters) {
  return useQuery({
    queryKey: ["reports", filters.startDate, filters.endDate],
    queryFn: async () => {
      const start = format(startOfDay(filters.startDate), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
      const end = format(endOfDay(filters.endDate), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

      // Manifestações por Tipo
      const { data: byType, error: typeError } = await supabase
        .from("manifestacoes")
        .select("tipo, count")
        .gte("created_at", start)
        .lte("created_at", end)
        .order("count", { ascending: false })
        .returns<{ tipo: string; count: number }[]>();

      if (typeError) throw typeError;

      // Manifestações por Status
      const { data: byStatus, error: statusError } = await supabase
        .from("manifestacoes")
        .select("status, count")
        .gte("created_at", start)
        .lte("created_at", end)
        .order("count", { ascending: false })
        .returns<{ status: string; count: number }[]>();

      if (statusError) throw statusError;

      // Manifestações ao Longo do Tempo (por dia)
      const { data: overTime, error: overTimeError } = await supabase
        .rpc("get_manifestacoes_by_day", {
          start_date: start,
          end_date: end,
        });

      if (overTimeError) throw overTimeError;

      return {
        byType: byType || [],
        byStatus: byStatus || [],
        overTime: overTime || [],
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}