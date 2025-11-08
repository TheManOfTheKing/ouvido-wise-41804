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
import { useSetores } from "@/hooks/useSetores";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react"; // Importar useState

type Usuario = Tables<'usuarios'>;

const userFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  perfil: z.enum(["ADMIN", "OUVIDOR", "GESTOR", "ASSISTENTE", "ANALISTA", "CONSULTA"]),
  setor_id: z.string().optional().nullable(),
  cargo: z.string().min(1, "Cargo é obrigatório"),
  telefone: z.string().optional().nullable(),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").optional(), // Optional for update
  confirmPassword: z.string().optional(), // Optional for update
}).superRefine((data, ctx) => {
  // Only validate passwords if creating a new user (password field is present)
  if (data.password !== undefined) {
    if (!data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A senha é obrigatória para novos usuários",
        path: ["password"],
      });
    }
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
      });
    }
  }
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
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      nome: "",
      email: "",
      perfil: "ANALISTA",
      cargo: "",
      telefone: null,
      setor_id: null,
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (usuario) {
      form.reset({
        nome: usuario.nome || "",
        email: usuario.email || "",
        perfil: usuario.perfil,
        setor_id: usuario.setor_id || null,
        cargo: usuario.cargo || "",
        telefone: usuario.telefone || null,
        password: undefined, // Clear password fields for existing users
        confirmPassword: undefined, // Clear password fields for existing users
      });
    } else {
      form.reset({
        nome: "",
        email: "",
        perfil: "ANALISTA",
        cargo: "",
        telefone: null,
        setor_id: null,
        password: "",
        confirmPassword: "",
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
      telefone: formData.telefone,
      ativo: usuario?.ativo ?? true, // Keep active status if editing, or set to true for new
    };

    if (usuario) {
      // Update existing user
      await updateUsuario({
        id: usuario.id,
        ...baseData,
      });
    } else {
      // Create new user
      await createUsuario({
        ...baseData,
        password: formData.password!, // Password is required for new users by schema
      });
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
                      disabled={!!usuario} // Disable email editing for existing users
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
                    <Input placeholder="(00) 00000-0000" {...field} value={field.value || ""} />
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
                      <SelectItem value="CONSULTA">Consulta</SelectItem>
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
                    defaultValue={field.value || ""}
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

            {!usuario && ( // Show password fields only for new users
              <>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <FormControl>
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            className="pl-10 pr-10"
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <FormControl>
                          <Input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            className="pl-10"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

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