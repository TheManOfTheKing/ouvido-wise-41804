import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { fetchUserProfile } from "@/lib/authUtils";

type Usuario = Tables<'usuarios'>;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  usuario: Usuario | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  usuario: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Função para carregar perfil do usuário
  const loadUserProfile = useCallback(async (currentUser: User | null): Promise<Usuario | null> => {
    if (!currentUser) return null;
    
    try {
      console.log("[useAuth] Carregando perfil para user:", currentUser.id);
      const profile = await fetchUserProfile(currentUser);
      console.log("[useAuth] Perfil carregado:", !!profile);
      return profile;
    } catch (error) {
      console.error("[useAuth] Erro ao carregar perfil:", error);
      return null;
    }
  }, []);

  // Handler para mudanças de autenticação
  const handleAuthChange = useCallback(async (event: AuthChangeEvent, currentSession: Session | null) => {
    console.log(`[useAuth] Evento: ${event}, Sessão:`, currentSession ? 'presente' : 'null');

    try {
      const currentUser = currentSession?.user ?? null;
      const profile = await loadUserProfile(currentUser);

      setUser(currentUser);
      setSession(currentSession);
      setUsuario(profile);

      // Navega apenas em eventos relevantes
      if (event === 'SIGNED_OUT') {
        navigate("/login", { replace: true });
      } else if (event === 'SIGNED_IN' && profile) {
        // Verifica se já não está no dashboard
        if (!window.location.pathname.startsWith('/dashboard')) {
          navigate("/dashboard", { replace: true });
        }
      }
    } catch (error) {
      console.error("[useAuth] Erro no handleAuthChange:", error);
      setUser(null);
      setSession(null);
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  }, [loadUserProfile, navigate]);

  // Inicialização e listener
  useEffect(() => {
    let mounted = true;

    // Carrega sessão inicial
    const initAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("[useAuth] Erro ao obter sessão inicial:", error);
          throw error;
        }

        if (!mounted) return;

        const currentUser = initialSession?.user ?? null;
        const profile = await loadUserProfile(currentUser);

        setUser(currentUser);
        setSession(initialSession);
        setUsuario(profile);
      } catch (error) {
        console.error("[useAuth] Erro na inicialização:", error);
        setUser(null);
        setSession(null);
        setUsuario(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        handleAuthChange(event, session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      console.log("[useAuth] Limpeza concluída");
    };
  }, [handleAuthChange, loadUserProfile]);

  // Função de logout
  const signOut = useCallback(async () => {
    console.log("[useAuth] Iniciando logout");
    
    // Não ativa loading aqui - deixa o listener gerenciar
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("[useAuth] Erro no logout:", error);
        // Mesmo com erro, limpa estado local por segurança
        setUser(null);
        setSession(null);
        setUsuario(null);
        navigate("/login", { replace: true });
        return;
      }

      console.log("[useAuth] Logout bem-sucedido");
      // O listener SIGNED_OUT cuidará da navegação
    } catch (error) {
      console.error("[useAuth] Erro inesperado no logout:", error);
      // Força limpeza em caso de erro
      setUser(null);
      setSession(null);
      setUsuario(null);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, session, usuario, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);