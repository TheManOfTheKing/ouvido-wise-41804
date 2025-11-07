import { useState, useEffect, createContext, useContext } from "react";
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
  const [loading, setLoading] = useState(true); // Default to true
  const navigate = useNavigate();

  // Function to fetch user profile
  const fetchUserProfile = async (authUser: User) => {
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
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("[useAuth] onAuthStateChange: Evento:", event, "Sessão:", currentSession);
        setLoading(true); // Always set loading to true at the start of an auth state change

        try {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);

          if (currentSession?.user) {
            const fetchedUsuario = await fetchUserProfile(currentSession.user);
            setUsuario(fetchedUsuario);
          } else {
            setUsuario(null);
          }
        } catch (error) {
          console.error("[useAuth] onAuthStateChange: Erro durante a mudança de estado de autenticação:", error);
          setUsuario(null);
          setUser(null);
          setSession(null);
        } finally {
          setLoading(false); // Always stop loading after an auth state change event
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []); // Empty dependency array means this runs once on mount

  // This useEffect will be executed whenever the 'usuario' state is updated
  useEffect(() => {
    console.log("[useAuth] Estado 'usuario' atualizado:", usuario);
  }, [usuario]);

  const signOut = async () => {
    console.log("[useAuth] signOut: Saindo do sistema.");
    await supabase.auth.signOut();
    // Clear states immediately after signOut to reflect changes in UI
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