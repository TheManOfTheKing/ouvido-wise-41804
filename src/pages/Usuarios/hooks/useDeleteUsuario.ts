import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useDeleteUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("usuarios")
        .delete()
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      toast.success("Usuário excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir usuário:", error);
      toast.error("Erro ao excluir usuário", {
        description: error.message || "Ocorreu um erro inesperado.",
      });
    },
  });
}