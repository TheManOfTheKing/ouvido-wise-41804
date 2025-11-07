import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Setor = Tables<'setores'>;

export function useSetores() {
  const queryClient = useQueryClient();

  const query = useQuery<Setor[]>({
    queryKey: ["setores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("setores")
        .select("*")
        .order("nome");

      if (error) throw error;
      return data;
    },
    staleTime: 60000, // 1 minuto
  });

  const createMutation = useMutation({
    mutationFn: async (novoSetor: Omit<Setor, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from("setores")
        .insert([novoSetor])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["setores"] });
      toast.success("Setor criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar setor:", error);
      toast.error("Erro ao criar setor", {
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Setor> & { id: string }) => {
      const { data: updatedSetor, error } = await supabase
        .from("setores")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updatedSetor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["setores"] });
      toast.success("Setor atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar setor:", error);
      toast.error("Erro ao atualizar setor", {
        description: error.message,
      });
    },
  });

  const toggleAtivoMutation = useMutation({
    mutationFn: async ({ id, ativo }: Pick<Setor, 'id' | 'ativo'>) => {
      const { data: updatedSetor, error } = await supabase
        .from("setores")
        .update({ ativo })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updatedSetor;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["setores"] });
      toast.success(variables.ativo ? "Setor ativado" : "Setor desativado", {
        description: `O setor foi ${variables.ativo ? "ativado" : "desativado"} com sucesso.`,
      });
    },
    onError: (error) => {
      console.error("Erro ao alterar status do setor:", error);
      toast.error("Erro ao alterar status do setor", {
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (setorId: string) => {
      const { error } = await supabase
        .from("setores")
        .delete()
        .eq("id", setorId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["setores"] });
      toast.success("Setor excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir setor:", error);
      let errorMessage = "Ocorreu um erro inesperado ao excluir o setor.";
      if (error.code === '23503') { // Foreign key violation
        errorMessage = "Não foi possível excluir o setor. Existem usuários, manifestações ou planos de ação associados a ele. Por favor, remova ou reassocie-os antes de tentar novamente.";
      }
      toast.error("Erro ao excluir setor", {
        description: errorMessage,
      });
    },
  });

  return {
    ...query,
    createSetor: createMutation.mutate,
    updateSetor: updateMutation.mutate,
    toggleAtivo: toggleAtivoMutation.mutate,
    deleteSetor: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isToggling: toggleAtivoMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}