import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

type ManifestacaoUpdate = Partial<Omit<Tables<'manifestacoes'>, 'id' | 'created_at' | 'updated_at' | 'protocolo'>>;

export function useEditarManifestacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & ManifestacaoUpdate) => {
      const { error } = await supabase
        .from("manifestacoes")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["manifestacao", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["manifestacoes"] }); // Invalidate list view as well
      toast.success("Manifestação atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar manifestação:", error);
      toast.error("Erro ao atualizar manifestação", {
        description: error.message || "Ocorreu um erro inesperado.",
      });
    },
  });
}