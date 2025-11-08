import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/supabase"; // Import authService

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
    mutationFn: async (novoUsuarioData: Omit<Usuario, 'id' | 'auth_id' | 'created_at' | 'updated_at' | 'primeiro_acesso' | 'ultimo_acesso' | 'avatar'> & { password: string }) => {
      // 1. Create Auth user
      const { user, error: authError } = await authService.signUp(
        novoUsuarioData.email,
        novoUsuarioData.password,
        novoUsuarioData.nome,
        novoUsuarioData.perfil
      );

      if (authError) {
        throw new Error(`Erro ao criar conta de autenticação: ${authError}`);
      }
      if (!user) {
        throw new Error("Usuário de autenticação não retornado após o cadastro.");
      }

      // 2. Prepare data for public.usuarios table, excluding the password
      const { password, ...profileData } = novoUsuarioData; // Exclude password

      // 3. Insert profile into public.usuarios table, linking with auth_id
      const { data, error: dbError } = await supabase
        .from("usuarios")
        .insert({
          ...profileData, // Use profileData without password
          auth_id: user.id, // Link with the newly created auth user ID
          primeiro_acesso: true, // Mark as first access
          ativo: true, // Default to active
        })
        .select()
        .single();

      if (dbError) {
        // If DB insert fails, try to delete the auth user to prevent orphaned accounts
        await supabase.auth.admin.deleteUser(user.id); // Requires service_role key, typically in an Edge Function
        throw new Error(`Erro ao criar perfil do usuário: ${dbError.message}`);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      toast({
        title: "Usuário criado",
        description: "O usuário foi criado com sucesso e já pode fazer login.",
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