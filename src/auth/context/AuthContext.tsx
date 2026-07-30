/**
 * Módulo AUTENTICAÇÃO E ACESSO - Provedor de Contexto de Autenticação e Sessão com Firebase
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { UserProfile, RoleProfile, ScreenRouteKey, SystemActionKey, SessionToken } from '../types/auth';
import { MASTER_USER } from '../constants/permissions';
import { logger, logCentralizedError } from '../../core';
import { 
  saveUsuarioFirestore, 
  fetchUsuarioFirestore,
  fetchEmpresaModulosFirestore,
  seedFirestoreIfEmpty 
} from '../../lib/firestoreServices';
import { getTenants } from '../../master-admin/masterTenantsStore';
import { auth } from '../../lib/firebase';

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
  const [activeModules, setActiveModules] = useState<Record<string, boolean>>({
    recrutamento: true,
    vagas: true,
    bancoTalentos: true,
    entrevistas: true,
  });

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

    const defaultModules: Record<string, boolean> = {
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
    };

    // Super Admin / MASTER has all modules enabled by default
    if (user.role === 'Super Administrador' || user.tipoUsuario === 'MASTER') {
      setActiveModules(defaultModules);
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
    try {
      const tenants = getTenants();
      const currentTenant = tenants.find(t => t.id === empresaId) || tenants[0];
      if (currentTenant && currentTenant.modules && Object.keys(currentTenant.modules).length > 0) {
        setActiveModules(currentTenant.modules as any);
        return;
      }
    } catch (err) {
      console.warn('Erro ao carregar tenant do armazenamento local:', err);
    }

    // 3. Fallback se Firestore não retornar, empresa não existir localmente ou modules estiver vazio
    setActiveModules(defaultModules);
  };

  useEffect(() => {
    refreshCompanyModules();
  }, [user?.empresaId, user?.companyId, user?.tenantId, user?.tipoUsuario, user?.role]);

  // Inicializa sessão a partir do armazenamento local ou limpa estado
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
        // Sem sessão salva -> Usuário não autenticado por padrão
        clearAuthData();
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

    // Sync User in Firestore `usuarios` collection
    saveUsuarioFirestore({
      uid: userProfile.id,
      nome: userProfile.name,
      email: userProfile.email,
      tipoUsuario: userProfile.tipoUsuario || (userProfile.role === 'Super Administrador' ? 'MASTER' : 'EMPRESA'),
      empresaId: userProfile.empresaId || userProfile.companyId || userProfile.tenantId || 'master-org',
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

  const login = async (email: string, password?: string): Promise<boolean> => {
    const normalizedEmail = email.toLowerCase().trim();
    const pwd = password || '';

    if (!normalizedEmail) {
      throw new Error('Informe o e-mail de acesso.');
    }

    if (!pwd) {
      throw new Error('Por favor, informe a senha de acesso.');
    }

    let firebaseAuthUid: string | null = null;

    // 1. Authenticate with Firebase Authentication
    try {
      const cred = await signInWithEmailAndPassword(auth, normalizedEmail, pwd);
      firebaseAuthUid = cred.user.uid;
      logger.info(`Autenticado com sucesso no Firebase Auth: ${normalizedEmail} (UID: ${firebaseAuthUid})`, 'AuthContext');
    } catch (authErr: any) {
      const errorCode = authErr?.code || '';
      logger.error(`[Firebase Auth Error Code]: ${errorCode} | ${authErr?.message || authErr}`, 'AuthContext');

      if (errorCode === 'auth/operation-not-allowed') {
        throw new Error('O provedor de autenticação por e-mail e senha precisa ser ativado no Firebase Console.');
      } else if (errorCode.includes('api-key-not-valid') || errorCode === 'auth/invalid-api-key') {
        throw new Error('A chave de API do Firebase é inválida ou a autenticação por e-mail/senha precisa ser ativada no Firebase Console.');
      } else if (errorCode === 'auth/user-disabled') {
        throw new Error('Esta conta foi desativada pelo administrador.');
      } else if (
        errorCode === 'auth/user-not-found' || 
        errorCode === 'auth/wrong-password' || 
        errorCode === 'auth/invalid-credential'
      ) {
        throw new Error('E-mail ou senha de acesso incorretos.');
      } else if (errorCode === 'auth/too-many-requests') {
        throw new Error('Muitas tentativas de login. Tente novamente mais tarde.');
      } else if (errorCode === 'auth/network-request-failed') {
        throw new Error('Falha na conexão de rede. Verifique sua internet.');
      } else if (errorCode === 'auth/invalid-email') {
        throw new Error('O endereço de e-mail informado é inválido.');
      } else {
        throw new Error('E-mail ou senha de acesso incorretos.');
      }
    }

    // 2. Fetch User Profile from Firestore (`usuarios/{uid}`)
    let profileDoc: any = null;
    if (firebaseAuthUid) {
      profileDoc = await fetchUsuarioFirestore(firebaseAuthUid);
    }

    // Check if user account is disabled in Firestore
    if (profileDoc && (profileDoc.status === 'Inativo' || profileDoc.status === 'Bloqueado' || profileDoc.ativo === false)) {
      await signOut(auth).catch(() => {});
      clearAuthData();
      throw new Error('Esta conta foi desativada pelo administrador.');
    }

    // 3. Resolve role & tenant context
    const isMasterEmail = 
      normalizedEmail === MASTER_USER.email.toLowerCase() || 
      normalizedEmail === 'gustavo.germinari@gmail.com' ||
      normalizedEmail === 'master@maisrh.com.br' ||
      profileDoc?.tipoUsuario === 'MASTER' ||
      profileDoc?.role === 'MASTER';

    let userProfile: UserProfile;

    if (isMasterEmail) {
      userProfile = {
        ...MASTER_USER,
        id: firebaseAuthUid || MASTER_USER.id,
        email: normalizedEmail,
        tipoUsuario: 'MASTER',
        role: 'Super Administrador',
        empresaId: 'master-org',
        companyId: 'master-org',
        companyName: 'MAIS RH SaaS'
      };
    } else {
      const tenants = getTenants();
      const matchedTenant = tenants.find(t => 
        t.id === profileDoc?.empresaId ||
        t.ownerEmail?.toLowerCase() === normalizedEmail || 
        t.adminCredentials?.adminEmail?.toLowerCase() === normalizedEmail
      ) || tenants[0];

      userProfile = {
        id: firebaseAuthUid || `usr-${Date.now()}`,
        name: profileDoc?.nome || normalizedEmail.split('@')[0] || 'Usuário Corporativo',
        email: normalizedEmail,
        role: profileDoc?.role || 'Administrador',
        department: 'Gente & Gestão',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        tipoUsuario: 'EMPRESA',
        empresaId: matchedTenant?.id || profileDoc?.empresaId || 'emp-001',
        companyId: matchedTenant?.id || profileDoc?.empresaId || 'emp-001',
        companyName: matchedTenant?.companyName || 'Empresa Cliente'
      };
    }

    const token = generateMockToken(userProfile.id);
    saveAuthData(userProfile, token);
    logger.info(`Sessão iniciada com sucesso para: ${userProfile.email}`, 'AuthContext');
    return true;
  };

  const logout = () => {
    if (user) {
      logger.info(`Logout encerrado para ${user.email}`, 'AuthContext');
    }
    clearAuthData();
  };

  const switchDemoProfile = (role: RoleProfile) => {
    if (role === 'Super Administrador') {
      const token = generateMockToken(MASTER_USER.id);
      saveAuthData(MASTER_USER, token);
      logger.info(`Acesso MASTER ativado: ${MASTER_USER.email}`, 'AuthContext');
    } else {
      throw new Error('Perfis de teste foram desativados. Efetue login com suas credenciais corporativas.');
    }
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

    // Regra especial de fallback para módulos de recrutamento
    const recruitmentModules = [
      'recrutamento',
      'vagas',
      'bancoTalentos',
      'entrevistas'
    ];

    if (recruitmentModules.includes(moduleKey)) {
      const possuiConfiguracao =
        Object.prototype.hasOwnProperty.call(activeModules, 'recrutamento') ||
        Object.prototype.hasOwnProperty.call(activeModules, 'vagas') ||
        Object.prototype.hasOwnProperty.call(activeModules, 'bancoTalentos') ||
        Object.prototype.hasOwnProperty.call(activeModules, 'entrevistas');

      if (!possuiConfiguracao) {
        return true;
      }

      return (
        activeModules.recrutamento === true ||
        activeModules.vagas === true ||
        activeModules.bancoTalentos === true ||
        activeModules.entrevistas === true
      );
    }

    // Direct match in activeModules
    if (activeModules[moduleKey] === true) return true;

    if ((moduleKey === 'dp' || moduleKey === 'equipeInterna') && (activeModules['dp'] || activeModules['equipeInterna'])) {
      return true;
    }

    if ((moduleKey === 'beneficios' || moduleKey === 'feriasBeneficios') && (activeModules['beneficios'] || activeModules['feriasBeneficios'])) {
      return true;
    }

    if ((moduleKey === 'documentos' || moduleKey === 'documentosAssinatura') && (activeModules['documentos'] || activeModules['documentosAssinatura'])) {
      return true;
    }

    if ((moduleKey === 'folha' || moduleKey === 'folhaPagamento' || moduleKey === 'folha-pagamento') && (activeModules['folha'] || activeModules['folhaPagamento'] || activeModules['folha'] !== false)) {
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
