/**
 * Módulo AUTENTICAÇÃO E ACESSO - Perfis, Matriz de Permissões e Contas Demo
 */

import { RoleProfile, ScreenRouteKey, SystemActionKey, UserProfile } from '../types/auth';

export const MASTER_USER: UserProfile = {
  id: 'usr-master-00',
  name: 'Grupo MAIS RH (Super Admin)',
  email: 'master@maisrh.com.br',
  role: 'Super Administrador',
  department: 'Diretoria de Tecnologia & SaaS',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

const ALL_SCREENS: ScreenRouteKey[] = [
  'dashboard',
  'vagas',
  'banco-talentos',
  'entrevistas',
  'relatorios',
  'empresa',
  'equipe-interna',
  'site-vagas',
  'consultor-rh',
  'ferias-beneficios',
  'documentos',
  'auditoria',
  'planos-saas',
  'acesso-master',
  'configuracoes',
];

/**
 * Matriz de Telas Permitidas por Perfil de Acesso (Todas liberadas para Modo Demo/Tester)
 */
export const SCREEN_PERMISSIONS: Record<RoleProfile, ScreenRouteKey[]> = {
  'Super Administrador': ALL_SCREENS,
  'Administrador': ALL_SCREENS,
  'Gestor de Seleção': ALL_SCREENS,
  'Recrutador Sênior': ALL_SCREENS,
  'Analista de RH': ALL_SCREENS,
};

const ALL_ACTIONS: SystemActionKey[] = [
  'create_job',
  'edit_job',
  'close_job',
  'edit_budget',
  'approve_hire',
  'delete_candidate',
  'schedule_interview',
  'export_reports',
  'edit_settings',
  'manage_users',
];

/**
 * Matriz de Ações de System Permitidas por Perfil (Todas liberadas para Modo Demo/Tester)
 */
export const ACTION_PERMISSIONS: Record<RoleProfile, SystemActionKey[]> = {
  'Super Administrador': ALL_ACTIONS,
  'Administrador': ALL_ACTIONS,
  'Gestor de Seleção': ALL_ACTIONS,
  'Recrutador Sênior': ALL_ACTIONS,
  'Analista de RH': ALL_ACTIONS,
};

/**
 * Usuários de Exemplo Pré-cadastrados para Testes de Login e Alternância de Perfis
 */
export const DEMO_USERS: UserProfile[] = [
  {
    id: 'usr-admin-01',
    name: 'Luciana Mello',
    email: 'luciana.admin@maisrh.com.br',
    role: 'Administrador',
    department: 'Diretoria de Gente & Gestão',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-gestor-02',
    name: 'Carlos Eduardo Silva',
    email: 'carlos.gestor@maisrh.com.br',
    role: 'Gestor de Seleção',
    department: 'Gerência de Atração de Talentos',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-recrutador-03',
    name: 'Mariana Costa',
    email: 'mariana.recrutadora@maisrh.com.br',
    role: 'Recrutador Sênior',
    department: 'Recrutamento & Seleção Tech',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-analista-04',
    name: 'Roberto Andrade',
    email: 'roberto.analista@maisrh.com.br',
    role: 'Analista de RH',
    department: 'Operações de RH & Admissão',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
];
