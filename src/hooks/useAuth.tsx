import { useState, useEffect, createContext, useContext } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { fetchUserProfile } from "@/lib/authUtils";
import { useMounted } from "./use-mounted"; // Importar o hook useMounted

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
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const navigate = useNavigate();
  const isMountedRef = useMounted(); // Usar o hook useMounted

  // Efeito para carregar a sessão inicial e o perfil na montagem do componente
  useEffect(() => {
    const loadInitialSession = async () => {
      console.log("[useAuth] loadInitialSession: Iniciando carregamento da sessão inicial.");
      setIsLoadingAuth(true);

      try {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

        if (!isMountedRef.current) return; // Verificar se o componente ainda está montado

        if (sessionError) {
          console.error("[useAuth] loadInitialSession: Erro ao obter sessão:", sessionError);
          setUser(null);
          setSession(null);
          setUsuario(null);
        } else if (currentSession) {
          console.log("[useAuth] loadInitialSession: Sessão encontrada. User ID:", currentSession.user.id);
          const currentUser = currentSession.user;
          const currentUsuario = await fetchUserProfile(currentUser);

          if (!isMountedRef.current) return; // Verificar novamente após a operação assíncrona
          
          setUser(currentUser);
          setSession(currentSession);
          setUsuario(currentUsuario);
          console.log("[useAuth] loadInitialSession: Estado inicial definido (logado). Perfil carregado:", !!currentUsuario);
        } else {
          console.log("[useAuth] loadInitialSession: Nenhuma sessão ativa encontrada.");
          setUser(null);
          setSession(null);
          setUsuario(null);
        }
      } catch (error) {
        console.error("[useAuth] loadInitialSession: Erro inesperado:", error);
        if (!isMountedRef.current) return;
        setUser(null);
        setSession(null);
        setUsuario(null);
      } finally {
        if (isMountedRef.current) {
          setIsLoadingAuth(false);
          console.log("[useAuth] loadInitialSession: Carregamento inicial concluído. isLoadingAuth:", false);
        }
      }
    };

    loadInitialSession();

    // Assina as mudanças de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        console.log(`[useAuth] onAuthStateChange: Evento: ${event}, Sessão:`, currentSession ? 'present' : 'null', "User ID:", currentSession?.user?.id);
        if (!isMountedRef.current) {
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
            console.log("[useAuth] onAuthStateChange: User presente. Tentando buscar perfil...");
            newUsuario = await fetchUserProfile(newUser);
            console.log("[useAuth] onAuthStateChange: Perfil carregado:", !!newUsuario);
          } else {
            console.log("[useAuth] onAuthStateChange: User ausente. Limpando perfil.");
          }
        } catch (error) {
          console.error("[useAuth] onAuthStateChange: Erro ao buscar perfil no evento:", error);
          newUser = null;
          newSession = null;
          newUsuario = null;
        } finally {
          if (isMountedRef.current) {
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
      subscription.unsubscribe();
      console.log("[useAuth] onAuthStateChange: Inscrição cancelada.");
    };
  }, [isMountedRef]); // Adicionar isMountedRef como dependência

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
      if (isMountedRef.current) { // Verificar se o componente ainda está montado antes de atualizar o estado
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
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, usuario, loading: isLoadingAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);