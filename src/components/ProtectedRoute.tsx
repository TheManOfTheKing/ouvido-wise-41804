import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  requiredPermission?: keyof ReturnType<typeof usePermissions>; // Adicionado para permissões específicas
}

export function ProtectedRoute({ children, adminOnly = false, requiredPermission }: ProtectedRouteProps) {
  const { user, usuario, loading } = useAuth();
  const permissions = usePermissions(); // Obter todas as permissões

  console.log("[ProtectedRoute] Render: loading=", loading, "user=", !!user, "usuario=", !!usuario, "isAdmin=", permissions.isAdmin);

  if (loading) {
    console.log("[ProtectedRoute] Loading state...");
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    console.log("[ProtectedRoute] No Supabase user found. Redirecting to login.");
    return <Navigate to="/login" replace />;
  }

  if (!usuario) {
    console.log("[ProtectedRoute] Supabase user found, but app profile (usuario) is null. Redirecting to login.");
    return <Navigate to="/login?error=profile_missing" replace />;
  }

  if (!usuario.ativo) {
    console.log("[ProtectedRoute] User profile is inactive. Redirecting to login.");
    return <Navigate to="/login?error=inactive" replace />;
  }

  // Verifica permissão de administrador
  if (adminOnly && !permissions.isAdmin) {
    console.log("[ProtectedRoute] Admin-only route, but user is not admin. Redirecting to dashboard.");
    return <Navigate to="/dashboard" replace />;
  }

  // Verifica permissão específica, se fornecida
  if (requiredPermission && !permissions[requiredPermission]) {
    console.log(`[ProtectedRoute] User does not have required permission: ${String(requiredPermission)}. Redirecting to dashboard.`);
    return <Navigate to="/dashboard" replace />;
  }

  console.log("[ProtectedRoute] User is authenticated and authorized. Rendering children.");
  return <>{children}</>;
}