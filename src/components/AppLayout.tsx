import { ReactNode } from "react";
import { LayoutDashboard, LogOut, BookOpen } from "lucide-react"; // Importar BookOpen
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { usePermissions } from "@/hooks/usePermissions"; // Importar usePermissions

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { usuario, signOut } = useAuth();
  const { canViewManual } = usePermissions(); // Obter permissão para o manual

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
            <ThemeToggle />
            <NotificationsDropdown />
            {canViewManual && ( // Renderiza o link do manual se o usuário tiver permissão
              <Link to="/manual">
                <Button variant="ghost" size="icon" title="Manual do Usuário">
                  <BookOpen className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <span className="text-sm text-muted-foreground hidden md:inline">
              {usuario?.nome} <span className="text-primary">({usuario?.perfil})</span>
            </span>
            <Button variant="outline" size="sm" onClick={() => {
              console.log("[AppLayout] Botão Sair clicado.");
              signOut();
            }}>
              <LogOut className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}