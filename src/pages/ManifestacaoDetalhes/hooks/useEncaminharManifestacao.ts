import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface EncaminharData {
  manifestacaoId: string;
  setorDestinoId: string;
  usuarioDestinoId?: string | null;
  instrucoes?: string;
  prazo?: Date | null;
}

export function useEncaminharManifestacao() {
  const queryClient = useQueryClient();
  const { usuario } = useAuth();

  return useMutation({
    mutationFn: async (data: EncaminharData) => {
      if (!usuario) throw new Error("Usuário não autenticado");

      // Buscar a manifestação atual completa
      const { data: manifestacao, error: manifestacaoError } = await supabase
        .from("manifestacoes")
        .select("setor_responsavel_id, sigilosa, protocolo, tipo, anonima")
        .eq("id", data.manifestacaoId)
        .single();

      if (manifestacaoError) throw manifestacaoError;

      // Verificar se é uma denúncia ou manifestação sigilosa
      const isDenuncia = manifestacao.tipo === "DENUNCIA";
      const precisaAnonimizar = manifestacao.sigilosa || manifestacao.anonima || isDenuncia;

      // Criar encaminhamento
      const { error: encaminhamentoError } = await supabase
        .from("encaminhamentos")
        .insert({
          manifestacao_id: data.manifestacaoId,
          setor_origem_id: manifestacao.setor_responsavel_id,
          setor_destino_id: data.setorDestinoId,
          usuario_origem_id: usuario.id,
          usuario_destino_id: data.usuarioDestinoId || null,
          instrucoes: data.instrucoes || null,
          prazo: data.prazo ? data.prazo.toISOString() : null,
          status: "PENDENTE",
        });

      if (encaminhamentoError) throw encaminhamentoError;

      // Atualizar a manifestação
      const updateData: any = {
        setor_responsavel_id: data.setorDestinoId,
        status: "ENCAMINHADA",
      };

      if (data.usuarioDestinoId) {
        updateData.responsavel_id = data.usuarioDestinoId;
      }

      if (data.prazo) {
        updateData.prazo_resposta = data.prazo.toISOString();
      }

      // Se for uma denúncia ou manifestação sigilosa/anônima, anonimizar os dados
      if (precisaAnonimizar) {
        updateData.manifestante_id = null;
        updateData.anonima = true;
      }

      const { error: updateError } = await supabase
        .from("manifestacoes")
        .update(updateData)
        .eq("id", data.manifestacaoId);

      if (updateError) throw updateError;

      // Criar notificação para o responsável
      if (data.usuarioDestinoId) {
        const mensagem = precisaAnonimizar
          ? `Você recebeu uma manifestação sigilosa (${manifestacao.protocolo}) para análise.`
          : `Você recebeu a manifestação ${manifestacao.protocolo} para análise.`;

        await supabase.from("notificacoes").insert({
          usuario_id: data.usuarioDestinoId,
          manifestacao_id: data.manifestacaoId,
          tipo: "ENCAMINHAMENTO",
          titulo: "Nova manifestação encaminhada",
          mensagem,
          link: `/manifestacoes/${data.manifestacaoId}`,
        });
      }

      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["manifestacao", variables.manifestacaoId] });
      queryClient.invalidateQueries({ queryKey: ["manifestacoes"] });
      toast.success("Manifestação encaminhada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao encaminhar manifestação:", error);
      toast.error("Erro ao encaminhar manifestação. Tente novamente.");
    },
  });
}