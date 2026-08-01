/**
 * Módulo AUTENTICAÇÃO E ACESSO
 * Contexto de autenticação real com Firebase Auth e módulos por empresa no Firestore.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  RoleProfile,
  ScreenRouteKey,
  SessionToken,
  SystemActionKey,
  UserProfile,
} from '../types/auth';
import { logger } from '../../core';
import {
  fetchEmpresaModulosFirestore,
  fetchUsuarioFirestore,
} from '../../lib/firestoreServices';
import { auth } from '../../lib/firebase';

export interface AuthContextType {
  user: UserProfile | null;
  sessionToken: SessionToken | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeModules: Record<string, boolean>;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
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

const normalizeRole = (value?: string | null): string =>
  String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');

const isMasterProfile = (profile: Partial<UserProfile> | null | undefined): boolean => {
  const role = normalizeRole(profile?.role);
  const tipoUsuario = normalizeRole(profile?.tipoUsuario);

  return (
    role === 'MASTER' ||
    role === 'SUPER_ADMIN' ||
    role === 'SUPER_ADMINISTRADOR' ||
    role === 'SUPER_ADMINISTRADOR' ||
    tipoUsuario === 'MASTER'
  );
};

const createSessionToken = (userId: string): SessionToken => {
  const now = new Date();
  const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return {
    token: `firebase_session_${userId}_${Date.now()}`,
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };
};

const normalizeModules = (raw: unknown): Record<string, boolean> => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};

  const source = raw as Record<string, unknown>;
  const possibleMap =
    (source.modules && typeof source.modules === 'object' ? source.modules : null) ||
    (source.modulos && typeof source.modulos === 'object' ? source.modulos : null) ||
    source;

  return Object.entries(possibleMap as Record<string, unknown>).reduce<Record<string, boolean>>(
    (acc, [key, value]) => {
      if (typeof value === 'boolean') acc[key] = value;
      return acc;
    },
    {},
  );
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sessionToken, setSessionToken] = useState<SessionToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModules, setActiveModules] = useState<Record<string, boolean>>({});

  const clearAuthData = () => {
    setUser(null);
    setSessionToken(null);
    setActiveModules({});
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem('mais_rh_master_tenants');
    localStorage.removeItem('mais_rh_platform_modules');
    localStorage.removeItem('mais_rh_subscriptions');
  };

  const saveAuthData = (userProfile: UserProfile, token: SessionToken) => {
    setUser(userProfile);
    setSessionToken(token);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userProfile));
    localStorage.setItem(STORAGE_KEY_TOKEN, JSON.stringify(token));
  };

  const buildUserProfile = async (
    firebaseUser: NonNullable<typeof auth.currentUser>,
  ): Promise<UserProfile> => {
    const profileDoc: any = await fetchUsuarioFirestore(firebaseUser.uid);

    if (!profileDoc) {
      throw new Error('Perfil do usuário não encontrado no Firestore.');
    }

    if (
      profileDoc.ativo === false ||
      normalizeRole(profileDoc.status) === 'INATIVO' ||
      normalizeRole(profileDoc.status) === 'BLOQUEADO'
    ) {
      throw new Error('Esta conta foi desativada pelo administrador.');
    }

    const role = profileDoc.role || profileDoc.tipoUsuario || '';
    const tipoUsuario = profileDoc.tipoUsuario || profileDoc.role || '';
    const master = isMasterProfile({ role, tipoUsuario } as Partial<UserProfile>);

    if (master) {
      return {
        id: firebaseUser.uid,
        name: profileDoc.nome || firebaseUser.displayName || 'Administrador Master',
        email: firebaseUser.email || profileDoc.email || '',
        role: 'Super Administrador',
        tipoUsuario: 'MASTER',
        department: profileDoc.departamento || '',
        avatar: firebaseUser.photoURL || '',
        empresaId: profileDoc.empresaId || profileDoc.companyId || null,
        companyId: profileDoc.companyId || profileDoc.empresaId || null,
        companyName: profileDoc.companyName || profileDoc.empresaNome || '',
      } as UserProfile;
    }

    const resolvedCompanyId =
      profileDoc.empresaId || profileDoc.companyId || profileDoc.tenantId || null;

    if (!resolvedCompanyId) {
      throw new Error('Usuário sem empresa vinculada no Firestore.');
    }

    return {
      id: firebaseUser.uid,
      name:
        profileDoc.nome ||
        firebaseUser.displayName ||
        firebaseUser.email?.split('@')[0] ||
        'Usuário',
      email: firebaseUser.email || profileDoc.email || '',
      role,
      tipoUsuario,
      department: profileDoc.departamento || '',
      avatar: firebaseUser.photoURL || '',
      empresaId: resolvedCompanyId,
      companyId: resolvedCompanyId,
      companyName: profileDoc.companyName || profileDoc.empresaNome || '',
    } as UserProfile;
  };

  const refreshCompanyModules = async (): Promise<void> => {
    if (!user) {
      setActiveModules({});
      return;
    }

    if (isMasterProfile(user)) {
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
        iaConsultora: true,
      });
      return;
    }

    const companyId = user.empresaId || user.companyId || user.tenantId;

    if (!companyId) {
      setActiveModules({});
      return;
    }

    try {
      const remoteModules = await fetchEmpresaModulosFirestore(companyId);
      setActiveModules(normalizeModules(remoteModules));
    } catch (error) {
      logger.warn('Erro ao carregar módulos reais da empresa no Firestore:', error);
      setActiveModules({});
    }
  };

  useEffect(() => {
    void refreshCompanyModules();
  }, [user?.empresaId, user?.companyId, user?.tenantId, user?.tipoUsuario, user?.role]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);

      if (!firebaseUser) {
        logger.info('Firebase Auth: nenhum usuário ativo no SDK cliente', 'AuthContext');
        clearAuthData();
        setIsLoading(false);
        return;
      }

      try {
        logger.info(
          `Firebase Auth ativo: ${firebaseUser.email} (UID: ${firebaseUser.uid})`,
          'AuthContext',
        );

        const userProfile = await buildUserProfile(firebaseUser);
        const token = createSessionToken(firebaseUser.uid);
        saveAuthData(userProfile, token);
      } catch (error: any) {
        logger.warn('Erro ao carregar perfil autenticado:', error?.message || error);
        await signOut(auth).catch(() => undefined);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    const normalizedEmail = email.toLowerCase().trim();
    const pwd = password || '';

    if (!normalizedEmail) throw new Error('Informe o e-mail de acesso.');
    if (!pwd) throw new Error('Informe a senha de acesso.');
    if (pwd.length < 6) throw new Error('A senha deve ter no mínimo 6 caracteres.');

    try {
      const credential = await signInWithEmailAndPassword(auth, normalizedEmail, pwd);
      const userProfile = await buildUserProfile(credential.user);
      const token = createSessionToken(credential.user.uid);
      saveAuthData(userProfile, token);

      logger.info(
        `Sessão Firebase iniciada para ${normalizedEmail} (UID: ${credential.user.uid})`,
        'AuthContext',
      );
      return true;
    } catch (error: any) {
      const code = error?.code || '';

      if (error?.message === 'Perfil do usuário não encontrado no Firestore.') {
        throw error;
      }
      if (error?.message === 'Usuário sem empresa vinculada no Firestore.') {
        throw error;
      }
      if (error?.message === 'Esta conta foi desativada pelo administrador.') {
        throw error;
      }
      if (code === 'auth/user-disabled') {
        throw new Error('Esta conta foi desativada no Firebase Authentication.');
      }
      if (
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-credential' ||
        code === 'auth/user-not-found'
      ) {
        throw new Error('E-mail ou senha incorretos.');
      }
      if (code === 'auth/too-many-requests') {
        throw new Error('Muitas tentativas de login. Aguarde e tente novamente.');
      }
      if (code === 'auth/network-request-failed') {
        throw new Error('Falha de conexão. Verifique sua internet.');
      }
      if (code === 'auth/invalid-email') {
        throw new Error('O e-mail informado é inválido.');
      }

      throw new Error(error?.message || 'Não foi possível realizar o login.');
    }
  };

  const logout = async (): Promise<void> => {
    await signOut(auth).catch(() => undefined);
    clearAuthData();
  };

  const switchDemoProfile = (_role: RoleProfile): void => {
    throw new Error('Modo de demonstração desativado. Use credenciais reais do Firebase Auth.');
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail) throw new Error('Informe o e-mail de acesso.');

    await sendPasswordResetEmail(auth, normalizedEmail);
    return true;
  };

  const isModuleActive = (moduleKey: string): boolean => {
    if (!user) return false;
    if (isMasterProfile(user)) return true;

    if (activeModules[moduleKey] === true) return true;

    const aliases: Record<string, string[]> = {
      vagas: ['vagas', 'recrutamento'],
      recrutamento: ['vagas', 'recrutamento'],
      bancoTalentos: ['bancoTalentos', 'banco-talentos', 'candidatos'],
      'banco-talentos': ['bancoTalentos', 'banco-talentos', 'candidatos'],
      candidatos: ['bancoTalentos', 'banco-talentos', 'candidatos'],
      entrevistas: ['entrevistas'],
      headhunter: ['headhunter'],
      equipeInterna: ['equipeInterna', 'colaboradores', 'dp'],
      colaboradores: ['equipeInterna', 'colaboradores', 'dp'],
      dp: ['equipeInterna', 'colaboradores', 'dp'],
      pontoDigital: ['pontoDigital', 'ponto-digital', 'ponto', 'jornada'],
      'ponto-digital': ['pontoDigital', 'ponto-digital', 'ponto', 'jornada'],
      ponto: ['pontoDigital', 'ponto-digital', 'ponto', 'jornada'],
      jornada: ['pontoDigital', 'ponto-digital', 'ponto', 'jornada'],
      beneficios: ['beneficios', 'feriasBeneficios'],
      ferias: ['ferias', 'feriasBeneficios'],
      feriasBeneficios: ['ferias', 'feriasBeneficios'],
      rescisao: ['rescisao'],
      documentos: ['documentos', 'documentosAssinatura'],
      documentosAssinatura: ['documentos', 'documentosAssinatura'],
      afastamentos: ['afastamentos'],
      sst: ['sst'],
      agenda: ['agenda'],
      relatorios: ['relatorios', 'relatoriosAvancados'],
      relatoriosAvancados: ['relatorios', 'relatoriosAvancados'],
      siteVagas: ['siteVagas', 'siteVagasPersonalizado', 'site-vagas'],
      siteVagasPersonalizado: ['siteVagas', 'siteVagasPersonalizado', 'site-vagas'],
      'site-vagas': ['siteVagas', 'siteVagasPersonalizado', 'site-vagas'],
      consultorRH: ['consultorRH', 'iaConsultora', 'mais-rh-ia'],
      iaConsultora: ['consultorRH', 'iaConsultora', 'mais-rh-ia'],
      'mais-rh-ia': ['consultorRH', 'iaConsultora', 'mais-rh-ia'],
      folha: ['folha', 'folhaPagamento', 'folha-pagamento'],
      folhaPagamento: ['folha', 'folhaPagamento', 'folha-pagamento'],
      'folha-pagamento': ['folha', 'folhaPagamento', 'folha-pagamento'],
    };

    return (aliases[moduleKey] || [moduleKey]).some((key) => activeModules[key] === true);
  };

  const hasScreenAccess = (screenKey: ScreenRouteKey): boolean => {
    if (!user) return false;

    if (
      screenKey === 'acesso-master' ||
      screenKey?.startsWith('master-') ||
      screenKey === 'auditoria'
    ) {
      return isMasterProfile(user);
    }

    if (screenKey === 'dashboard' || screenKey === 'configuracoes' || screenKey === 'empresa') {
      return true;
    }

    const screenModuleMap: Record<string, string> = {
      vagas: 'vagas',
      candidatos: 'bancoTalentos',
      'banco-talentos': 'bancoTalentos',
      'processos-seletivos': 'vagas',
      entrevistas: 'entrevistas',
      contratacoes: 'vagas',
      headhunter: 'headhunter',
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
      colaboradores: 'equipeInterna',
      'equipe-interna': 'equipeInterna',
      'ponto-digital': 'pontoDigital',
      jornada: 'pontoDigital',
      beneficios: 'beneficios',
      ferias: 'feriasBeneficios',
      rescisao: 'rescisao',
      documentos: 'documentosAssinatura',
      afastamentos: 'afastamentos',
      sst: 'sst',
      agenda: 'agenda',
      relatorios: 'relatoriosAvancados',
      'site-vagas': 'siteVagasPersonalizado',
      'folha-pagamento': 'folhaPagamento',
      'mais-rh-ia': 'iaConsultora',
      'consultor-rh': 'iaConsultora',
    };

    const requiredModule = screenModuleMap[screenKey];
    return requiredModule ? isModuleActive(requiredModule) : true;
  };

  const hasActionAccess = (_actionKey: SystemActionKey): boolean => Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        sessionToken,
        isAuthenticated: Boolean(user && auth.currentUser),
        isLoading,
        activeModules,
        login,
        logout,
        switchDemoProfile,
        requestPasswordReset,
        hasScreenAccess,
        hasActionAccess,
        isModuleActive,
        refreshCompanyModules,
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