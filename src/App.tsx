import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import PortalPublico from "./pages/PortalPublico";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Manifestacoes from "./pages/Manifestacoes";
import ManifestacaoDetalhes from "./pages/ManifestacaoDetalhes";
import NotFound from "./pages/NotFound";
import UsuariosPage from "./pages/Usuarios";
import SetoresPage from "./pages/Setores";
import { ThemeProvider } from "@/components/ThemeProvider"; // Importar ThemeProvider

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000,   // 10 minutos
      retry: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" attribute="class"> {/* Adicionado ThemeProvider aqui */}
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<PortalPublico />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manifestacoes"
                element={
                  <ProtectedRoute>
                    <Manifestacoes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manifestacoes/:id"
                element={
                  <ProtectedRoute>
                    <ManifestacaoDetalhes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/usuarios"
                element={
                  <ProtectedRoute adminOnly>
                    <UsuariosPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/setores"
                element={
                  <ProtectedRoute adminOnly>
                    <SetoresPage />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider> {/* Fechamento do ThemeProvider */}
  </QueryClientProvider>
);

export default App;