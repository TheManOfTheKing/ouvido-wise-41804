import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useManifestacao(id: string) {
  return useQuery({
    queryKey: ["manifestacao", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("manifestacoes")
        .select(
          `
          *,
          manifestante:manifestantes(*),
          setor:setores(id, nome, sigla),
          responsavel:usuarios(id, nome, email, perfil),
          encaminhamentos:encaminhamentos(
            *,
            setor_origem:setores!encaminhamentos_setor_origem_id_fkey(id, nome, sigla),
            setor_destino:setores!encaminhamentos_setor_destino_id_fkey(id, nome, sigla),
            usuario_origem:usuarios!encaminhamentos_usuario_origem_id_fkey(id, nome),
            usuario_destino:usuarios!encaminhamentos_usuario_destino_id_fkey(id, nome)
          ),
          comunicacoes:comunicacoes(
            *,
            usuario:usuarios(id, nome, avatar)
          ),
          anexos:anexos(*)
        `
        )
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Manifestação não encontrada");

      return data;
    },
    enabled: !!id,
    staleTime: 30000,
  });
}
