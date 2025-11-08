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

  // 1. Efeito para carregar a sessão inicial e o perfil na montagem do componente
  useEffect(() => {
    let isMounted = true;

    const loadInitialSession = async () => {
      console.log("[useAuth] loadInitialSession: Tentando carregar sessão inicial.");
      setIsLoadingAuth(true); // Garante que o loading esteja ativo no início

      try {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("[useAuth] loadInitialSession: Erro ao obter sessão:", sessionError);
          if (isMounted) {
            setUser(null);
            setSession(null);
            setUsuario(null);
          }
        } else if (currentSession) {
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
          if (isMounted) {
            setUser(null);
            setSession(null);
            setUsuario(null);
          }
        }
      } catch (error) {
        console.error("[useAuth] loadInitialSession: Erro inesperado:", error);
        if (isMounted) {
          setUser(null);
          setSession(null);
          setUsuario(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingAuth(false); // Finaliza o estado de carregamento inicial
          console.log("[useAuth] loadInitialSession: Carregamento inicial concluído.");
        }
      }
    };

    loadInitialSession();

    return () => {
      isMounted = false;
    };
  }, []); // Executa apenas uma vez na montagem

  // 2. Efeito para lidar com mudanças de estado de autenticação em tempo real
  useEffect(() => {
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        console.log(`[useAuth] onAuthStateChange: Evento: ${event}, Sessão:`, currentSession ? 'present' : 'null');
        if (!isMounted) {
          console.log("[useAuth] onAuthStateChange: Componente desmontado, ignorando evento.");
          return;
        }

        setIsLoadingAuth(true); // Ativa o loading durante o processamento do evento

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
            setIsLoadingAuth(false); // Finaliza o loading após o processamento do evento
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

  // 3. Efeito para re-verificar a sessão quando a janela é focada (para lidar com abas/minimizar)
  useEffect(() => {
    const handleFocus = async () => {
      console.log("[useAuth] Janela focada. Re-verificando sessão.");
      // Isso irá disparar onAuthStateChange se o estado da sessão tiver mudado
      await supabase.auth.getSession();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

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
      // O onAuthStateChange deve lidar com a atualização final do estado e desativar o loading
      // Mas para garantir uma UX rápida, podemos limpar o estado imediatamente
      if (user || session || usuario) { // Só limpa se houver algo para limpar
        setUser(null);
        setSession(null);
        setUsuario(null);
        console.log("[useAuth] signOut: Estado local limpo.");
      }
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