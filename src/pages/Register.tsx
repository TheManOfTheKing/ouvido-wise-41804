import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authService } from "@/lib/supabase";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail, User, Shield, AlertCircle } from "lucide-react";
import { useCheckFirstUser } from "@/hooks/useCheckFirstUser";

export default function Register() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [perfil, setPerfil] = useState("ADMIN"); // Default to ADMIN for potential first user
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isFirstUser, loading: checkingFirstUser } = useCheckFirstUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);

    // Determine the final profile based on whether it's the first user
    const perfilFinal = isFirstUser ? perfil : "ANALISTA";
    const { error } = await authService.signUp(email, password, nome, perfilFinal);

    if (error) {
      toast.error("Erro ao criar conta", {
        description: error
      });
      setLoading(false);
      return;
    }

    toast.success("Conta criada com sucesso!", {
      description: "Você já pode fazer login no sistema."
    });
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-accent/20 to-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground">Sistema de Ouvidoria</h1>
          <p className="mt-2 text-muted-foreground">Crie sua conta para começar</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Criar Conta</CardTitle>
            <CardDescription>Preencha os dados para se registrar</CardDescription>
          </CardHeader>
          <CardContent>
            {isFirstUser && !checkingFirstUser && (
              <Alert className="mb-4 border-primary/50 bg-primary/5">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Primeiro Usuário do Sistema!</strong>
                  <br />
                  Você será o administrador principal. Escolha o perfil com atenção.
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="nome"
                    type="text"
                    placeholder="João Silva"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Conditional Profile Selection for First User */}
              {isFirstUser && !checkingFirstUser && (
                <div className="space-y-2">
                  <Label htmlFor="perfil">Perfil de Acesso</Label>
                  <Select value={perfil} onValueChange={setPerfil}>
                    <SelectTrigger id="perfil">
                      <SelectValue placeholder="Selecione o perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Administrador</div>
                            <div className="text-xs text-muted-foreground">Acesso total ao sistema</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="OUVIDOR">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium">Ouvidor</div>
                            <div className="text-xs text-muted-foreground">Gerencia manifestações e relatórios</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Como primeiro usuário, recomendamos o perfil de Administrador
                  </p>
                </div>
              )}

              {!isFirstUser && !checkingFirstUser && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Novos usuários são criados como <strong>Analista</strong>. 
                    Contate um administrador para alterar o perfil.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading || checkingFirstUser}>
                {loading ? "Criando conta..." : checkingFirstUser ? "Verificando..." : "Criar Conta"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Faça login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link to="/" className="text-sm text-primary hover:underline">
            ← Voltar para página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}