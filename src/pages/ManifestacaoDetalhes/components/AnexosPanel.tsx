import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Paperclip, 
  Upload, 
  Download, 
  Trash2, 
  FileText,
  Image as ImageIcon,
  File
} from "lucide-react";
import { useAnexos } from "../hooks/useAnexos";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Anexo {
  id: string;
  nome_original: string;
  nome_arquivo: string;
  tipo_arquivo: string;
  tamanho: number;
  url: string;
  data_upload: string;
}

interface AnexosPanelProps {
  manifestacaoId: string;
  anexos: Anexo[];
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const getFileIcon = (tipo: string) => {
  if (tipo.startsWith("image/")) return ImageIcon;
  if (tipo === "application/pdf") return FileText;
  return File;
};

export function AnexosPanel({ manifestacaoId, anexos }: AnexosPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadAnexo, deletarAnexo } = useAnexos();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    uploadAnexo.mutate({ manifestacaoId, file });
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = (anexo: Anexo) => {
    deletarAnexo.mutate({
      id: anexo.id,
      nomeArquivo: anexo.nome_arquivo,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Paperclip className="h-5 w-5 text-primary" />
            <CardTitle>Anexos</CardTitle>
            <Badge variant="secondary">{anexos.length}</Badge>
          </div>
          
          <div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              size="sm"
              disabled={uploadAnexo.isPending}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploadAnexo.isPending ? "Enviando..." : "Upload"}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {anexos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Paperclip className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum anexo adicionado ainda</p>
            <p className="text-xs mt-1">Tamanho máximo: 20MB</p>
          </div>
        ) : (
          <div className="space-y-2">
            {anexos.map((anexo) => {
              const FileIcon = getFileIcon(anexo.tipo_arquivo);
              
              return (
                <div
                  key={anexo.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                      <FileIcon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{anexo.nome_original}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(anexo.tamanho)}</span>
                      <span>•</span>
                      <span>{format(new Date(anexo.data_upload), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(anexo.url, "_blank")}
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Deletar"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja deletar o arquivo "{anexo.nome_original}"?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(anexo)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Deletar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
