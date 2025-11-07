import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useEditarManifestacao } from "../hooks/useEditarManifestacao";
import { Tables } from "@/integrations/supabase/types";

type Manifestacao = Tables<'manifestacoes'>;

const editManifestacaoSchema = z.object({
  tipo: z.enum(["ELOGIO", "SUGESTAO", "RECLAMACAO", "DENUNCIA", "SOLICITACAO"]),
  prioridade: z.enum(["BAIXA", "MEDIA", "ALTA", "URGENTE"]),
  categoria: z.string().optional().nullable(),
  tags: z.string().optional().nullable(), // Represented as comma-separated string
  descricao: z.string().min(1, "A descrição é obrigatória"),
  anonima: z.boolean(),
  sigilosa: z.boolean(),
});

type EditManifestacaoFormData = z.infer<typeof editManifestacaoSchema>;

interface EditManifestacaoModalProps {
  open: boolean;
  onClose: () => void;
  manifestacao: Manifestacao;
}

const tipoLabels: Record<string, string> = {
  ELOGIO: "Elogio",
  SUGESTAO: "Sugestão",
  RECLAMACAO: "Reclamação",
  DENUNCIA: "Denúncia",
  SOLICITACAO: "Solicitação",
};

const prioridadeLabels: Record<string, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  URGENTE: "Urgente",
};

export function EditManifestacaoModal({ open, onClose, manifestacao }: EditManifestacaoModalProps) {
  const { mutate: editarManifestacao, isPending } = useEditarManifestacao();

  const form = useForm<EditManifestacaoFormData>({
    resolver: zodResolver(editManifestacaoSchema),
    defaultValues: {
      tipo: manifestacao.tipo,
      prioridade: manifestacao.prioridade,
      categoria: manifestacao.categoria,
      tags: manifestacao.tags?.join(", ") || "",
      descricao: manifestacao.descricao,
      anonima: manifestacao.anonima,
      sigilosa: manifestacao.sigilosa,
    },
  });

  useEffect(() => {
    if (manifestacao) {
      form.reset({
        tipo: manifestacao.tipo,
        prioridade: manifestacao.prioridade,
        categoria: manifestacao.categoria,
        tags: manifestacao.tags?.join(", ") || "",
        descricao: manifestacao.descricao,
        anonima: manifestacao.anonima,
        sigilosa: manifestacao.sigilosa,
      });
    }
  }, [manifestacao, form]);

  const onSubmit = (data: EditManifestacaoFormData) => {
    console.log("onSubmit called with data:", data);
    console.log("Form errors:", form.formState.errors); // Log form errors

    editarManifestacao(
      {
        id: manifestacao.id,
        ...data,
        tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()) : null,
      },
      {
        onSuccess: () => {
          console.log("Mutation successful, closing modal.");
          onClose();
        },
        onError: (error) => {
          console.error("Mutation failed in onSubmit callback:", error);
          // The useEditarManifestacao hook already handles toast.error, but this is for extra debugging
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Manifestação</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(tipoLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prioridade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridade</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(prioridadeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Atendimento, Infraestrutura" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (separadas por vírgula)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Urgente, Crítico, Setor X" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva a manifestação" rows={6} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="anonima"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Manifestação Anônima</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Marque se o manifestante não deseja ser identificado.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sigilosa"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Manifestação Sigilosa</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Marque para restringir o acesso aos detalhes.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}