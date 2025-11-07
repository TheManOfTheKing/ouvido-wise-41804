import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type Usuario = Tables<'usuarios'>;

export function useUsuarios() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery<Usuario[]>({
    queryKey: ["usuarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .order("nome");

      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (novoUsuario: Omit<Usuario, 'id'>) => {
      const { data, error } = await supabase
        .from("usuarios")
        .insert([novoUsuario])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      toast({
        title: "Usuário criado",
        description: "O usuário foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Usuario> & { id: string }) => {
      const { data: updatedUser, error } = await supabase
        .from("usuarios")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updatedUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      toast({
        title: "Usuário atualizado",
        description: "As informações foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleAtivoMutation = useMutation({
    mutationFn: async ({ id, ativo }: Pick<Usuario, 'id' | 'ativo'>) => {
      const { data: updatedUser, error } = await supabase
        .from("usuarios")
        .update({ ativo })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updatedUser;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      toast({
        title: variables.ativo ? "Usuário ativado" : "Usuário desativado",
        description: `O usuário foi ${variables.ativo ? "ativado" : "desativado"} com sucesso.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao alterar status do usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    ...query,
    createUsuario: createMutation.mutate,
    updateUsuario: updateMutation.mutate,
    toggleAtivo: toggleAtivoMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isToggling: toggleAtivoMutation.isPending,
  };
}