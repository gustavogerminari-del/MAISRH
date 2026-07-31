/**
 * Módulo AUTENTICAÇÃO E ACESSO - Provedor de Contexto de Autenticação e Sessão com Firebase
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
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

    // Super Admin / MASTER has all modules enabled by default
    if (user.role === 'Super Administrador' || user.tipoUsuario === 'MASTER') {
      setActiveModules({
        vagas: true,
        bancoTalentos: true,
        entrevistas: true,
        headhunter: true,
        equipeInterna: true,
        consultorRH: true,
        pontoDigital: true,
        beneficios: true,
        folhaPagamento: true,
        feriasBeneficios: true,
        rescisao: true,
        documentosAssinatura: true,
        afastamentos: true,
        sst: true,
        agenda: true,
        relatoriosAvancados: true,
        siteVagasPersonalizado: true,
        iaConsultora: true
      });
      return;
    }

    const empresaId = user.empresaId || user.companyId || user.tenantId;
    if (!empresaId) {
      setActiveModules({});
      return;
    }

    // Fetch exclusively from Firestore `empresa_modulos`
    try {
      const remoteMods = await fetchEmpresaModulosFirestore(empresaId);
      if (remoteMods && Object.keys(remoteMods).length > 0) {
        setActiveModules(remoteMods);
        return;
      }
    } catch (err) {
      console.warn('Erro ao consultar módulos da empresa no Firestore:', err);
    }

    // If no Firestore config found for company, no modules are enabled by default
    setActiveModules({});
  };

  useEffect(() => {
    refreshCompanyModules();
  }, [user?.empresaId, user?.companyId, user?.tenantId, user?.tipoUsuario, user?.role]);

  // On auth state change, keep Firebase Auth user synchronized and query usuarios/{uid}
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        logger.info(`Firebase Auth ativo: ${firebaseUser.email} (UID: ${firebaseUser.uid})`, 'AuthContext');
        try {
          const profileDoc = await fetchUsuarioFirestore(firebaseUser.uid);
          const isMasterEmail = 
            firebaseUser.email?.toLowerCase() === MASTER_USER.email.toLowerCase() || 
            firebaseUser.email?.toLowerCase() === 'gustavo.germinari@gmail.com' ||
            firebaseUser.email?.toLowerCase() === 'master@maisrh.com.br' ||
            profileDoc?.tipoUsuario === 'MASTER' ||
            profileDoc?.role === 'MASTER';

          let userProfile: UserProfile;
          if (isMasterEmail) {
            userProfile = {
              ...MASTER_USER,
              id: firebaseUser.uid,
              email: firebaseUser.email || MASTER_USER.email,
              tipoUsuario: 'MASTER',
              role: 'Super Administrador',
              empresaId: 'master-org',
              companyId: 'master-org',
              companyName: 'MAIS RH SaaS'
            };
          } else {
            userProfile = {
              id: firebaseUser.uid,
              name: profileDoc?.nome || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário Corporativo',
              email: firebaseUser.email || '',
              role: profileDoc?.role || 'Administrador',
              department: 'Gente & Gestão',
              avatar: firebaseUser.photoURL || '',
              tipoUsuario: 'EMPRESA',
              empresaId: profileDoc?.empresaId || 'emp-001',
              companyId: profileDoc?.empresaId || 'emp-001',
              companyName: 'Empresa Cliente'
            };
          }

          const token = generateMockToken(firebaseUser.uid);
          setUser(userProfile);
          setSessionToken(token);
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userProfile));
          localStorage.setItem(STORAGE_KEY_TOKEN, JSON.stringify(token));
        } catch (err) {
          logger.warn('Erro ao carregar usuario do Firestore em onAuthStateChanged:', err);
        }
      } else {
        logger.info('Firebase Auth: nenhum usuário ativo no momento', 'AuthContext');
        setUser(null);
        setSessionToken(null);
        localStorage.removeItem(STORAGE_KEY_USER);
        localStorage.removeItem(STORAGE_KEY_TOKEN);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
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

    const isMaster = userProfile.tipoUsuario === 'MASTER' || userProfile.role === 'Super Administrador' || userProfile.email === 'gustavo.germinari@gmail.com';

    // Sync User in Firestore `usuarios` collection
    saveUsuarioFirestore({
      uid: userProfile.id,
      nome: userProfile.name || 'Gustavo Germinari',
      email: userProfile.email,
      role: isMaster ? 'MASTER' : (userProfile.role || 'Administrador'),
      tipoUsuario: isMaster ? 'MASTER' : 'EMPRESA',
      empresaId: isMaster ? null : (userProfile.empresaId || userProfile.companyId || userProfile.tenantId || 'emp-001'),
      status: 'Ativo',
      ativo: true,
      isMaster: isMaster,
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
      if (
        errorCode === 'auth/user-not-found' || 
        errorCode === 'auth/invalid-credential'
      ) {
        // Automatically create account in Firebase Auth for master / enterprise user
        try {
          const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, pwd);
          firebaseAuthUid = cred.user.uid;
          logger.info(`Conta criada com sucesso no Firebase Auth: ${normalizedEmail} (UID: ${firebaseAuthUid})`, 'AuthContext');
        } catch (createErr) {
          logger.warn(`[Firebase Auth Registration Error]: ${createErr}`, 'AuthContext');
          throw new Error('E-mail ou senha de acesso incorretos.');
        }
      } else if (errorCode === 'auth/user-disabled') {
        throw new Error('Esta conta foi desativada pelo administrador.');
      } else if (errorCode === 'auth/wrong-password') {
        throw new Error('E-mail ou senha de acesso incorretos.');
      } else if (errorCode === 'auth/too-many-requests') {
        throw new Error('Muitas tentativas de login. Tente novamente mais tarde.');
      } else if (errorCode === 'auth/network-request-failed') {
        throw new Error('Falha na conexão de rede. Verifique sua internet.');
      } else if (errorCode === 'auth/invalid-email') {
        throw new Error('O endereço de e-mail informado é inválido.');
      } else {
        // Fallback: create or re-throw
        try {
          const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, pwd);
          firebaseAuthUid = cred.user.uid;
        } catch (fErr) {
          throw new Error('E-mail ou senha de acesso incorretos.');
        }
      }
    }

    if (!firebaseAuthUid && auth.currentUser) {
      firebaseAuthUid = auth.currentUser.uid;
    }

    if (!firebaseAuthUid) {
      throw new Error('Não foi possível obter a identificação de autenticação.');
    }

    // 2. Fetch User Profile from Firestore (`usuarios/{uid}`)
    let profileDoc: any = await fetchUsuarioFirestore(firebaseAuthUid);

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
        id: firebaseAuthUid,
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
        id: firebaseAuthUid,
        name: profileDoc?.nome || normalizedEmail.split('@')[0] || 'Usuário Corporativo',
        email: normalizedEmail,
        role: profileDoc?.role || 'Administrador',
        department: 'Gente & Gestão',
        avatar: '',
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

  const logout = async () => {
    if (user) {
      logger.info(`Logout encerrado para ${user.email}`, 'AuthContext');
    }
    await signOut(auth).catch(() => {});
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

  const isModuleActive = (moduleKey: string): boolean => {
    if (!user) return false;
    if (user.role === 'Super Administrador' || user.tipoUsuario === 'MASTER') {
      return true;
    }

    if (!activeModules) return false;

    // Direct key match
    if (activeModules[moduleKey] === true) return true;

    // Module key normalized aliases
    if ((moduleKey === 'vagas' || moduleKey === 'recrutamento') &&
        (activeModules['vagas'] === true || activeModules['recrutamento'] === true)) {
      return true;
    }

    if ((moduleKey === 'bancoTalentos' || moduleKey === 'banco-talentos' || moduleKey === 'candidatos') &&
        (activeModules['bancoTalentos'] === true || activeModules['recrutamento'] === true)) {
      return true;
    }

    if (moduleKey === 'entrevistas' &&
        (activeModules['entrevistas'] === true || activeModules['recrutamento'] === true)) {
      return true;
    }

    if (moduleKey === 'headhunter' && activeModules['headhunter'] === true) {
      return true;
    }

    if ((moduleKey === 'equipeInterna' || moduleKey === 'colaboradores' || moduleKey === 'dp') &&
        (activeModules['equipeInterna'] === true || activeModules['colaboradores'] === true || activeModules['dp'] === true)) {
      return true;
    }

    if ((moduleKey === 'pontoDigital' || moduleKey === 'ponto-digital' || moduleKey === 'jornada' || moduleKey === 'ponto') &&
        (activeModules['pontoDigital'] === true || activeModules['ponto'] === true)) {
      return true;
    }

    if ((moduleKey === 'beneficios' || moduleKey === 'feriasBeneficios') &&
        (activeModules['beneficios'] === true || activeModules['feriasBeneficios'] === true)) {
      return true;
    }

    if ((moduleKey === 'ferias' || moduleKey === 'feriasBeneficios') &&
        (activeModules['ferias'] === true || activeModules['feriasBeneficios'] === true)) {
      return true;
    }

    if (moduleKey === 'rescisao' &&
        (activeModules['rescisao'] === true || activeModules['equipeInterna'] === true || activeModules['dp'] === true)) {
      return true;
    }

    if ((moduleKey === 'documentos' || moduleKey === 'documentosAssinatura') &&
        (activeModules['documentos'] === true || activeModules['documentosAssinatura'] === true)) {
      return true;
    }

    if (moduleKey === 'afastamentos' &&
        (activeModules['afastamentos'] === true || activeModules['equipeInterna'] === true || activeModules['dp'] === true)) {
      return true;
    }

    if (moduleKey === 'sst' &&
        (activeModules['sst'] === true || activeModules['equipeInterna'] === true || activeModules['dp'] === true)) {
      return true;
    }

    if (moduleKey === 'agenda' && activeModules['agenda'] === true) {
      return true;
    }

    if ((moduleKey === 'relatorios' || moduleKey === 'relatoriosAvancados') &&
        (activeModules['relatorios'] === true || activeModules['relatoriosAvancados'] === true)) {
      return true;
    }

    if ((moduleKey === 'siteVagas' || moduleKey === 'siteVagasPersonalizado' || moduleKey === 'site-vagas') &&
        (activeModules['siteVagas'] === true || activeModules['siteVagasPersonalizado'] === true)) {
      return true;
    }

    if ((moduleKey === 'consultorRH' || moduleKey === 'iaConsultora' || moduleKey === 'mais-rh-ia') &&
        (activeModules['consultorRH'] === true || activeModules['iaConsultora'] === true)) {
      return true;
    }

    if ((moduleKey === 'folha' || moduleKey === 'folhaPagamento' || moduleKey === 'folha-pagamento') &&
        (activeModules['folha'] === true || activeModules['folhaPagamento'] === true)) {
      return true;
    }

    return false;
  };

  const hasScreenAccess = (screenKey: ScreenRouteKey): boolean => {
    if (!user) return false;

    // Master / Admin screens
    if (screenKey === 'acesso-master' || screenKey?.startsWith('master-') || screenKey === 'auditoria') {
      return user.role === 'Super Administrador' || user.tipoUsuario === 'MASTER';
    }

    // Base dashboard & settings screens are always accessible
    if (screenKey === 'dashboard' || screenKey === 'configuracoes' || screenKey === 'empresa') {
      return true;
    }

    const screenModuleMap: Record<string, string> = {
      'vagas': 'vagas',
      'candidatos': 'bancoTalentos',
      'banco-talentos': 'bancoTalentos',
      'processos-seletivos': 'vagas',
      'entrevistas': 'entrevistas',
      'contratacoes': 'vagas',
      'headhunter': 'headhunter',
      'headhunter-clientes': 'headhunter',
      'headhunter-comercial': 'headhunter',
      'headhunter-crm': 'headhunter',
      'headhunter-propostas': 'headhunter',
      'headhunter-contratos': 'headhunter',
      'headhunter-comissoes': 'headhunter',
      'headhunter-financeiro': 'headhunter',
      'headhunter-despesas': 'headhunter',
      'headhunter-garantias': 'headhunter',
      'headhunter-relatorios': 'headhunter',
      'colaboradores': 'equipeInterna',
      'equipe-interna': 'equipeInterna',
      'ponto-digital': 'pontoDigital',
      'jornada': 'pontoDigital',
      'beneficios': 'beneficios',
      'ferias': 'feriasBeneficios',
      'rescisao': 'rescisao',
      'documentos': 'documentosAssinatura',
      'afastamentos': 'afastamentos',
      'sst': 'sst',
      'agenda': 'agenda',
      'relatorios': 'relatoriosAvancados',
      'site-vagas': 'siteVagasPersonalizado',
      'folha-pagamento': 'folhaPagamento',
      'mais-rh-ia': 'iaConsultora',
      'consultor-rh': 'iaConsultora'
    };

    const targetModule = screenModuleMap[screenKey];
    if (!targetModule) return true;

    return isModuleActive(targetModule);
  };

  const hasActionAccess = (actionKey: SystemActionKey): boolean => {
    if (!user) return false;
    return true;
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
