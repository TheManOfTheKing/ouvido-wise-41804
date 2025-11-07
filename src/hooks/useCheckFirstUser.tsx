import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useCheckFirstUser() {
  const [isFirstUser, setIsFirstUser] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFirstUser = async () => {
      try {
        // Chamar a função RPC para verificar a existência de usuários ADMIN
        const { data, error } = await supabase.rpc("check_admin_users_exist");

        if (error) {
          console.error("Erro ao chamar RPC check_admin_users_exist:", error);
          // Em caso de erro, assumir que não é o primeiro usuário por segurança
          setIsFirstUser(false); 
        } else {
          // A função RPC retorna TRUE se ADMINs existirem, FALSE caso contrário.
          // Queremos que isFirstUser seja TRUE se NÃO existirem ADMINs.
          setIsFirstUser(!data); 
        }
      } catch (err) {
        console.error("Erro inesperado ao verificar primeiro usuário:", err);
        setIsFirstUser(false);
      } finally {
        setLoading(false);
      }
    };

    checkFirstUser();
  }, []);

  return { isFirstUser, loading };
}