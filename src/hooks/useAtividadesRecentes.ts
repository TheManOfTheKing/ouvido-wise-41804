import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";
import { Database, Tables } from "@/integrations/supabase/types";

export interface Atividade {
  id: string;
  tipo: "manifestacao" | "usuario" | "setor";
  acao: "criacao" | "atualizacao" | "resposta";
  descricao: string;
  usuario: {
    nome: string;
    avatar?: string;
  };
  data: string;
  referencia_id: string;
}

type Manifestacao = Pick<Tables<"manifestacoes">, "id" | "protocolo" | "updated_at" | "responsavel_id"> & {
  responsavel: {
    nome: string;
    avatar: string | null;
  } | null;
};

type LogAuditoria = Pick<Tables<"logs_auditoria">, "id" | "acao" | "entidade" | "entidade_id" | "data_acao"> & {
  usuario: {
    nome: string;
    avatar: string | null;
  } | null;
};

export function useAtividadesRecentes(limit: number = 5) {
  return useQuery<Atividade[], PostgrestError>({
    queryKey: ["atividades-recentes", limit],
    queryFn: async () => {
      // Buscar logs de manifestações
      const { data: manifestacoes, error: errorManifestacoes } = await supabase
        .from("manifestacoes")
        .select(`
          id,
          protocolo,
          updated_at,
          responsavel:responsavel_id (
            nome,
            avatar
          )
        `)
        .order("updated_at", { ascending: false })
        .limit(limit);

      if (errorManifestacoes) throw errorManifestacoes;

      // Buscar logs de auditoria
      const { data: logsAuditoria, error: errorLogs } = await supabase
        .from("logs_auditoria")
        .select(`
          id,
          acao,
          entidade,
          entidade_id,
          data_acao,
          usuario:usuario_id (
            nome,
            avatar
          )
        `)
        .order("data_acao", { ascending: false })
        .limit(limit);

      if (errorLogs) throw errorLogs;

      // Combinar e formatar os resultados
      const atividadesManifestacoes = (manifestacoes || []).map((m: Manifestacao) => ({
        id: `m-${m.id}`,
        tipo: "manifestacao" as const,
        acao: "atualizacao" as const,
        descricao: `Manifestação #${m.protocolo} atualizada`,
        usuario: m.responsavel
          ? {
              nome: m.responsavel.nome,
              avatar: m.responsavel.avatar || undefined,
            }
          : { nome: "Sistema", avatar: undefined },
        data: m.updated_at,
        referencia_id: m.id,
      }));

      const atividadesLogs = (logsAuditoria || []).map((log: LogAuditoria) => ({
        id: `l-${log.id}`,
        tipo: log.entidade as "manifestacao" | "usuario" | "setor",
        acao: log.acao as "criacao" | "atualizacao" | "resposta",
        descricao: `${log.entidade} ${log.acao}`,
        usuario: log.usuario
          ? {
              nome: log.usuario.nome,
              avatar: log.usuario.avatar || undefined,
            }
          : { nome: "Sistema", avatar: undefined },
        data: log.data_acao,
        referencia_id: log.entidade_id,
      }));

      // Ordenar por data e limitar ao número especificado
      return [...atividadesManifestacoes, ...atividadesLogs]
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        .slice(0, limit);
    },
  });
}