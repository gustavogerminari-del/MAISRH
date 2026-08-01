import React, { createContext, useContext } from 'react';
import { useAuth } from '../auth/context/AuthContext';
import { PermissionService, SystemRole } from '../services/PermissionService';

export interface PermissionContextType {
  role: SystemRole;
  isMaster: boolean;
  isEmpresaAdmin: boolean;
  isRH: boolean;
  isGestor: boolean;
  isColaborador: boolean;
  hasPermission: (permission: string) => boolean;
  canAccessRoute: (route: string) => boolean;
  permissions: string[];
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const userRoleRaw = user?.tipoUsuario === 'MASTER' || user?.role === 'Super Administrador' 
    ? 'MASTER' 
    : user?.role || user?.tipoUsuario || 'COLABORADOR';

  const role = PermissionService.normalizeRole(userRoleRaw);
  const permissions = PermissionService.getPermissionsForRole(role);

  const isMaster = role === 'MASTER';
  const isEmpresaAdmin = isMaster || role === 'EMPRESA_ADMIN';
  const isRH = isMaster || isEmpresaAdmin || role === 'RH';
  const isGestor = isMaster || isEmpresaAdmin || isRH || role === 'GESTOR';
  const isColaborador = true;

  const hasPermission = (permission: string): boolean => {
    return PermissionService.hasPermission(role, permission);
  };

  const canAccessRoute = (route: string): boolean => {
    return PermissionService.canAccessRoute(role, route);
  };

  return (
    <PermissionContext.Provider
      value={{
        role,
        isMaster,
        isEmpresaAdmin,
        isRH,
        isGestor,
        isColaborador,
        hasPermission,
        canAccessRoute,
        permissions
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermission deve ser usado dentro de um PermissionProvider');
  }
  return context;
};
