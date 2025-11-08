import { useState, useEffect, createContext, useContext, useCallback, useRef } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";

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
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // True inicialmente, torna-se false após a primeira verificação
  const navigate = useNavigate();
  const isInitialCheckDoneRef = useRef(false); // Usar ref para rastrear se a verificação inicial foi concluída

  const fetchUserProfile = useCallback(async (authUser: User) => {
    console.log("[useAuth] fetchUserProfile: Iniciando busca do perfil para auth_id:", authUser.id);
    try {
      const { data: profile, error: profileError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("auth_id", authUser.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') { // No rows found
          console.warn("[useAuth] fetchUserProfile: Perfil do usuário não encontrado. Criando novo perfil...");
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
            console.error("[useAuth] fetchUserProfile: Erro ao criar perfil do usuário:", createError);
            return null;
          }
          console.log("[useAuth] fetchUserProfile: Novo perfil criado:", newProfile);
          return newProfile;
        } else {
          console.error("[useAuth] fetchUserProfile: Erro ao buscar perfil do usuário:", profileError);
          return null;
        }
      } else {
        console.log("[useAuth] fetchUserProfile: Perfil encontrado com sucesso:", profile);
        return profile;
      }
    } catch (error) {
      console.error("[useAuth] fetchUserProfile: Erro ao carregar perfil do usuário:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const handleAuthEvent = async (event: AuthChangeEvent, currentSession: Session | null) => {
      console.log(`[useAuth] handleAuthEvent: Evento: ${event}, Sessão:`, currentSession ? 'present' : 'null');
      if (!isMounted) return;

      try {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        let fetchedUsuario: Usuario | null = null;
        if (currentSession?.user) {
          fetchedUsuario = await fetchUserProfile(currentSession.user);
        }
        if (isMounted) {
          setUsuario(fetchedUsuario);
        }
      } catch (error) {
        console.error("[useAuth] handleAuthEvent: Erro durante o processamento do evento de autenticação:", error);
        if (isMounted) {
          setUsuario(null);
          setUser(null);
          setSession(null);
        }
      } finally {
        // Define isLoadingAuth como false apenas após a primeira verificação de autenticação
        // Isso garante que o spinner de carregamento só apareça na carga inicial.
        if (isMounted && !isInitialCheckDoneRef.current) {
          setIsLoadingAuth(false);
          isInitialCheckDoneRef.current = true;
          console.log("[useAuth] Verificação inicial de autenticação concluída. Definindo isLoadingAuth como false.");
        }
        // O log abaixo pode mostrar `usuario` e `isLoadingAuth` desatualizados devido ao closure,
        // mas os estados reais serão atualizados corretamente.
        console.log(`[useAuth] Estado após handleAuthEvent (evento: ${event}): user=`, currentSession?.user ? 'present' : 'null', "session=", currentSession ? 'present' : 'null', "usuario=", usuario ? 'present' : 'null', "isLoadingAuth=", isLoadingAuth);
      }
    };

    // Configura o listener de mudança de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthEvent);

    // Dispara uma verificação de sessão inicial manualmente para garantir que o estado seja configurado
    // na primeira renderização. Isso é importante porque `onAuthStateChange` pode não disparar
    // 'INITIAL_SESSION' se uma sessão já existe ou se nenhuma sessão existe.
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (isMounted && !isInitialCheckDoneRef.current) {
        handleAuthEvent('INITIAL_SESSION', initialSession);
      }
    }).catch(err => {
      console.error("[useAuth] Erro durante o getSession inicial:", err);
      if (isMounted && !isInitialCheckDoneRef.current) {
        setIsLoadingAuth(false); // Garante que o estado de carregamento seja resolvido mesmo em caso de erro
        isInitialCheckDoneRef.current = true;
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]); // `fetchUserProfile` é uma dependência porque é um useCallback.

  useEffect(() => {
    const handleFocus = async () => {
      console.log("[useAuth] Janela focada. Verificando explicitamente a sessão.");
      // Isso irá disparar `onAuthStateChange` se a sessão mudou ou precisa ser atualizada.
      await supabase.auth.getSession();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const signOut = async () => {
    console.log("[useAuth] signOut: Saindo do sistema.");
    // Limpa o estado local imediatamente para que o ProtectedRoute redirecione
    setUsuario(null);
    setUser(null);
    setSession(null);
    isInitialCheckDoneRef.current = false; // Redefine para a próxima carga completa do app

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("[useAuth] signOut: Erro ao fazer logout no Supabase:", error);
        // Opcional: mostrar um toast de erro aqui se o logout do Supabase falhou
        // toast.error("Erro ao sair do sistema. Tente novamente.");
      } else {
        console.log("[useAuth] signOut: Logout do Supabase bem-sucedido.");
      }
    } catch (err: any) {
      console.error("[useAuth] signOut: Erro inesperado durante o logout:", err);
      // Opcional: mostrar um toast de erro para erros inesperados
      // toast.error("Erro inesperado ao sair do sistema.");
    } finally {
      console.log("[useAuth] signOut: Redirecionando para /login.");
      navigate("/login"); // Garante o redirecionamento
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, usuario, loading: isLoadingAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);