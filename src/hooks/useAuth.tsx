import { useState, useEffect, createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Usuario {
  id: string;
  auth_id: string;
  nome: string;
  email: string;
  perfil: string;
  setor_id?: string;
  ativo: boolean;
  primeiro_acesso: boolean;
  roles?: string[];
}

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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Fetch user profile if logged in
        if (session?.user) {
          setTimeout(async () => {
            const { data: profile } = await supabase
              .from("usuarios")
              .select("*")
              .eq("auth_id", session.user.id)
              .single();
            
            // Fetch user roles from user_roles table
            const { data: userRoles } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id);
            
            setUsuario({
              ...profile,
              roles: userRoles?.map(r => r.role) || []
            });
          }, 0);
        } else {
          setUsuario(null);
        }

        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        Promise.all([
          supabase
            .from("usuarios")
            .select("*")
            .eq("auth_id", session.user.id)
            .single(),
          supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
        ]).then(([{ data: profile }, { data: userRoles }]) => {
          setUsuario({
            ...profile,
            roles: userRoles?.map(r => r.role) || []
          });
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, session, usuario, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);