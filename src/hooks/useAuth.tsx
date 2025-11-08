import { useState, useEffect, createContext, useContext, useCallback } from "react";
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
  console.log("[useAuth] AuthProvider renderizado."); // Log na renderização do componente
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // True inicialmente
  const navigate = useNavigate();

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
          console.warn("[useAuth] fetchUserProfile: Perfil do usuário não encontrado. Tentando criar novo perfil...");
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
      console.error("[useAuth] fetchUserProfile: Erro inesperado ao carregar perfil do usuário:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    console.log("[useAuth] useEffect principal executado."); // Log no início do useEffect
    let isMounted = true;

    const handleAuthEvent = async (event: AuthChangeEvent, currentSession: Session | null) => {
      console.log(`[useAuth] handleAuthEvent: Evento: ${event}, Sessão:`, currentSession ? 'present' : 'null');
      if (!isMounted) {
        console.log("[useAuth] handleAuthEvent: Componente desmontado, ignorando evento.");
        return;
      }

      let newUsuario: Usuario | null = null;
      let newUser: User | null = currentSession?.user ?? null;
      let newSession: Session | null = currentSession;

      try {
        if (newUser) {
          newUsuario = await fetchUserProfile(newUser);
        }
      } catch (error) {
        console.error("[useAuth] handleAuthEvent: Erro durante o processamento do evento de autenticação:", error);
        newUser = null;
        newSession = null;
        newUsuario = null;
      } finally {
        if (isMounted) {
          setUser(newUser);
          console.log("[useAuth] setUser chamado:", !!newUser);
          setSession(newSession);
          console.log("[useAuth] setSession chamado:", !!newSession);
          setUsuario(newUsuario);
          console.log("[useAuth] setUsuario chamado:", !!newUsuario);
          setIsLoadingAuth(false); // Garante que o loading seja definido como false
          console.log(`[useAuth] Estado FINAL após handleAuthEvent (evento: ${event}): user=`, !!newUser, "session=", !!newSession, "usuario=", !!newUsuario, "isLoadingAuth=false");
        }
      }
    };

    // Dispara uma verificação de sessão inicial e configura o listener
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (isMounted) {
        console.log("[useAuth] getSession inicial concluído. Disparando handleAuthEvent para INITIAL_SESSION.");
        handleAuthEvent('INITIAL_SESSION', initialSession);
      }
    }).catch(err => {
      console.error("[useAuth] Erro durante o getSession inicial:", err);
      if (isMounted) {
        setIsLoadingAuth(false); // Garante que o estado de carregamento seja resolvido mesmo em caso de erro
        console.log("[useAuth] Erro no getSession inicial. Definindo isLoadingAuth como false.");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthEvent);

    // DEBUG: Força isLoadingAuth a false após um tempo, caso a lógica acima falhe
    const debugTimeout = setTimeout(() => {
      if (isMounted && isLoadingAuth) {
        console.warn("[useAuth] DEBUG: Forçando isLoadingAuth para false após timeout. Isso indica um problema na resolução da autenticação.");
        setIsLoadingAuth(false);
      }
    }, 3000); // 3 segundos

    return () => {
      console.log("[useAuth] useEffect de limpeza executado.");
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(debugTimeout); // Limpa o timeout de debug
    };
  }, [fetchUserProfile, isLoadingAuth]); // Adicionado isLoadingAuth como dependência para o debugTimeout

  useEffect(() => {
    const handleFocus = async () => {
      console.log("[useAuth] Janela focada. Verificando explicitamente a sessão.");
      await supabase.auth.getSession();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const signOut = async () => {
    console.log("[useAuth] signOut: Saindo do sistema.");
    setUsuario(null);
    setUser(null);
    setSession(null);

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
      console.log("[useAuth] signOut: Redirecionando para /login.");
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, usuario, loading: isLoadingAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);