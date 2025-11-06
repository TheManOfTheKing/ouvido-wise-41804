import { useParams } from "react-router-dom";
import { useManifestacao } from "./hooks/useManifestacao";
import { ManifestacaoHeader } from "./components/ManifestacaoHeader";
import { Timeline } from "./components/Timeline";
import { ActionPanel } from "./components/ActionPanel";
import { SLAAlert } from "./components/SLAAlert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, User, Building2, FileText, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ManifestacaoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const { data: manifestacao, isLoading, error } = useManifestacao(id!);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-10 w-64 mb-2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !manifestacao) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Erro ao carregar manifestação"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isAnonima = manifestacao.anonima || manifestacao.sigilosa;

  return (
    <div className="min-h-screen bg-background">
      <ManifestacaoHeader manifestacao={manifestacao} />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Alerta de SLA */}
            <SLAAlert 
              prazoResposta={manifestacao.prazo_resposta} 
              status={manifestacao.status}
            />
            
            <Tabs defaultValue="detalhes" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="comunicacoes">
                  Comunicações
                  {manifestacao.comunicacoes?.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                      {manifestacao.comunicacoes.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="encaminhamentos">
                  Encaminhamentos
                  {manifestacao.encaminhamentos?.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                      {manifestacao.encaminhamentos.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="anexos">
                  Anexos
                  {manifestacao.anexos?.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                      {manifestacao.anexos.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="detalhes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Descrição
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {manifestacao.descricao}
                    </p>
                    {manifestacao.categoria && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-2">Categoria</p>
                        <Badge variant="outline">{manifestacao.categoria}</Badge>
                      </div>
                    )}
                    {manifestacao.tags && manifestacao.tags.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-2">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {manifestacao.tags.map((tag: string) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {!isAnonima && manifestacao.manifestante && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Dados do Manifestante
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Nome</p>
                          <p className="font-medium">{manifestacao.manifestante.nome}</p>
                        </div>
                        {manifestacao.manifestante.email && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">E-mail</p>
                            <p className="font-medium">{manifestacao.manifestante.email}</p>
                          </div>
                        )}
                        {manifestacao.manifestante.telefone && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Telefone</p>
                            <p className="font-medium">{manifestacao.manifestante.telefone}</p>
                          </div>
                        )}
                        {manifestacao.manifestante.cidade && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Cidade/UF</p>
                            <p className="font-medium">
                              {manifestacao.manifestante.cidade} - {manifestacao.manifestante.estado}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="pt-3 border-t">
                        <Badge
                          variant={manifestacao.manifestante.prefere_comunicacao ? "default" : "secondary"}
                        >
                          {manifestacao.manifestante.prefere_comunicacao
                            ? "Aceita comunicação"
                            : "Não deseja comunicação"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {isAnonima && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Manifestação {manifestacao.anonima ? "anônima" : "sigilosa"}.
                      Dados do manifestante protegidos.
                    </AlertDescription>
                  </Alert>
                )}

                {manifestacao.responsavel && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Responsável Atual
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Nome</p>
                          <p className="font-medium">{manifestacao.responsavel.nome}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Perfil</p>
                          <Badge variant="outline">{manifestacao.responsavel.perfil}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="timeline">
                <Timeline manifestacao={manifestacao} />
              </TabsContent>

              <TabsContent value="comunicacoes">
                <Card>
                  <CardContent className="p-6">
                    {manifestacao.comunicacoes && manifestacao.comunicacoes.length > 0 ? (
                      <div className="space-y-4">
                        {manifestacao.comunicacoes.map((com: any) => (
                          <div key={com.id} className="border-b pb-4 last:border-0">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-sm">
                                {com.assunto || com.tipo}
                              </h4>
                              <Badge variant={com.interno ? "secondary" : "default"}>
                                {com.interno ? "Interno" : "Externo"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {com.mensagem}
                            </p>
                            <div className="text-xs text-muted-foreground">
                              {com.usuario?.nome} • {new Date(com.data_envio).toLocaleString("pt-BR")}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhuma comunicação registrada
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="encaminhamentos">
                <Card>
                  <CardContent className="p-6">
                    {manifestacao.encaminhamentos && manifestacao.encaminhamentos.length > 0 ? (
                      <div className="space-y-4">
                        {manifestacao.encaminhamentos.map((enc: any) => (
                          <div key={enc.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="font-medium text-sm">
                                  {enc.setor_origem?.nome || "Ouvidoria"} → {enc.setor_destino?.nome}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Por {enc.usuario_origem?.nome}
                                </p>
                              </div>
                              <Badge variant={enc.status === "CONCLUIDO" ? "default" : "secondary"}>
                                {enc.status}
                              </Badge>
                            </div>
                            {enc.instrucoes && (
                              <div className="bg-muted/50 rounded p-3 text-sm mb-2">
                                <p className="font-medium text-xs text-muted-foreground mb-1">
                                  Instruções:
                                </p>
                                {enc.instrucoes}
                              </div>
                            )}
                            {enc.resposta_setor && (
                              <div className="bg-primary/5 rounded p-3 text-sm">
                                <p className="font-medium text-xs text-muted-foreground mb-1">
                                  Resposta:
                                </p>
                                {enc.resposta_setor}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhum encaminhamento realizado
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="anexos">
                <Card>
                  <CardContent className="p-6">
                    {manifestacao.anexos && manifestacao.anexos.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {manifestacao.anexos.map((anexo: any) => (
                          <div
                            key={anexo.id}
                            className="border rounded-lg p-4 flex items-start gap-3"
                          >
                            <Paperclip className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {anexo.nome_original}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {anexo.tipo_arquivo} • {(anexo.tamanho / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhum anexo
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <ActionPanel manifestacao={manifestacao} />
          </div>
        </div>
      </div>
    </div>
  );
}
