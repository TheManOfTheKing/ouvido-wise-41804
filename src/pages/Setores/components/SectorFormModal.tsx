import { useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { useSetores } from "@/hooks/useSetores";

type Setor = Tables<'setores'>;

const sectorFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  sigla: z.string().min(1, "Sigla é obrigatória").max(10, "Sigla muito longa"),
  email: z.string().email("Email inválido").optional().nullable(),
  telefone: z.string().optional().nullable(),
  descricao: z.string().optional().nullable(),
});

type SectorFormData = z.infer<typeof sectorFormSchema>;

interface SectorFormModalProps {
  open: boolean;
  onClose: () => void;
  setor?: Setor | null;
}

export function SectorFormModal({ open, onClose, setor }: SectorFormModalProps) {
  const { createSetor, updateSetor, isCreating, isUpdating } = useSetores();

  const form = useForm<SectorFormData>({
    resolver: zodResolver(sectorFormSchema),
    defaultValues: {
      nome: "",
      sigla: "",
      email: null,
      telefone: null,
      descricao: null,
    },
  });

  useEffect(() => {
    if (setor) {
      form.reset({
        nome: setor.nome || "",
        sigla: setor.sigla || "",
        email: setor.email || null,
        telefone: setor.telefone || null,
        descricao: setor.descricao || null,
      });
    } else {
      form.reset({
        nome: "",
        sigla: "",
        email: null,
        telefone: null,
        descricao: null,
      });
    }
  }, [setor, form]);

  const onSubmit = async (formData: SectorFormData) => {
    const baseData = {
      nome: formData.nome,
      sigla: formData.sigla,
      email: formData.email,
      telefone: formData.telefone,
      descricao: formData.descricao,
      ativo: setor?.ativo ?? true, // Mantém o status ativo se for edição, ou define como true para novo
    };

    if (setor) {
      await updateSetor({
        id: setor.id,
        ...baseData,
      });
    } else {
      await createSetor(baseData);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {setor ? "Editar Setor" : "Novo Setor"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo do setor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sigla"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sigla</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: RH, TI, ADM" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="email@setor.com"
                      type="email"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(00) 0000-0000" {...field} value={field.value || ""} />
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
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Breve descrição do setor" rows={3} {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}