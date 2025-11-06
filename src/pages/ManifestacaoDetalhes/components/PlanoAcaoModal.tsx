import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlanoAcao } from "../hooks/usePlanoAcao";
import { useSetores } from "../hooks/useSetores";
import { useUsuariosBySetor } from "../hooks/useUsuariosBySetor";

interface PlanoAcaoModalProps {
  open: boolean;
  onClose: () => void;
  manifestacaoId: string;
}

export function PlanoAcaoModal({ open, onClose, manifestacaoId }: PlanoAcaoModalProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [setorId, setSetorId] = useState<string>("");
  const [responsavelId, setResponsavelId] = useState<string>("");
  const [prazo, setPrazo] = useState<Date>();

  const { criarPlano } = usePlanoAcao();
  const { data: setores, isLoading: loadingSetores } = useSetores();
  const { data: usuarios, isLoading: loadingUsuarios } = useUsuariosBySetor(setorId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim() || !descricao.trim() || !setorId) {
      return;
    }

    criarPlano.mutate({
      manifestacaoId,
      setorId,
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      responsavelId: responsavelId || undefined,
      prazo,
    }, {
      onSuccess: () => {
        setTitulo("");
        setDescricao("");
        setSetorId("");
        setResponsavelId("");
        setPrazo(undefined);
        onClose();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Plano de Ação</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título do Plano *</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Revisar processo de entrega"
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva as ações que serão realizadas..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="setor">Setor Responsável *</Label>
              <Select value={setorId} onValueChange={setSetorId} required>
                <SelectTrigger id="setor">
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {loadingSetores ? (
                    <div className="p-2 text-sm text-muted-foreground">Carregando...</div>
                  ) : (
                    setores?.map((setor) => (
                      <SelectItem key={setor.id} value={setor.id}>
                        {setor.nome}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="responsavel">Responsável</Label>
              <Select 
                value={responsavelId} 
                onValueChange={setResponsavelId}
                disabled={!setorId || loadingUsuarios}
              >
                <SelectTrigger id="responsavel">
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios?.map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.id}>
                      {usuario.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Prazo</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !prazo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {prazo ? format(prazo, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={prazo}
                  onSelect={setPrazo}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={criarPlano.isPending}>
              {criarPlano.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Plano
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
