import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions"; // Import usePermissions

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean; // New prop
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, usuario, loading } = useAuth();
  const { isAdmin } = usePermissions(); // Use isAdmin from usePermissions

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user profile is loaded and active
  if (usuario && !usuario.ativo) {
    // Redirect inactive users to login with an error message
    return <Navigate to="/login?error=inactive" replace />;
  }

  // If adminOnly is true, and the user is not an admin, redirect to dashboard
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}