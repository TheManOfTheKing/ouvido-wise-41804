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
      // Verificar se existem usuários cadastrados no sistema
      const { count, error } = await supabase
        .from("usuarios")
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error("Erro ao verificar primeiro usuário:", error);
        setIsFirstUser(false);
      } else {
        // Se não há usuários, então é o primeiro usuário
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