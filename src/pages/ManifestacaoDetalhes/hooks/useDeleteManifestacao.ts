import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function useDeleteManifestacao() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (manifestacaoId: string) => {
      console.log("Attempting to delete manifestacao with ID:", manifestacaoId);
      const { error } = await supabase
        .from("manifestacoes")
        .delete()
        .eq("id", manifestacaoId);

      if (error) {
        console.error("Supabase delete error:", error);
        throw error;
      }
      console.log("Manifestacao deleted successfully:", manifestacaoId);
    },
    onSuccess: (_, manifestacaoId) => {
      queryClient.invalidateQueries({ queryKey: ["manifestacao", manifestacaoId] });
      queryClient.invalidateQueries({ queryKey: ["manifestacoes"] });
      toast.success("Manifestação excluída com sucesso!");
      navigate("/manifestacoes"); // Redireciona para a lista após a exclusão
    },
    onError: (error) => {
      console.error("Erro ao excluir manifestação (onError callback):", error);
      toast.error("Erro ao excluir manifestação", {
        description: error.message || "Ocorreu um erro inesperado.",
      });
    },
  });
}