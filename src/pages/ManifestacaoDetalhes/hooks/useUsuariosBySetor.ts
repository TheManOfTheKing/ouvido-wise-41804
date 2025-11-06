import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUsuariosBySetor(setorId?: string | null) {
  return useQuery({
    queryKey: ["usuarios", "setor", setorId],
    queryFn: async () => {
      if (!setorId) return [];

      const { data, error } = await supabase
        .from("usuarios")
        .select("id, nome, email, perfil")
        .eq("setor_id", setorId)
        .eq("ativo", true)
        .order("nome");

      if (error) throw error;
      return data || [];
    },
    enabled: !!setorId,
    staleTime: 60000,
  });
}
