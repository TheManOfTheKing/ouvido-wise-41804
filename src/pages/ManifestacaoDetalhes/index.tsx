import { useParams } from "react-router-dom";
import { useManifestacao } from "./hooks/useManifestacao";
import { ManifestacaoHeader } from "./components/ManifestacaoHeader";
import { Timeline } from "./components/Timeline";
import { ActionPanel } from "./components/ActionPanel";
import { SLAAlert } from "./components/SLAAlert";
import { PlanosAcaoPanel } from "./components/PlanosAcaoPanel";
import { ComunicacoesPanel } from "./components/ComunicacoesPanel";
import { AnexosPanel } from "./components/AnexosPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, User, Building2, FileText, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

  const canalLabels: Record<string, string> = {
    PORTAL: "Portal Web",
    EMAIL: "E-mail",
    TELEFONE: "Telefone",
    PRESENCIAL: "Presencial",
    CARTA: "Carta",
    WHATSAPP: "WhatsApp",
    OUTROS: "Outros",
  };

  const sentimentoLabels: Record<string, string> = {
    POSITIVO: "Positivo",
    NEUTRO: "Neutro",
    NEGATIVO: "Negativo",
  };

  const sentimentoColors: Record<string, string> = {
    POSITIVO: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    NEUTRO: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
    NEGATIVO: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  };

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
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="planos">
                  Planos
                  {manifestacao.planos_acao?.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                      {manifestacao.planos_acao.length}
                    </Badge>
                  )}
                </TabsTrigger>
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

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      Informações Gerais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Canal de Entrada</p>
                        <p className="font-medium">{canalLabels[manifestacao.canal] || manifestacao.canal}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Data de Recebimento</p>
                        <p className="font-medium">
                          {format(new Date(manifestacao.data_recebimento), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      {manifestacao.data_encerramento && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Data de Encerramento</p>
                          <p className="font-medium">
                            {format(new Date(manifestacao.data_encerramento), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      )}
                      {manifestacao.tempo_resolucao !== null && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Tempo de Resolução</p>
                          <p className="font-medium">{manifestacao.tempo_resolucao} dia(s)</p>
                        </div>
                      )}
                      {manifestacao.tempo_resposta !== null && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Tempo de Resposta</p>
                          <p className="font-medium">{manifestacao.tempo_resposta} dia(s)</p>
                        </div>
                      )}
                      {manifestacao.sentimento && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Sentimento</p>
                          <Badge variant="outline" className={sentimentoColors[manifestacao.sentimento]}>
                            {sentimentoLabels[manifestacao.sentimento]}
                          </Badge>
                        </div>
                      )}
                    </div>
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

              <TabsContent value="planos">
                <PlanosAcaoPanel
                  manifestacaoId={manifestacao.id}
                  planos={manifestacao.planos_acao || []}
                />
              </TabsContent>

              <TabsContent value="comunicacoes">
                <ComunicacoesPanel
                  manifestacaoId={manifestacao.id}
                  comunicacoes={manifestacao.comunicacoes || []}
                />
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
                <AnexosPanel
                  manifestacaoId={manifestacao.id}
                  anexos={manifestacao.anexos || []}
                />
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