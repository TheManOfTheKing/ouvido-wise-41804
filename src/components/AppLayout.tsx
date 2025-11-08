import { ReactNode } from "react";
import { LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { Link } from "react-router-dom";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { usuario, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Sistema de Ouvidoria</h1>
          </Link>
          <div className="flex items-center gap-4">
            <NotificationsDropdown />
            <span className="text-sm text-muted-foreground">
              {usuario?.nome} <span className="text-primary">({usuario?.perfil})</span>
            </span>
            <Button variant="outline" size="sm" onClick={() => {
              console.log("[AppLayout] Botão Sair clicado."); // Log para depuração
              signOut();
            }}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}