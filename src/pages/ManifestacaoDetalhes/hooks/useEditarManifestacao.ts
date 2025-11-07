import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner"; // Usando sonner para consistência
import { Tables } from "@/integrations/supabase/types";

type ManifestacaoUpdate = Partial<Omit<Tables<'manifestacoes'>, 'id' | 'created_at' | 'updated_at' | 'protocolo'>>;

export function useEditarManifestacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & ManifestacaoUpdate) => {
      console.log("Attempting to update manifestacao:", id, "with data:", data);
      const { data: updatedRows, error } = await supabase
        .from("manifestacoes")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select(); // Adiciona .select() para obter as linhas atualizadas

      if (error) {
        console.error("Supabase update error:", error);
        throw error; // Re-throw to be caught by onError
      }

      // Verifica se alguma linha foi realmente atualizada
      if (!updatedRows || updatedRows.length === 0) {
        console.warn("Supabase update: No rows were updated. This might indicate an RLS policy issue or that the record does not exist/is not accessible.");
        throw new Error("Nenhuma manifestação foi atualizada. Verifique suas permissões.");
      }

      console.log("Manifestacao updated successfully in Supabase:", id, "Updated rows:", updatedRows);
      return updatedRows[0]; // Retorna a primeira linha atualizada
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["manifestacao", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["manifestacoes"] }); // Invalidate list view as well
      toast.success("Manifestação atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar manifestação (onError callback):", error);
      toast.error("Erro ao atualizar manifestação", {
        description: error.message || "Ocorreu um erro inesperado.",
      });
    },
  });
}