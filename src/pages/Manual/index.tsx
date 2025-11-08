import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { ManualSidebar } from "./components/ManualSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { manualSections } from "./data/manualContent";
import { useIsMobile } from "@/hooks/use-mobile"; // Importar o hook useIsMobile

export default function ManualPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile(); // Usar o hook para detectar mobile
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Redireciona para o primeiro tópico se a URL base do manual for acessada
  useEffect(() => {
    if (location.pathname === "/manual") {
      const firstTopicPath = manualSections[0]?.topics[0]?.path;
      if (firstTopicPath) {
        navigate(`/manual/${firstTopicPath}`, { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  const handleLinkClick = () => {
    if (isMobile) {
      setIsSheetOpen(false); // Fecha a sidebar em mobile ao clicar em um link
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-80px)] flex flex-col">
        <h1 className="text-3xl font-bold mb-6">Manual do Usuário</h1>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 overflow-hidden">
          {/* Sidebar para Desktop */}
          <aside className="hidden lg:block">
            <ManualSidebar />
          </aside>

          {/* Sidebar para Mobile (Sheet) */}
          {isMobile && (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="mb-4 lg:hidden">
                  <Menu className="mr-2 h-4 w-4" />
                  Abrir Tópicos
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="h-full pt-8"> {/* Ajuste de padding para o conteúdo do sheet */}
                  <ManualSidebar onLinkClick={handleLinkClick} />
                </div>
              </SheetContent>
            </Sheet>
          )}

          {/* Conteúdo Principal */}
          <main className="flex-1 overflow-y-auto">
            <Outlet /> {/* Renderiza o ManualContentDisplay aqui */}
          </main>
        </div>
      </div>
    </AppLayout>
  );
}