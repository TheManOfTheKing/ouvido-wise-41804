import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

// Auth service for managing user authentication

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
            perfil: perfil.toLowerCase() // Convert to lowercase for app_role enum
          }
        }
      });

      if (error) {
        return { error: error.message };
      }

      return { user: data.user, session: data.session };
    } catch (err: any) {
      return { error: err.message || "Erro ao criar conta" };
    }
  },

  // Sign in
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { error: error.message };
      }

      return { user: data.user, session: data.session };
    } catch (err: any) {
      return { error: err.message || "Erro ao fazer login" };
    }
  },

  // Sign out
  async signOut(): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (err: any) {
      return { error: err.message || "Erro ao sair" };
    }
  },

  // Get current session
  async getSession(): Promise<{ session: Session | null; error?: string }> {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        return { session: null, error: error.message };
      }

      return { session: data.session };
    } catch (err: any) {
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
        return { error: error.message };
      }

      return {};
    } catch (err: any) {
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
        return { error: error.message };
      }

      return {};
    } catch (err: any) {
      return { error: err.message || "Erro ao atualizar senha" };
    }
  }
};

// Get current user profile
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: profile } = await supabase
    .from("usuarios")
    .select("*")
    .eq("auth_id", user.id)
    .single();

  return profile;
}