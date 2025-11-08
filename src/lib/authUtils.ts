import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Tables } from "@/integrations/supabase/types";

type Usuario = Tables<'usuarios'>;

export async function fetchUserProfile(authUser: User): Promise<Usuario | null> {
  console.log("[authUtils] fetchUserProfile: Iniciando busca do perfil para auth_id:", authUser.id);
  try {
    const { data: profile, error: profileError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("auth_id", authUser.id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') { // No rows found
        console.warn("[authUtils] fetchUserProfile: Perfil do usuário não encontrado. Tentando criar novo perfil...");
        const defaultPerfil = (authUser.user_metadata?.perfil?.toUpperCase()) || "ANALISTA";
        const defaultName = authUser.user_metadata?.nome || authUser.email!.split('@')[0];

        const { data: newProfile, error: createError } = await supabase
          .from("usuarios")
          .insert({
            auth_id: authUser.id,
            email: authUser.email!,
            nome: defaultName,
            perfil: defaultPerfil,
            ativo: true,
            primeiro_acesso: true,
          })
          .select("*")
          .single();

        if (createError) {
          console.error("[authUtils] fetchUserProfile: Erro ao criar perfil do usuário:", createError);
          return null;
        }
        console.log("[authUtils] fetchUserProfile: Novo perfil criado:", newProfile);
        return newProfile;
      } else {
        console.error("[authUtils] fetchUserProfile: Erro ao buscar perfil do usuário:", profileError);
        return null;
      }
    } else {
      console.log("[authUtils] fetchUserProfile: Perfil encontrado com sucesso:", profile);
      return profile;
    }
  } catch (error) {
    console.error("[authUtils] fetchUserProfile: Erro inesperado ao carregar perfil do usuário:", error);
    return null;
  }
}