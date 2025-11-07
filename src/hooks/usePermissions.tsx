import { useAuth } from "@/hooks/useAuth";

export function usePermissions() {
  const { usuario } = useAuth();
  const roles = usuario?.roles || [];

  const hasRole = (role: string) => roles.includes(role);
  
  const hasAnyRole = (...checkRoles: string[]) => 
    checkRoles.some(role => roles.includes(role));
  
  const isAdmin = hasRole('admin');
  const isOuvidor = hasRole('ouvidor');
  const isGestor = hasRole('gestor');
  const isAssistente = hasRole('assistente');
  const isAnalista = hasRole('analista');
  const canViewAll = hasAnyRole('admin', 'ouvidor');
  const canManageUsers = hasAnyRole('admin', 'ouvidor');

  return {
    roles,
    hasRole,
    hasAnyRole,
    isAdmin,
    isOuvidor,
    isGestor,
    isAssistente,
    isAnalista,
    canViewAll,
    canManageUsers
  };
}
