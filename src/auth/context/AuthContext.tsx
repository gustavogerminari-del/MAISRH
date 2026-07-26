/**
 * Módulo AUTENTICAÇÃO E ACESSO - Provedor de Contexto de Autenticação e Sessão
 * Depende do Módulo NÚCLEO e Módulo COMPARTILHADO.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, RoleProfile, ScreenRouteKey, SystemActionKey, SessionToken } from '../types/auth';
import { DEMO_USERS, SCREEN_PERMISSIONS, ACTION_PERMISSIONS, MASTER_USER } from '../constants/permissions';
import { logger, AppError, logCentralizedError } from '../../core';

export interface AuthContextType {
  user: UserProfile | null;
  sessionToken: SessionToken | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchDemoProfile: (role: RoleProfile) => void;
  requestPasswordReset: (email: string) => Promise<boolean>;
  hasScreenAccess: (screenKey: ScreenRouteKey) => boolean;
  hasActionAccess: (actionKey: SystemActionKey) => boolean;
}

const STORAGE_KEY_USER = 'MAIS_RH_AUTH_USER';
const STORAGE_KEY_TOKEN = 'MAIS_RH_AUTH_TOKEN';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sessionToken, setSessionToken] = useState<SessionToken | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Inicializa sessão a partir do armazenamento local
  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem(STORAGE_KEY_USER);
      const savedTokenStr = localStorage.getItem(STORAGE_KEY_TOKEN);

      if (savedUserStr && savedTokenStr) {
        const parsedUser: UserProfile = JSON.parse(savedUserStr);
        const parsedToken: SessionToken = JSON.parse(savedTokenStr);

        // Verifica expiração do token (1 dia de expiração)
        if (new Date(parsedToken.expiresAt) > new Date()) {
          setUser(parsedUser);
          setSessionToken(parsedToken);
          logger.info(`Sessão restaurada para usuário ${parsedUser.email}`, 'AuthContext');
        } else {
          logger.warn('Sessão expirada. Efetuando logout automático.', 'AuthContext');
          clearAuthData();
        }
      } else {
        // Inicializa por padrão com a conta do Administrador se não houver sessão gravada
        const defaultAdmin = DEMO_USERS[0];
        const token = generateMockToken(defaultAdmin.id);
        setUser(defaultAdmin);
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
  };

  const clearAuthData = () => {
    setUser(null);
    setSessionToken(null);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  };

  const login = async (email: string): Promise<boolean> => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      let foundUser: UserProfile | undefined;

      if (normalizedEmail.includes('master') || normalizedEmail === MASTER_USER.email) {
        foundUser = MASTER_USER;
      } else {
        foundUser = DEMO_USERS.find(
          (u) => u.email.toLowerCase().trim() === normalizedEmail
        );
      }

      if (!foundUser) {
        foundUser = {
          id: `usr-tester-${Date.now()}`,
          name: email.split('@')[0] || 'Usuário Tester',
          email: email,
          role: 'Administrador',
          department: 'Gente & Gestão (Tester)',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
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
      targetUser = MASTER_USER;
    } else {
      targetUser = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];
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
    // Liberado para todos os perfis durante testes/demo
    return true;
  };

  const hasActionAccess = (actionKey: SystemActionKey): boolean => {
    if (!user) return false;
    // Liberado para todos os perfis durante testes/demo
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        sessionToken,
        isAuthenticated: !!user && !!sessionToken,
        isLoading,
        login,
        logout,
        switchDemoProfile,
        requestPasswordReset,
        hasScreenAccess,
        hasActionAccess,
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
