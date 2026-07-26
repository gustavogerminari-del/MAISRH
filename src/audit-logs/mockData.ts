import { AuditLogEntry } from './types';

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-001',
    timestamp: '2026-07-26 14:05:12',
    userName: 'Carlos Eduardo Santos',
    userEmail: 'carlos.eduardo@maisrh.com.br',
    userRole: 'Master / Administrador',
    ipAddress: '187.32.109.45',
    locationState: 'São Paulo, SP',
    moduleName: 'Equipe Interna',
    actionType: 'UPDATE',
    description: 'Aumento de comissão e alteração de papel do recrutador Thiago Oliveira para Recrutador Sênior.',
    targetEntity: 'Thiago Oliveira (ID: emp-102)',
    severity: 'INFO'
  },
  {
    id: 'log-002',
    timestamp: '2026-07-26 13:40:00',
    userName: 'Ana Paula Rocha',
    userEmail: 'ana.rocha@maisrh.com.br',
    userRole: 'Gestor de Seleção',
    ipAddress: '177.18.200.12',
    locationState: 'Campinas, SP',
    moduleName: 'Vagas',
    actionType: 'DELETE',
    description: 'Exclusão de processo seletivo inativo e limpeza de histórico de candidatos associados.',
    targetEntity: 'Vaga VAG-901 (Estágio RH)',
    severity: 'WARNING'
  },
  {
    id: 'log-003',
    timestamp: '2026-07-26 11:15:30',
    userName: 'Sistema Automático / Bot',
    userEmail: 'system@maisrh.internal',
    userRole: 'System Core',
    ipAddress: '10.0.0.1 (Servidor Interno)',
    locationState: 'Cloud Core AWS',
    moduleName: 'Planos SaaS',
    actionType: 'PERMISSION_CHANGE',
    description: 'Renovação do contrato do cliente Grupo Nexus Industrial com ativação do módulo Consultoria RH.',
    targetEntity: 'Empresa Cliente: Grupo Nexus',
    severity: 'SECURITY'
  },
  {
    id: 'log-004',
    timestamp: '2026-07-26 09:12:04',
    userName: 'Mariana Siqueira',
    userEmail: 'mariana.siqueira@maisrh.com.br',
    userRole: 'Recrutador Sênior',
    ipAddress: '189.40.88.201',
    locationState: 'São Paulo, SP',
    moduleName: 'Banco de Talentos',
    actionType: 'EXPORT',
    description: 'Download em lote de 25 currículos em formato PDF filtrados por perfil React / Node.js.',
    targetEntity: 'Exportação Banco de Talentos',
    severity: 'INFO'
  }
];
