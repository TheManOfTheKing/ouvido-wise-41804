import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Send, Search, Shield, MessageCircle, ThumbsUp, Lightbulb, AlertTriangle, FileQuestion } from "lucide-react";
import { Link } from "react-router-dom";

export default function PortalPublico() {
  const [modo, setModo] = useState<"registrar" | "consultar">("registrar");
  const [tipo, setTipo] = useState("");
  const [identificacao, setIdentificacao] = useState<"identificado" | "anonimo">("identificado");
  const [loading, setLoading] = useState(false);
  
  // Campos do formulário
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [descricao, setDescricao] = useState("");
  const [consentimento, setConsentimento] = useState(false);
  
  // Consulta
  const [protocoloConsulta, setProtocoloConsulta] = useState("");
  const [statusConsulta, setStatusConsulta] = useState<any>(null);

  const tiposManifestacao = [
    { value: "ELOGIO", label: "Elogio", icon: ThumbsUp, color: "text-success" },
    { value: "SUGESTAO", label: "Sugestão", icon: Lightbulb, color: "text-warning" },
    { value: "RECLAMACAO", label: "Reclamação", icon: AlertTriangle, color: "text-destructive" },
    { value: "DENUNCIA", label: "Denúncia", icon: Shield, color: "text-destructive" },
    { value: "SOLICITACAO", label: "Solicitação", icon: FileQuestion, color: "text-info" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tipo) {
      toast.error("Selecione o tipo de manifestação");
      return;
    }

    if (identificacao === "identificado" && !consentimento) {
      toast.error("É necessário aceitar os termos da LGPD para continuar");
      return;
    }

    setLoading(true);

    try {
      let manifestanteId = null;

      // Se identificado, criar/buscar manifestante
      if (identificacao === "identificado") {
        const { data: manifestanteExistente } = await supabase
          .from("manifestantes")
          .select("id")
          .eq("email", email)
          .single();

        if (manifestanteExistente) {
          manifestanteId = manifestanteExistente.id;
        } else {
          const { data: novoManifestante, error: manifestanteError } = await supabase
            .from("manifestantes")
            .insert({
              nome,
              cpf: cpf || null,
              email,
              telefone: telefone || null,
              consentimento_lgpd: true,
              data_consentimento: new Date().toISOString()
            })
            .select()
            .single();

          if (manifestanteError) throw manifestanteError;
          manifestanteId = novoManifestante.id;
        }
      }

      // Criar manifestação (o protocolo será gerado automaticamente pelo trigger)
      const { data: novaManifestacao, error: manifestacaoError } = await supabase
        .from("manifestacoes")
        .insert({
          tipo,
          descricao,
          anonima: identificacao === "anonimo",
          canal: "PORTAL" as const,
          manifestante_id: manifestanteId
        } as any)
        .select()
        .single();

      if (manifestacaoError) throw manifestacaoError;
      if (!novaManifestacao) throw new Error("Falha ao criar manifestação");

      const protocolo = novaManifestacao.protocolo;

      toast.success("Manifestação registrada com sucesso!", {
        description: `Seu protocolo é: ${protocolo}. Guarde-o para consultar o andamento.`
      });

      // Limpar formulário
      setTipo("");
      setNome("");
      setCpf("");
      setEmail("");
      setTelefone("");
      setDescricao("");
      setConsentimento(false);
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao registrar manifestação", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConsultar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("manifestacoes")
        .select("protocolo, tipo, status, data_recebimento")
        .eq("protocolo", protocoloConsulta)
        .single();

      if (error || !data) {
        toast.error("Protocolo não encontrado");
        setStatusConsulta(null);
        return;
      }

      setStatusConsulta(data);
      toast.success("Manifestação encontrada!");
    } catch (error) {
      toast.error("Erro ao consultar protocolo");
      setStatusConsulta(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Ouvidoria</h1>
          </div>
          <Link to="/login">
            <Button variant="outline">Acesso Restrito</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Portal da Ouvidoria</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Um canal direto para você se manifestar. Registre elogios, sugestões, reclamações,
            denúncias ou solicitações de forma transparente e segura.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Modo Selection */}
        <div className="mb-8 flex justify-center gap-4">
          <Button
            variant={modo === "registrar" ? "default" : "outline"}
            onClick={() => setModo("registrar")}
            className="min-w-[180px]"
          >
            <FileText className="mr-2 h-4 w-4" />
            Registrar Manifestação
          </Button>
          <Button
            variant={modo === "consultar" ? "default" : "outline"}
            onClick={() => setModo("consultar")}
            className="min-w-[180px]"
          >
            <Search className="mr-2 h-4 w-4" />
            Consultar Protocolo
          </Button>
        </div>

        {/* Registrar Manifestação */}
        {modo === "registrar" && (
          <div className="mx-auto max-w-3xl">
            <Card>
              <CardHeader>
                <CardTitle>Nova Manifestação</CardTitle>
                <CardDescription>
                  Preencha os campos abaixo para registrar sua manifestação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Tipo de Manifestação */}
                  <div className="space-y-3">
                    <Label>Tipo de Manifestação *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {tiposManifestacao.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setTipo(t.value)}
                          className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:border-primary ${
                            tipo === t.value ? "border-primary bg-primary/5" : "border-border"
                          }`}
                        >
                          <t.icon className={`h-6 w-6 ${tipo === t.value ? "text-primary" : t.color}`} />
                          <span className="text-sm font-medium">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Identificação */}
                  <div className="space-y-3">
                    <Label>Deseja se identificar? *</Label>
                    <RadioGroup value={identificacao} onValueChange={(v: any) => setIdentificacao(v)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="identificado" id="identificado" />
                        <Label htmlFor="identificado" className="font-normal cursor-pointer">
                          Sim, desejo me identificar (recomendado para receber resposta)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="anonimo" id="anonimo" />
                        <Label htmlFor="anonimo" className="font-normal cursor-pointer">
                          Prefiro permanecer anônimo
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Dados pessoais (se identificado) */}
                  {identificacao === "identificado" && (
                    <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
                      <h3 className="font-semibold">Seus Dados</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="nome">Nome Completo *</Label>
                          <Input
                            id="nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required={identificacao === "identificado"}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cpf">CPF</Label>
                          <Input
                            id="cpf"
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value)}
                            placeholder="000.000.000-00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">E-mail *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required={identificacao === "identificado"}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telefone">Telefone</Label>
                          <Input
                            id="telefone"
                            value={telefone}
                            onChange={(e) => setTelefone(e.target.value)}
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Descrição */}
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição da Manifestação *</Label>
                    <Textarea
                      id="descricao"
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      required
                      rows={6}
                      placeholder="Descreva sua manifestação com o máximo de detalhes possível..."
                    />
                  </div>

                  {/* LGPD */}
                  {identificacao === "identificado" && (
                    <div className="flex items-start space-x-2 rounded-lg border bg-accent/10 p-4">
                      <Checkbox
                        id="lgpd"
                        checked={consentimento}
                        onCheckedChange={(checked) => setConsentimento(checked as boolean)}
                      />
                      <Label htmlFor="lgpd" className="text-sm font-normal cursor-pointer">
                        Li e concordo com a{" "}
                        <a href="#" className="text-primary underline">
                          Política de Privacidade
                        </a>{" "}
                        e autorizo o tratamento dos meus dados pessoais conforme a LGPD. *
                      </Label>
                    </div>
                  )}

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    <Send className="mr-2 h-4 w-4" />
                    {loading ? "Enviando..." : "Enviar Manifestação"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Consultar Protocolo */}
        {modo === "consultar" && (
          <div className="mx-auto max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Consultar Protocolo</CardTitle>
                <CardDescription>
                  Digite o número do protocolo para acompanhar sua manifestação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleConsultar} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="protocolo">Número do Protocolo</Label>
                    <Input
                      id="protocolo"
                      value={protocoloConsulta}
                      onChange={(e) => setProtocoloConsulta(e.target.value)}
                      placeholder="OUV-2025-000001"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    <Search className="mr-2 h-4 w-4" />
                    {loading ? "Consultando..." : "Consultar"}
                  </Button>
                </form>

                {statusConsulta && (
                  <div className="mt-6 space-y-3 rounded-lg border bg-accent/10 p-4">
                    <h3 className="font-semibold">Resultado da Consulta</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Protocolo:</span>
                        <span className="font-medium">{statusConsulta.protocolo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipo:</span>
                        <span className="font-medium">{statusConsulta.tipo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium">{statusConsulta.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data:</span>
                        <span className="font-medium">
                          {new Date(statusConsulta.data_recebimento).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-card/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Sistema de Ouvidoria - Gestão Transparente e Eficiente</p>
          <p className="mt-2">Seus dados estão protegidos conforme a LGPD</p>
        </div>
      </footer>
    </div>
  );
}