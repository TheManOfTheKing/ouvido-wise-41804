import { useState, useEffect, createContext, useContext } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { fetchUserProfile } from "@/lib/authUtils";
import { useMounted } from "./use-mounted";

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
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // True inicialmente
  const navigate = useNavigate();
  const isMountedRef = useMounted();

  useEffect(() => {
    let isInitialLoad = true; // Flag para controlar o carregamento inicial

    const handleAuthStateChange = async (event: AuthChangeEvent, currentSession: Session | null) => {
      console.log(`[useAuth] handleAuthStateChange: Evento: ${event}, Sessão:`, currentSession ? 'present' : 'null', "User ID:", currentSession?.user?.id);
      if (!isMountedRef.current) {
        console.log("[useAuth] handleAuthStateChange: Componente desmontado, ignorando evento.");
        return;
      }

      let newUsuario: Usuario | null = null;
      let newUser: User | null = currentSession?.user ?? null;
      let newSession: Session | null = currentSession;

      try {
        if (newUser) {
          console.log("[useAuth] handleAuthStateChange: User presente. Tentando buscar perfil...");
          newUsuario = await fetchUserProfile(newUser);
          console.log("[useAuth] handleAuthStateChange: Perfil carregado:", !!newUsuario);
        } else {
          console.log("[useAuth] handleAuthStateChange: User ausente. Limpando perfil.");
        }
      } catch (error) {
        console.error("[useAuth] handleAuthStateChange: Erro ao buscar perfil no evento:", error);
        newUser = null;
        newSession = null;
        newUsuario = null;
      } finally {
        if (isMountedRef.current) {
          setUser(newUser);
          setSession(newSession);
          setUsuario(newUsuario);
          
          // Define isLoadingAuth como false APENAS após a primeira determinação do estado
          if (isInitialLoad) {
            setIsLoadingAuth(false);
            isInitialLoad = false; // Garante que isso só aconteça uma vez
          }
          console.log(`[useAuth] handleAuthStateChange: Estado ATUALIZADO (evento: ${event}): user=`, !!newUser, "session=", !!newSession, "usuario=", !!newUsuario, "isLoadingAuth:", isLoadingAuth);
        }
      }
    };

    // 1. Realiza a verificação inicial da sessão
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      handleAuthStateChange('INITIAL_LOAD', initialSession); // Trata o carregamento inicial como um evento
    });

    // 2. Configura o listener para mudanças de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Cleanup: desinscreve o listener quando o componente é desmontado
    return () => {
      subscription.unsubscribe();
      console.log("[useAuth] onAuthStateChange: Inscrição cancelada.");
    };
  }, [isMountedRef]); // isInitialLoad é uma variável local, não uma dependência

  const signOut = async () => {
    console.log("[useAuth] signOut: Iniciando processo de logout.");
    setIsLoadingAuth(true); // Ativa o loading durante o processo de logout

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("[useAuth] signOut: Erro ao fazer logout no Supabase:", error);
      }
    } catch (err: any) {
      console.error("[useAuth] signOut: Erro inesperado durante o logout:", err);
    } finally {
      if (isMountedRef.current) {
        // Limpa proativamente o estado e navega para uma UX mais rápida.
        // O listener onAuthStateChange confirmará o estado SIGNED_OUT.
        setUser(null);
        setSession(null);
        setUsuario(null);
        setIsLoadingAuth(false); // Desativa o loading após a tentativa de logout
        navigate("/login"); // Redireciona imediatamente
        console.log("[useAuth] signOut: Estado local limpo e redirecionando.");
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, usuario, loading: isLoadingAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);