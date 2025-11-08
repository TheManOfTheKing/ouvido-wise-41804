import { useState, useEffect, createContext, useContext, useCallback } from "react"; // Import useCallback
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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to fetch user profile, memoized with useCallback
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
  }, []); // No dependencies needed for useCallback as it only uses authUser and supabase client

  useEffect(() => {
    let isMounted = true; // Flag para evitar atualizações de estado em componentes desmontados

    const getInitialSession = async () => {
      console.log("[useAuth] getInitialSession: Tentando obter sessão inicial.");
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (isMounted) {
          if (error) {
            console.error("[useAuth] getInitialSession: Erro ao obter sessão inicial:", error);
            setSession(null);
            setUser(null);
            setUsuario(null);
          } else if (initialSession) {
            console.log("[useAuth] getInitialSession: Sessão inicial encontrada:", initialSession);
            setSession(initialSession);
            setUser(initialSession.user);
            const fetchedUsuario = await fetchUserProfile(initialSession.user);
            if (isMounted) {
              setUsuario(fetchedUsuario);
            }
          } else {
            console.log("[useAuth] getInitialSession: Nenhuma sessão inicial encontrada.");
            setSession(null);
            setUser(null);
            setUsuario(null);
          }
        }
      } catch (err) {
        console.error("[useAuth] getInitialSession: Erro inesperado ao obter sessão inicial:", err);
        if (isMounted) {
          setSession(null);
          setUser(null);
          setUsuario(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession(); // Chamar no mount para obter a sessão inicial

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("[useAuth] onAuthStateChange: Evento:", event, "Sessão:", currentSession);
        if (!isMounted) return; // Prevenir atualizações de estado se o componente foi desmontado

        setLoading(true); // Definir loading como true para qualquer evento de mudança de estado de autenticação

        try {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);

          if (currentSession?.user) {
            const fetchedUsuario = await fetchUserProfile(currentSession.user);
            if (isMounted) {
              setUsuario(fetchedUsuario);
            }
          } else {
            setUsuario(null);
          }
        } catch (error) {
          console.error("[useAuth] onAuthStateChange: Erro durante a mudança de estado de autenticação:", error);
          if (isMounted) {
            setUsuario(null);
            setUser(null);
            setSession(null);
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      isMounted = false; // Limpar flag
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]); // Add fetchUserProfile to dependencies

  // Add a new useEffect to handle window focus events
  useEffect(() => {
    const handleFocus = async () => {
      console.log("[useAuth] Window focused. Explicitly checking session.");
      // Calling getSession() will force Supabase to check its storage and potentially refresh the token.
      // This action will trigger the onAuthStateChange listener if the session state changes.
      await supabase.auth.getSession();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  const signOut = async () => {
    console.log("[useAuth] signOut: Saindo do sistema.");
    await supabase.auth.signOut();
    // Limpar estados imediatamente após signOut para refletir as mudanças na UI
    setUsuario(null);
    setUser(null);
    setSession(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, session, usuario, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);