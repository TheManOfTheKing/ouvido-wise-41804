import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSetores() {
  return useQuery({
    queryKey: ["setores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("setores")
        .select("id, nome, sigla")
        .eq("ativo", true)
        .order("nome");

      if (error) throw error;
      return data || [];
    },
    staleTime: 60000, // 1 minuto
  });
}
