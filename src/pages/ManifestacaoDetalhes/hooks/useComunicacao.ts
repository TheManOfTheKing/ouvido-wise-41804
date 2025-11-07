import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface ComunicacaoData {
  manifestacaoId: string;
  tipo: "EMAIL" | "TELEFONE" | "PRESENCIAL" | "COMENTARIO";
  mensagem: string;
  interno: boolean;
  destinatario?: string;
  assunto?: string;
}

export function useComunicacao() {
  const queryClient = useQueryClient();
  const { usuario } = useAuth();

  const adicionarComunicacao = useMutation({
    mutationFn: async (data: ComunicacaoData) => {
      if (!usuario) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("comunicacoes").insert({
        manifestacao_id: data.manifestacaoId,
        tipo: data.tipo,
        mensagem: data.mensagem,
        interno: data.interno,
        destinatario: data.destinatario || "N/A",
        remetente: usuario.nome,
        assunto: data.assunto,
        usuario_id: usuario.id,
      });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["manifestacao", variables.manifestacaoId] });
      toast.success("Comunicação registrada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao registrar comunicação:", error);
      toast.error("Erro ao registrar comunicação");
    },
  });

  return { adicionarComunicacao };
}
