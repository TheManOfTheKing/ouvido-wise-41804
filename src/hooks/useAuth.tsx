import { useState, useEffect, createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Enums, Tables } from "@/integrations/supabase/types";

interface Usuario extends Tables<'usuarios'> {
  roles?: Enums<'app_role'>[];
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
    const fetchUserProfile = async (authUser: User) => {
      let currentProfile: Tables<'usuarios'> | null = null;

      // 1. Fetch user profile from 'usuarios' table
      const { data: profile, error: profileError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("auth_id", authUser.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') { // No rows found
        console.warn("User profile not found in 'usuarios' table. Creating a basic one.");
        
        // Use user_metadata for default values if available
        const defaultPerfil: Enums<'perfil_usuario'> = (authUser.user_metadata?.perfil?.toUpperCase() as Enums<'perfil_usuario'>) || "ANALISTA";
        const defaultName = authUser.user_metadata?.nome || authUser.email!.split('@')[0];

        // If profile doesn't exist, create a basic one
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
          console.error("Error creating basic user profile:", createError);
          throw createError;
        }
        currentProfile = newProfile;
      } else if (profileError) {
        console.error("Error fetching user profile:", profileError);
        throw profileError;
      } else {
        currentProfile = profile;
      }

      // 2. Fetch user roles from 'user_roles' table
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authUser.id);

      if (rolesError) {
        console.error("Error fetching user roles:", rolesError);
        throw rolesError;
      }

      // 3. Set the combined user object
      if (currentProfile) {
        setUsuario({
          ...currentProfile,
          roles: userRoles?.map(r => r.role) || []
        });
      } else {
        setUsuario(null);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(true); // Set loading true while fetching profile

        if (session?.user) {
          try {
            await fetchUserProfile(session.user);
          } catch (error) {
            console.error("Failed to load user profile or roles:", error);
            setUsuario(null);
          }
        } else {
          setUsuario(null);
        }
        setLoading(false);
      }
    );

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        try {
          await fetchUserProfile(session.user);
        } catch (error) {
          console.error("Failed initial load of user profile or roles:", error);
          setUsuario(null);
        }
      }
      setLoading(false);
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