import React, { createContext, useContext, useState, useEffect } from 'react';
import { ModuleService, ModuleDoc, CompanyModuleDoc } from '../services/ModuleService';
import { useAuth } from '../auth/context/AuthContext';

export interface ModuleContextType {
  modules: ModuleDoc[];
  companyModules: Record<string, boolean>;
  loading: boolean;
  isModuleEnabled: (moduleKey: string) => boolean;
  toggleCompanyModule: (companyId: string, moduleKey: string, enabled: boolean) => Promise<void>;
  refreshModules: () => Promise<void>;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

export const ModuleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, activeModules } = useAuth();
  const [modules, setModules] = useState<ModuleDoc[]>([]);
  const [companyModulesMap, setCompanyModulesMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const companyId = user?.companyId || user?.empresaId || user?.tenantId || 't-001';

  const refreshModules = async () => {
    setLoading(true);
    try {
      const allMods = await ModuleService.listAllModules();
      setModules(allMods);

      if (user?.tipoUsuario === 'MASTER' || user?.role === 'Super Administrador') {
        const fullAccess: Record<string, boolean> = {};
        allMods.forEach(m => { fullAccess[m.id] = true; });
        setCompanyModulesMap(fullAccess);
      } else {
        const compMods = await ModuleService.getCompanyModules(companyId);
        setCompanyModulesMap(compMods);
      }
    } catch (err) {
      console.warn('Erro ao carregar módulos no ModuleProvider:', err);
      setCompanyModulesMap(activeModules || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshModules();
  }, [companyId, user?.id]);

  const isModuleEnabled = (moduleKey: string): boolean => {
    if (user?.tipoUsuario === 'MASTER' || user?.role === 'Super Administrador') {
      return true;
    }
    if (companyModulesMap[moduleKey] !== undefined) {
      return companyModulesMap[moduleKey];
    }
    if (activeModules[moduleKey] !== undefined) {
      return activeModules[moduleKey];
    }
    return true; // fallback
  };

  const toggleCompanyModule = async (cId: string, moduleKey: string, enabled: boolean) => {
    await ModuleService.setCompanyModule(cId, moduleKey, enabled);
    setCompanyModulesMap(prev => ({
      ...prev,
      [moduleKey]: enabled
    }));
  };

  return (
    <ModuleContext.Provider
      value={{
        modules,
        companyModules: companyModulesMap,
        loading,
        isModuleEnabled,
        toggleCompanyModule,
        refreshModules
      }}
    >
      {children}
    </ModuleContext.Provider>
  );
};

export const useModuleContext = (): ModuleContextType => {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error('useModuleContext deve ser usado dentro de um ModuleProvider');
  }
  return context;
};
