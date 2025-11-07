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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { useUsuarios } from "../hooks/useUsuarios";
import { useSetores } from "@/pages/ManifestacaoDetalhes/hooks/useSetores";

type Usuario = Tables<'usuarios'>;

const userFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  perfil: z.enum(["ADMIN", "OUVIDOR", "GESTOR", "ASSISTENTE", "ANALISTA", "CONSULTA"]),
  setor_id: z.string().optional(),
  cargo: z.string().min(1, "Cargo é obrigatório"),
  telefone: z.string().optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  usuario?: Usuario | null;
}

export function UserFormModal({ open, onClose, usuario }: UserFormModalProps) {
  const { createUsuario, updateUsuario, isCreating, isUpdating } = useUsuarios();
  const { data: setores } = useSetores();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      nome: "",
      email: "",
      perfil: "ANALISTA",
      cargo: "",
      telefone: "",
    },
  });

  useEffect(() => {
    if (usuario) {
      form.reset({
        nome: usuario.nome || "",
        email: usuario.email || "",
        perfil: usuario.perfil,
        setor_id: usuario.setor_id || undefined,
        cargo: usuario.cargo || "",
        telefone: usuario.telefone || "",
      });
    } else {
      form.reset({
        nome: "",
        email: "",
        perfil: "ANALISTA",
        cargo: "",
        telefone: "",
      });
    }
  }, [usuario, form]);

  const onSubmit = async (formData: UserFormData) => {
    const baseData = {
      nome: formData.nome,
      email: formData.email,
      perfil: formData.perfil,
      cargo: formData.cargo,
      setor_id: formData.setor_id,
      telefone: formData.telefone || "",
      auth_id: usuario?.auth_id || "",
      avatar: usuario?.avatar || "",
      primeiro_acesso: usuario?.primeiro_acesso || null,
      ultimo_acesso: usuario?.ultimo_acesso || null,
      ativo: true,
      updated_at: new Date().toISOString(),
      tema: "light" as const,
      timezone: "America/Sao_Paulo"
    };

    if (usuario) {
      await updateUsuario({
        id: usuario.id,
        ...baseData,
      });
    } else {
      await createUsuario(baseData);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {usuario ? "Editar Usuário" : "Novo Usuário"}
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
                    <Input placeholder="Nome do usuário" {...field} />
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
                      placeholder="email@exemplo.com" 
                      type="email"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cargo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <FormControl>
                    <Input placeholder="Cargo do usuário" {...field} />
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
                    <Input placeholder="(00) 00000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="perfil"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perfil</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um perfil" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                      <SelectItem value="OUVIDOR">Ouvidor</SelectItem>
                      <SelectItem value="GESTOR">Gestor</SelectItem>
                      <SelectItem value="ASSISTENTE">Assistente</SelectItem>
                      <SelectItem value="ANALISTA">Analista</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="setor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Setor</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um setor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {setores?.map((setor) => (
                        <SelectItem key={setor.id} value={setor.id}>
                          {setor.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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