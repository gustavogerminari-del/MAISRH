/**
 * Módulo AUTENTICAÇÃO E ACESSO - Tipos e Contratos de Segurança
 * Depende exclusivamente do Módulo NÚCLEO.
 */

export type RoleProfile = 
  | 'Super Administrador'
  | 'Administrador'
  | 'Gestor de Seleção'
  | 'Recrutador Sênior'
  | 'Analista de RH';

export type ScreenRouteKey =
  | 'dashboard'
  | 'vagas'
  | 'banco-talentos'
  | 'entrevistas'
  | 'relatorios'
  | 'empresa'
  | 'equipe-interna'
  | 'site-vagas'
  | 'consultor-rh'
  | 'ferias-beneficios'
  | 'documentos'
  | 'auditoria'
  | 'planos-saas'
  | 'acesso-master'
  | 'configuracoes';

export type SystemActionKey =
  | 'create_job'
  | 'edit_job'
  | 'close_job'
  | 'edit_budget'
  | 'approve_hire'
  | 'delete_candidate'
  | 'schedule_interview'
  | 'export_reports'
  | 'edit_settings'
  | 'manage_users';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: RoleProfile;
  department: string;
  avatar: string;
  companyId?: string;
  companyName?: string;
  tenantId?: string;
  tenantName?: string;
}

export interface UserCredentials {
  email: string;
  password?: string;
}

export interface SessionToken {
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface AuthSessionData {
  user: UserProfile;
  session: SessionToken;
}
