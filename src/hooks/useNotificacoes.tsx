import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export interface Notificacao {
  id: string;
  usuario_id: string;
  manifestacao_id?: string;
  tipo: "ENCAMINHAMENTO" | "PRAZO_VENCIMENTO" | "RESPOSTA" | "COMENTARIO";
  titulo: string;
  mensagem: string;
  lida: boolean;
  data_leitura?: string;
  link?: string;
  created_at: string;
}

export function useNotificacoes() {
  const { usuario } = useAuth();
  const queryClient = useQueryClient();

  // Query para buscar notificações
  const { data: notificacoes = [], isLoading } = useQuery({
    queryKey: ["notificacoes", usuario?.id],
    queryFn: async () => {
      if (!usuario) return [];

      const { data, error } = await supabase
        .from("notificacoes")
        .select("*")
        .eq("usuario_id", usuario.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Notificacao[];
    },
    enabled: !!usuario,
    staleTime: 10000,
  });

  // Mutation para marcar como lida
  const marcarComoLida = useMutation({
    mutationFn: async (notificacaoId: string) => {
      const { error } = await supabase
        .from("notificacoes")
        .update({ 
          lida: true, 
          data_leitura: new Date().toISOString() 
        })
        .eq("id", notificacaoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
    },
  });

  // Mutation para marcar todas como lidas
  const marcarTodasComoLidas = useMutation({
    mutationFn: async () => {
      if (!usuario) return;

      const { error } = await supabase
        .from("notificacoes")
        .update({ 
          lida: true, 
          data_leitura: new Date().toISOString() 
        })
        .eq("usuario_id", usuario.id)
        .eq("lida", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
    },
  });

  // Realtime subscription para notificações
  useEffect(() => {
    if (!usuario) return;

    const channel = supabase
      .channel("notificacoes-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notificacoes",
          filter: `usuario_id=eq.${usuario.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [usuario, queryClient]);

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  return {
    notificacoes,
    naoLidas,
    isLoading,
    marcarComoLida,
    marcarTodasComoLidas,
  };
}
