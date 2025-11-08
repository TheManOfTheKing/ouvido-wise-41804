import { useState, useEffect, createContext, useContext, useRef } from "react";
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
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // True enquanto a sessão inicial e o perfil estão sendo carregados
  const navigate = useNavigate();



  // Efeito para lidar com mudanças de estado de autenticação em tempo real e carregamento inicial
  useEffect(() => {
    let isMounted = true;

    // 1. Carrega a sessão inicial imediatamente
    const loadInitialSession = async () => {
      console.log("[useAuth] loadInitialSession: Tentando carregar sessão inicial.");
      setIsLoadingAuth(true);

      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          console.log("[useAuth] loadInitialSession: Sessão encontrada. Buscando perfil...");
          const currentUser = currentSession.user;
          const currentUsuario = await fetchUserProfile(currentUser);

          if (isMounted) {
            setUser(currentUser);
            setSession(currentSession);
            setUsuario(currentUsuario);
            console.log("[useAuth] loadInitialSession: Estado inicial definido (logado).");
          }
        } else {
          console.log("[useAuth] loadInitialSession: Nenhuma sessão ativa encontrada.");
        }
      } catch (error) {
        console.error("[useAuth] loadInitialSession: Erro inesperado no carregamento inicial:", error);
      } finally {
        if (isMounted) {
          setIsLoadingAuth(false); // Finaliza o estado de carregamento inicial
          console.log("[useAuth] loadInitialSession: Carregamento inicial concluído.");
        }
      }
    };

    loadInitialSession();

    // 2. Assina as mudanças de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        console.log(`[useAuth] onAuthStateChange: Evento: ${event}, Sessão:`, currentSession ? 'present' : 'null');
        if (!isMounted) {
          console.log("[useAuth] onAuthStateChange: Componente desmontado, ignorando evento.");
          return;
        }

        // Não ativamos o loading aqui para evitar flashes, já que o carregamento inicial já foi feito.
        // Apenas atualizamos o estado.

        let newUsuario: Usuario | null = null;
        let newUser: User | null = currentSession?.user ?? null;
        let newSession: Session | null = currentSession;

        try {
          if (newUser) {
            newUsuario = await fetchUserProfile(newUser);
          }
        } catch (error) {
          console.error("[useAuth] onAuthStateChange: Erro ao buscar perfil no evento:", error);
          newUser = null; // Força logout lógico se o perfil não puder ser carregado
          newSession = null;
          newUsuario = null;
        } finally {
          if (isMounted) {
            setUser(newUser);
            setSession(newSession);
            setUsuario(newUsuario);
            // Não mexemos no isLoadingAuth aqui, pois ele foi desativado no loadInitialSession
            console.log(`[useAuth] onAuthStateChange: Estado ATUALIZADO (evento: ${event}): user=`, !!newUser, "session=", !!newSession, "usuario=", !!newUsuario);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      console.log("[useAuth] onAuthStateChange: Inscrição cancelada.");
    };
  }, []); // Dependência vazia para garantir que rode apenas uma vez



  const signOut = async () => {
    console.log("[useAuth] signOut: Iniciando processo de logout.");
    setIsLoadingAuth(true); // Ativa o loading durante o logout

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("[useAuth] signOut: Erro ao fazer logout no Supabase:", error);
      } else {
        console.log("[useAuth] signOut: Logout do Supabase bem-sucedido.");
      }
    } catch (err: any) {
      console.error("[useAuth] signOut: Erro inesperado durante o logout:", err);
    } finally {
      // O onAuthStateChange deve lidar com a atualização final do estado (que é o mais correto)
      // No entanto, para garantir uma UX rápida, limpamos o estado local e redirecionamos.
      // O onAuthStateChange será disparado e confirmará o estado de logout.
      setUser(null);
      setSession(null);
      setUsuario(null);
      console.log("[useAuth] signOut: Estado local limpo e redirecionando.");
      setIsLoadingAuth(false); // Garante que o loading seja desativado
      navigate("/login"); // Redireciona para a página de login
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, usuario, loading: isLoadingAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);