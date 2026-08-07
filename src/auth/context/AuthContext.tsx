/**
 * Módulo AUTENTICAÇÃO E ACESSO
 * Contexto de autenticação real com Firebase Auth, suporte a módulo da empresa e permissões de usuário.
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
import { PermissionService } from '../../services/PermissionService';

export interface AuthContextType {
  user: UserProfile | null;
  sessionToken: SessionToken | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeModules: Record<string, boolean>;
  userPermissions: Record<string, boolean> | string[];
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
    {}
  );
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sessionToken, setSessionToken] = useState<SessionToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModules, setActiveModules] = useState<Record<string, boolean>>({});

  const userPermissions = (user as any)?.permissions || (user as any)?.permissoes || {};

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
    firebaseUser: NonNullable<typeof auth.currentUser>
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
        permissions: profileDoc.permissions || profileDoc.permissoes || undefined,
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
      permissions: profileDoc.permissions || profileDoc.permissoes || undefined,
    } as UserProfile;
  };

  const refreshCompanyModules = async () => {
    if (!auth.currentUser || !user) return;

    const targetCompanyId = user.empresaId || user.companyId || 'emp-001';

    try {
      const rawCompanyData = await fetchEmpresaModulosFirestore(targetCompanyId);
      const modulesMap = normalizeModules(rawCompanyData);
      setActiveModules(modulesMap);
    } catch (error) {
      logger.warn('[AuthContext] Falha ao carregar módulos da empresa no Firestore', error);
    }
  };

  useEffect(() => {
    const handleModuleUpdate = () => {
      refreshCompanyModules();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('company_modules_updated', handleModuleUpdate);
      window.addEventListener('storage', handleModuleUpdate);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('company_modules_updated', handleModuleUpdate);
        window.removeEventListener('storage', handleModuleUpdate);
      }
    };
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);

      if (!firebaseUser) {
        clearAuthData();
        setIsLoading(false);
        return;
      }

      try {
        const userProfile = await buildUserProfile(firebaseUser);
        const token = createSessionToken(firebaseUser.uid);
        saveAuthData(userProfile, token);

        if (!isMasterProfile(userProfile)) {
          const targetCompanyId = userProfile.empresaId || userProfile.companyId;
          if (targetCompanyId) {
            const rawCompanyData = await fetchEmpresaModulosFirestore(targetCompanyId);
            const modulesMap = normalizeModules(rawCompanyData);
            setActiveModules(modulesMap);
          }
        } else {
          setActiveModules({});
        }
      } catch (err: any) {
        logger.error('[AuthContext] Erro ao sincronizar sessão Firebase Auth com Firestore:', err);
        alert(err.message || 'Erro ao carregar dados do usuário. Efetue login novamente.');
        await signOut(auth);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!password) {
      alert('Senha não informada.');
      return false;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const userProfile = await buildUserProfile(userCredential.user);
      const token = createSessionToken(userCredential.user.uid);

      saveAuthData(userProfile, token);

      if (!isMasterProfile(userProfile)) {
        const targetCompanyId = userProfile.empresaId || userProfile.companyId;
        if (targetCompanyId) {
          const rawCompanyData = await fetchEmpresaModulosFirestore(targetCompanyId);
          setActiveModules(normalizeModules(rawCompanyData));
        }
      }

      logger.info('[Auth] Login efetuado com sucesso via Firebase Auth');
      return true;
    } catch (err: any) {
      logger.error('[Auth] Erro no login via Firebase Auth:', err);
      let errorMsg = 'Credenciais inválidas ou conta não encontrada.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        errorMsg = 'E-mail ou senha incorretos.';
      } else if (err.code === 'auth/user-disabled') {
        errorMsg = 'Esta conta foi desativada.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      alert(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (err) {
      logger.warn('[Auth] Erro ao deslogar do Firebase Auth:', err);
    } finally {
      clearAuthData();
    }
  };

  const switchDemoProfile = (role: RoleProfile) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      role,
      tipoUsuario: role === 'Super Administrador' ? 'MASTER' : role,
    };

    saveAuthData(updatedUser, sessionToken || createSessionToken(user.id));
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    const normalizedEmail = email.trim().toLowerCase();
    await sendPasswordResetEmail(auth, normalizedEmail);
    return true;
  };

  const isModuleActive = (moduleKey: string): boolean => {
    if (!user) return false;
    const isMaster = isMasterProfile(user);

    const check = PermissionService.checkAccess(moduleKey, {
      userRole: user.role,
      isMaster,
      companyModules: activeModules,
      userPermissions,
      userId: user.id,
      companyId: user.empresaId || user.companyId || undefined,
    });
    return check.allowed;
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

    return isModuleActive(screenKey);
  };

  const hasActionAccess = (actionKey: SystemActionKey): boolean => {
    if (!user) return false;
    if (isMasterProfile(user)) return true;
    return isModuleActive(actionKey);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        sessionToken,
        isAuthenticated: Boolean(user && auth.currentUser),
        isLoading,
        activeModules,
        userPermissions,
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
