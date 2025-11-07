import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useCheckFirstUser() {
  const [isFirstUser, setIsFirstUser] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkFirstUser();
  }, []);

  const checkFirstUser = async () => {
    try {
      const { count, error } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");

      if (error) {
        console.error("Erro ao verificar primeiro usuário:", error);
        setIsFirstUser(false);
      } else {
        setIsFirstUser(count === 0);
      }
    } catch (err) {
      console.error("Erro ao verificar primeiro usuário:", err);
      setIsFirstUser(false);
    } finally {
      setLoading(false);
    }
  };

  return { isFirstUser, loading };
}
