import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PlanoAcaoData {
  manifestacaoId: string;
  setorId: string;
  titulo: string;
  descricao: string;
  responsavelId?: string;
  prazo?: Date;
}

export function usePlanoAcao() {
  const queryClient = useQueryClient();

  const criarPlano = useMutation({
    mutationFn: async (data: PlanoAcaoData) => {
      const { error } = await supabase.from("planos_acao").insert({
        manifestacao_id: data.manifestacaoId,
        setor_id: data.setorId,
        titulo: data.titulo,
        descricao: data.descricao,
        responsavel_id: data.responsavelId || null,
        prazo: data.prazo?.toISOString().split('T')[0] || null,
        status: "PENDENTE",
      });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["manifestacao", variables.manifestacaoId] });
      toast.success("Plano de ação criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar plano de ação:", error);
      toast.error("Erro ao criar plano de ação");
    },
  });

  const atualizarPlano = useMutation({
    mutationFn: async ({ id, status, observacoes, dataInicio, dataConclusao }: { 
      id: string; 
      status?: string; 
      observacoes?: string;
      dataInicio?: Date;
      dataConclusao?: Date;
    }) => {
      const updateData: any = {};
      
      if (status) updateData.status = status;
      if (observacoes !== undefined) updateData.observacoes = observacoes;
      if (dataInicio) updateData.data_inicio = dataInicio.toISOString();
      if (dataConclusao) updateData.data_conclusao = dataConclusao.toISOString();

      const { error } = await supabase
        .from("planos_acao")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manifestacao"] });
      toast.success("Plano de ação atualizado!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar plano de ação:", error);
      toast.error("Erro ao atualizar plano de ação");
    },
  });

  return { criarPlano, atualizarPlano };
}
