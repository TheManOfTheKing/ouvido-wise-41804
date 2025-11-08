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
  console.log("[useAuth] AuthProvider renderizado.");
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

  // Effect para carregamento inicial da sessão
  useEffect(() => {
    console.log("[useAuth] useEffect (initial load) executado.");
    let isMounted = true;

    const loadInitialSession = async () => {
      console.log("[useAuth] loadInitialSession: Iniciando verificação de sessão inicial.");
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (!isMounted) return; // Previne atualizações de estado se o componente foi desmontado

        if (sessionError) {
          console.error("[useAuth] loadInitialSession: Erro ao obter sessão inicial:", sessionError);
          setUser(null);
          setSession(null);
          setUsuario(null);
        } else if (initialSession) {
          setUser(initialSession.user);
          setSession(initialSession);
          const profile = await fetchUserProfile(initialSession.user);
          if (!isMounted) return;
          setUsuario(profile);
        } else {
          console.log("[useAuth] loadInitialSession: Nenhuma sessão inicial encontrada.");
          setUser(null);
          setSession(null);
          setUsuario(null);
        }
      } catch (error) {
        console.error("[useAuth] loadInitialSession: Erro inesperado durante a verificação inicial:", error);
        setUser(null);
        setSession(null);
        setUsuario(null);
      } finally {
        if (isMounted) {
          setIsLoadingAuth(false);
          console.log("[useAuth] loadInitialSession: isLoadingAuth definido como false.");
        }
      }
    };

    loadInitialSession();

    return () => {
      console.log("[useAuth] useEffect (initial load) de limpeza executado.");
      isMounted = false;
    };
  }, [fetchUserProfile]); // Depende apenas de fetchUserProfile

  // Effect para mudanças de estado de autenticação em tempo real
  useEffect(() => {
    console.log("[useAuth] useEffect (onAuthStateChange) executado.");
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log(`[useAuth] onAuthStateChange: Evento: ${event}, Sessão:`, currentSession ? 'present' : 'null');
      if (!isMounted) {
        console.log("[useAuth] onAuthStateChange: Componente desmontado, ignorando evento.");
        return;
      }

      let newUsuario: Usuario | null = null;
      let newUser: User | null = currentSession?.user ?? null;
      let newSession: Session | null = currentSession;

      if (newUser) {
        newUsuario = await fetchUserProfile(newUser);
      }

      if (isMounted) {
        setUser(newUser);
        setSession(newSession);
        setUsuario(newUsuario);
        console.log(`[useAuth] Estado ATUALIZADO por onAuthStateChange (evento: ${event}): user=`, !!newUser, "session=", !!newSession, "usuario=", !!newUsuario);
      }
    });

    return () => {
      console.log("[useAuth] useEffect (onAuthStateChange) de limpeza executado.");
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]); // Depende de fetchUserProfile

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