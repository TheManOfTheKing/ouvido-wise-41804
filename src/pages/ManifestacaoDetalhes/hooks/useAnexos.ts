import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const BUCKET_NAME = "anexos-manifestacoes";
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function useAnexos() {
  const queryClient = useQueryClient();
  const { usuario } = useAuth();

  const uploadAnexo = useMutation({
    mutationFn: async ({ manifestacaoId, file }: { manifestacaoId: string; file: File }) => {
      if (!usuario) throw new Error("Usuário não autenticado");

      // Validar tamanho
      if (file.size > MAX_FILE_SIZE) {
        throw new Error("Arquivo muito grande. Tamanho máximo: 20MB");
      }

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${manifestacaoId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload para storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obter URL pública (assinada)
      const { data: urlData } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(fileName, 31536000); // 1 ano

      if (!urlData) throw new Error("Erro ao obter URL do arquivo");

      // Registrar no banco
      const { error: dbError } = await supabase.from("anexos").insert({
        manifestacao_id: manifestacaoId,
        nome_arquivo: fileName,
        nome_original: file.name,
        tipo_arquivo: file.type,
        tamanho: file.size,
        url: urlData.signedUrl,
        upload_por_id: usuario.id,
      });

      if (dbError) throw dbError;

      return urlData.signedUrl;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["manifestacao", variables.manifestacaoId] });
      toast.success("Arquivo enviado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao fazer upload:", error);
      toast.error(error.message || "Erro ao fazer upload do arquivo");
    },
  });

  const deletarAnexo = useMutation({
    mutationFn: async ({ id, nomeArquivo }: { id: string; nomeArquivo: string }) => {
      // Deletar do storage
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([nomeArquivo]);

      if (storageError) throw storageError;

      // Deletar do banco
      const { error: dbError } = await supabase
        .from("anexos")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manifestacao"] });
      toast.success("Arquivo deletado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao deletar anexo:", error);
      toast.error("Erro ao deletar arquivo");
    },
  });

  return { uploadAnexo, deletarAnexo };
}