import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2, ShieldAlert } from "lucide-react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useSetores } from "@/hooks/useSetores"; // Caminho corrigido
import { useUsuariosBySetor } from "../hooks/useUsuariosBySetor";
import { useEncaminharManifestacao } from "../hooks/useEncaminharManifestacao";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EncaminharModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manifestacaoId: string;
  isSigilosa: boolean;
  tipo: string;
}

export function EncaminharModal({
  open,
  onOpenChange,
  manifestacaoId,
  isSigilosa,
  tipo,
}: EncaminharModalProps) {
  const [setorDestinoId, setSetorDestinoId] = useState<string>("");
  const [usuarioDestinoId, setUsuarioDestinoId] = useState<string>("");
  const [instrucoes, setInstrucoes] = useState("");
  const [prazo, setPrazo] = useState<Date>();

  const { data: setores, isLoading: isLoadingSetores } = useSetores();
  const { data: usuarios, isLoading: isLoadingUsuarios } = useUsuariosBySetor(setorDestinoId);
  const { mutate: encaminhar, isPending } = useEncaminharManifestacao();

  // Verifica se é uma denúncia
  const isDenuncia = tipo === "DENUNCIA";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!setorDestinoId) {
      return;
    }

    encaminhar(
      {
        manifestacaoId,
        setorDestinoId,
        usuarioDestinoId: usuarioDestinoId || null,
        instrucoes: instrucoes.trim() || undefined,
        prazo: prazo || null,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          // Resetar form
          setSetorDestinoId("");
          setUsuarioDestinoId("");
          setInstrucoes("");
          setPrazo(undefined);
        },
      }
    );
  };

  const handleSetorChange = (value: string) => {
    setSetorDestinoId(value);
    setUsuarioDestinoId(""); // Resetar usuário ao trocar setor
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Encaminhar Manifestação</DialogTitle>
            <DialogDescription>
              Encaminhe esta manifestação para outro setor ou usuário responsável.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {(isSigilosa || isDenuncia) && (
              <Alert>
                <ShieldAlert className="h-4 w-4" />
                <AlertDescription>
                  {isDenuncia 
                    ? "Esta é uma denúncia. Os dados do manifestante serão automaticamente anonimizados no encaminhamento para garantir o sigilo e proteção do denunciante."
                    : "Esta é uma manifestação sigilosa. Os dados do manifestante serão automaticamente anonimizados no encaminhamento para garantir o sigilo."
                  }
                </AlertDescription>
              </Alert>
            )}

            {/* Setor de Destino */}
            <div className="space-y-2">
              <Label htmlFor="setor">
                Setor de destino <span className="text-destructive">*</span>
              </Label>
              <Select
                value={setorDestinoId}
                onValueChange={handleSetorChange}
                disabled={isLoadingSetores}
              >
                <SelectTrigger id="setor">
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {setores?.map((setor) => (
                    <SelectItem key={setor.id} value={setor.id}>
                      {setor.sigla} - {setor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Usuário Responsável (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="usuario">Responsável (opcional)</Label>
              <Select
                value={usuarioDestinoId}
                onValueChange={setUsuarioDestinoId}
                disabled={!setorDestinoId || isLoadingUsuarios}
              >
                <SelectTrigger id="usuario">
                  <SelectValue placeholder="Selecione um usuário ou deixe em branco" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios?.map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.id}>
                      {usuario.nome} ({usuario.perfil})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {setorDestinoId && usuarios?.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Nenhum usuário encontrado neste setor
                </p>
              )}
            </div>

            {/* Prazo */}
            <div className="space-y-2">
              <Label>Prazo para resposta (opcional)</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !prazo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {prazo ? (
                        format(prazo, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={prazo}
                      onSelect={setPrazo}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPrazo(addDays(new Date(), 3))}
                  >
                    3d
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPrazo(addDays(new Date(), 7))}
                  >
                    7d
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPrazo(addDays(new Date(), 15))}
                  >
                    15d
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Defina um prazo para a resposta desta manifestação
              </p>
            </div>

            {/* Instruções */}
            <div className="space-y-2">
              <Label htmlFor="instrucoes">Instruções para o setor</Label>
              <Textarea
                id="instrucoes"
                placeholder="Descreva o que o setor deve fazer, informações importantes ou contexto adicional..."
                value={instrucoes}
                onChange={(e) => setInstrucoes(e.target.value)}
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">
                {instrucoes.length}/1000 caracteres
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!setorDestinoId || isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Encaminhar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}