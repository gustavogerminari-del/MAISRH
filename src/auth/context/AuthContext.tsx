/**
 * Módulo AUTENTICAÇÃO E ACESSO - Provedor de Contexto de Autenticação e Sessão com Firebase
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, RoleProfile, ScreenRouteKey, SystemActionKey, SessionToken, UserType } from '../types/auth';
import { DEMO_USERS, MASTER_USER } from '../constants/permissions';
import { logger, logCentralizedError } from '../../core';
import { 
  saveUsuarioFirestore, 
  fetchEmpresaModulosFirestore, 
  seedFirestoreIfEmpty 
} from '../../lib/firestoreServices';
import { getTenants } from '../../master-admin/masterTenantsStore';

export interface AuthContextType {
  user: UserProfile | null;
  sessionToken: SessionToken | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeModules: Record<string, boolean>;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchDemoProfile: (role: RoleProfile) => void;
  requestPasswordReset: (email: string) => Promise<boolean>;
  hasScreenAccess: (screenKey: ScreenRouteKey) => boolean;
  hasActionAccess: (actionKey: SystemActionKey) => boolean;
  isModuleActive: (moduleKey: string) => boolean;
  refreshCompanyModules: () => Promise<void>;
}

const STORAGE_KEY_USER = 'MAIS_RH_AUTH_USER';
const STORAGE_KEY_TOKEN = 'MAIS_RH_AUTH_TOKEN';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sessionToken, setSessionToken] = useState<SessionToken | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeModules, setActiveModules] = useState<Record<string, boolean>>({});

  // Trigger seeding of Firestore collections on load
  useEffect(() => {
    seedFirestoreIfEmpty().catch(console.error);
  }, []);

  // Fetch company modules when user changes or companyId changes
  const refreshCompanyModules = async () => {
    if (!user) {
      setActiveModules({});
      return;
    }

    // Super Admin / MASTER has all modules enabled by default
    if (user.role === 'Super Administrador' || user.tipoUsuario === 'MASTER') {
      setActiveModules({
        recrutamento: true,
        vagas: true,
        bancoTalentos: true,
        entrevistas: true,
        dp: true,
        equipeInterna: true,
        ponto: true,
        folha: true,
        beneficios: true,
        feriasBeneficios: true,
        consultorRH: true,
        documentosAssinatura: true,
        auditoriaLogs: true,
        relatoriosAvancados: true,
        siteVagasPersonalizado: true,
        desempenho: true
      });
      return;
    }

    const empresaId = user.empresaId || user.companyId || user.tenantId || 't-001';

    // 1. Fetch from Firestore `empresa_modulos`
    try {
      const remoteMods = await fetchEmpresaModulosFirestore(empresaId);
      if (remoteMods && Object.keys(remoteMods).length > 0) {
        setActiveModules(remoteMods);
        return;
      }
    } catch (err) {
      console.warn('Erro ao consultar módulos da empresa no Firestore:', err);
    }

    // 2. Fallback to Local Tenant Store
    const tenants = getTenants();
    const currentTenant = tenants.find(t => t.id === empresaId) || tenants[0];
    if (currentTenant && currentTenant.modules) {
      setActiveModules(currentTenant.modules as any);
    }
  };

  useEffect(() => {
    refreshCompanyModules();
  }, [user?.empresaId, user?.companyId, user?.tenantId, user?.tipoUsuario, user?.role]);

  // Inicializa sessão a partir do armazenamento local
  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem(STORAGE_KEY_USER);
      const savedTokenStr = localStorage.getItem(STORAGE_KEY_TOKEN);

      if (savedUserStr && savedTokenStr) {
        const parsedUser: UserProfile = JSON.parse(savedUserStr);
        const parsedToken: SessionToken = JSON.parse(savedTokenStr);

        if (new Date(parsedToken.expiresAt) > new Date()) {
          setUser(parsedUser);
          setSessionToken(parsedToken);
          logger.info(`Sessão restaurada para usuário ${parsedUser.email}`, 'AuthContext');
        } else {
          logger.warn('Sessão expirada. Efetuando logout automático.', 'AuthContext');
          clearAuthData();
        }
      } else {
        // Inicializa por padrão com Administrador Empresa de Exemplo
        const defaultAdmin = DEMO_USERS[0];
        const enrichedDefault: UserProfile = {
          ...defaultAdmin,
          tipoUsuario: 'EMPRESA',
          empresaId: defaultAdmin.companyId || defaultAdmin.tenantId || 't-001'
        };
        const token = generateMockToken(enrichedDefault.id);
        setUser(enrichedDefault);
        setSessionToken(token);
      }
    } catch (err) {
      logCentralizedError(err, 'AuthProvider.init');
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateMockToken = (userId: string): SessionToken => {
    const now = new Date();
    const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h
    return {
      token: `mrh_sec_token_${userId}_${Date.now()}`,
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    };
  };

  const saveAuthData = (userProfile: UserProfile, token: SessionToken) => {
    setUser(userProfile);
    setSessionToken(token);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userProfile));
    localStorage.setItem(STORAGE_KEY_TOKEN, JSON.stringify(token));

    // Save/Sync User in Firestore `usuarios` collection
    saveUsuarioFirestore({
      uid: userProfile.id,
      nome: userProfile.name,
      email: userProfile.email,
      tipoUsuario: userProfile.tipoUsuario || (userProfile.role === 'Super Administrador' ? 'MASTER' : 'EMPRESA'),
      empresaId: userProfile.empresaId || userProfile.companyId || userProfile.tenantId || 't-001',
      status: 'Ativo',
      dataCriacao: new Date().toISOString().split('T')[0]
    }).catch(console.error);
  };

  const clearAuthData = () => {
    setUser(null);
    setSessionToken(null);
    setActiveModules({});
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  };

  const login = async (email: string): Promise<boolean> => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      let foundUser: UserProfile | undefined;

      if (normalizedEmail.includes('master') || normalizedEmail === MASTER_USER.email) {
        foundUser = {
          ...MASTER_USER,
          tipoUsuario: 'MASTER',
          empresaId: 'master-org'
        };
      } else {
        const demoMatch = DEMO_USERS.find(
          (u) => u.email.toLowerCase().trim() === normalizedEmail
        );
        if (demoMatch) {
          foundUser = {
            ...demoMatch,
            tipoUsuario: 'EMPRESA',
            empresaId: demoMatch.companyId || demoMatch.tenantId || 't-001'
          };
        }
      }

      if (!foundUser) {
        foundUser = {
          id: `usr-empresa-${Date.now()}`,
          name: email.split('@')[0] || 'Usuário Empresa',
          email: email,
          role: 'Administrador',
          department: 'Gente & Gestão',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          tipoUsuario: 'EMPRESA',
          empresaId: 't-001',
          companyId: 't-001',
          companyName: 'Grupo Alpha Logística S/A'
        };
      }

      const token = generateMockToken(foundUser.id);
      saveAuthData(foundUser, token);
      logger.info(`Login bem-sucedido: ${foundUser.email} (${foundUser.role})`, 'AuthContext');
      return true;
    } catch (err) {
      logCentralizedError(err, 'AuthContext.login');
      throw err;
    }
  };

  const logout = () => {
    if (user) {
      logger.info(`Logout encerrado para ${user.email}`, 'AuthContext');
    }
    clearAuthData();
  };

  const switchDemoProfile = (role: RoleProfile) => {
    let targetUser: UserProfile;
    if (role === 'Super Administrador') {
      targetUser = {
        ...MASTER_USER,
        tipoUsuario: 'MASTER',
        empresaId: 'master-org'
      };
    } else {
      const match = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];
      targetUser = {
        ...match,
        tipoUsuario: 'EMPRESA',
        empresaId: match.companyId || match.tenantId || 't-001'
      };
    }
    const token = generateMockToken(targetUser.id);
    saveAuthData(targetUser, token);
    logger.info(`Alternado para perfil de demonstração: ${targetUser.role}`, 'AuthContext');
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    logger.info(`Solicitação de recuperação de senha enviada para: ${email}`, 'AuthContext');
    return new Promise((resolve) => setTimeout(() => resolve(true), 800));
  };

  const hasScreenAccess = (screenKey: ScreenRouteKey): boolean => {
    if (!user) return false;
    return true;
  };

  const hasActionAccess = (actionKey: SystemActionKey): boolean => {
    if (!user) return false;
    return true;
  };

  const isModuleActive = (moduleKey: string): boolean => {
    if (!user) return false;
    if (user.role === 'Super Administrador' || user.tipoUsuario === 'MASTER') {
      return true;
    }

    // Direct match in activeModules
    if (activeModules[moduleKey] === true) return true;

    // Aliases
    if ((moduleKey === 'recrutamento' || moduleKey === 'vagas' || moduleKey === 'bancoTalentos' || moduleKey === 'entrevistas') &&
        (activeModules['recrutamento'] || activeModules['vagas'] || activeModules['bancoTalentos'])) {
      return true;
    }

    if ((moduleKey === 'dp' || moduleKey === 'equipeInterna') && (activeModules['dp'] || activeModules['equipeInterna'])) {
      return true;
    }

    if ((moduleKey === 'beneficios' || moduleKey === 'feriasBeneficios') && (activeModules['beneficios'] || activeModules['feriasBeneficios'])) {
      return true;
    }

    if ((moduleKey === 'documentos' || moduleKey === 'documentosAssinatura') && (activeModules['documentos'] || activeModules['documentosAssinatura'])) {
      return true;
    }

    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        sessionToken,
        isAuthenticated: !!user && !!sessionToken,
        isLoading,
        activeModules,
        login,
        logout,
        switchDemoProfile,
        requestPasswordReset,
        hasScreenAccess,
        hasActionAccess,
        isModuleActive,
        refreshCompanyModules
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um <AuthProvider>');
  }
  return context;
};
