import { useState, useEffect, createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
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

  useEffect(() => {
    const fetchUserProfile = async (authUser: User) => {
      try {
        // Buscar perfil do usuário na tabela 'usuarios'
        const { data: profile, error: profileError } = await supabase
          .from("usuarios")
          .select("*")
          .eq("auth_id", authUser.id)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            // Usuário não encontrado - criar perfil básico
            console.warn("Perfil do usuário não encontrado. Criando novo perfil...");
            
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
              console.error("Erro ao criar perfil do usuário:", createError);
              setUsuario(null);
              return;
            }
            
            setUsuario(newProfile);
          } else {
            console.error("Erro ao buscar perfil do usuário:", profileError);
            setUsuario(null);
          }
        } else {
          // Perfil encontrado com sucesso
          setUsuario(profile);
        }
      } catch (error) {
        console.error("Erro ao carregar perfil do usuário:", error);
        setUsuario(null);
      }
    };

    // Listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(true);

        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUsuario(null);
        }
        
        setLoading(false);
      }
    );

    // Verificação inicial da sessão
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchUserProfile(session.user);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUsuario(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, session, usuario, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);