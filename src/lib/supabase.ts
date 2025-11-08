import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export interface AuthResult {
  user?: User | null;
  session?: Session | null;
  error?: string;
}

export const authService = {
  // Sign up
  async signUp(email: string, password: string, nome: string, perfil: string = "ANALISTA"): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            nome,
            perfil: perfil.toLowerCase()
          }
        }
      });

      if (error) {
        console.error("[authService] Erro no signUp:", error);
        return { error: error.message };
      }

      console.log("[authService] SignUp bem-sucedido");
      return { user: data.user, session: data.session };
    } catch (err: any) {
      console.error("[authService] Erro inesperado no signUp:", err);
      return { error: err.message || "Erro ao criar conta" };
    }
  },

  // Sign in
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      // CRÍTICO: Remove qualquer sessão antiga antes de fazer login
      await supabase.auth.signOut();
      
      console.log("[authService] Tentando login para:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("[authService] Erro no signIn:", error);
        return { error: error.message };
      }

      console.log("[authService] SignIn bem-sucedido");
      return { user: data.user, session: data.session };
    } catch (err: any) {
      console.error("[authService] Erro inesperado no signIn:", err);
      return { error: err.message || "Erro ao fazer login" };
    }
  },

  // Sign out
  async signOut(): Promise<{ error?: string }> {
    try {
      console.log("[authService] Executando signOut");
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("[authService] Erro no signOut:", error);
        return { error: error.message };
      }

      console.log("[authService] SignOut bem-sucedido");
      return {};
    } catch (err: any) {
      console.error("[authService] Erro inesperado no signOut:", err);
      return { error: err.message || "Erro ao sair" };
    }
  },

  // Get current session
  async getSession(): Promise<{ session: Session | null; error?: string }> {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("[authService] Erro ao obter sessão:", error);
        return { session: null, error: error.message };
      }

      return { session: data.session };
    } catch (err: any) {
      console.error("[authService] Erro inesperado ao obter sessão:", err);
      return { session: null, error: err.message };
    }
  },

  // Reset password
  async resetPassword(email: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        console.error("[authService] Erro no resetPassword:", error);
        return { error: error.message };
      }

      console.log("[authService] Email de recuperação enviado");
      return {};
    } catch (err: any) {
      console.error("[authService] Erro inesperado no resetPassword:", err);
      return { error: err.message || "Erro ao enviar email de recuperação" };
    }
  },

  // Update password
  async updatePassword(newPassword: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error("[authService] Erro no updatePassword:", error);
        return { error: error.message };
      }

      console.log("[authService] Senha atualizada com sucesso");
      return {};
    } catch (err: any) {
      console.error("[authService] Erro inesperado no updatePassword:", err);
      return { error: err.message || "Erro ao atualizar senha" };
    }
  }
};

// Get current user profile
export async function getCurrentUser() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log("[getCurrentUser] Nenhum usuário autenticado");
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("auth_id", user.id)
      .single();

    if (profileError) {
      console.error("[getCurrentUser] Erro ao buscar perfil:", profileError);
      return null;
    }

    return profile;
  } catch (error) {
    console.error("[getCurrentUser] Erro inesperado:", error);
    return null;
  }
}