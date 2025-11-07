import { useMemo } from 'react';
import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { usuario } = useAuth();

  const permissions = useMemo(() => {
    if (!usuario?.perfil || !usuario?.ativo) {
      return {
        canViewDashboard: false,
        canManageUsers: false,
        canManageSectors: false,
        canManageManifestations: false,
        canViewReports: false,
        canViewAuditLogs: false,
        isAdmin: false,
        isOuvidor: false,
      };
    }

    const perfil = usuario.perfil;

    return {
      canViewDashboard: true,
      canManageUsers: perfil === 'ADMIN',
      canManageSectors: perfil === 'ADMIN',
      canManageManifestations: ['ADMIN', 'OUVIDOR', 'GESTOR'].includes(perfil),
      canViewReports: ['ADMIN', 'OUVIDOR', 'GESTOR', 'COORDENADOR'].includes(perfil),
      canViewAuditLogs: perfil === 'ADMIN',
      isAdmin: perfil === 'ADMIN',
      isOuvidor: perfil === 'OUVIDOR',
    };
  }, [usuario]);

  return permissions;
};