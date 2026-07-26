/**
 * Módulo PAINEL GERAL (DASHBOARD) - Dados Fictícios Corporativos para Apresentação
 * Dados ricos e estruturados prontos para ambiente comercial.
 */

import {
  DashboardSummaryMetrics,
  DepartmentSummary,
  ResponsibleSummary,
  ProcessAlert,
  FunnelStepSummary,
} from '../types/dashboard';

export const INITIAL_DASHBOARD_METRICS: DashboardSummaryMetrics = {
  totalOpenJobs: 14,
  activeProcesses: 38,
  scheduledInterviews: 9,
  talentBankCandidates: 142,
  slaAvgDays: 18.5,
  offerAcceptanceRate: 92,
};

export const INITIAL_DEPARTMENTS_SUMMARY: DepartmentSummary[] = [
  {
    id: 'dept-tech',
    name: 'Tecnologia & Engenharia',
    openJobs: 6,
    activeCandidates: 18,
    managerName: 'Luciana Mello',
    budgetStatus: 'Dentro do Limite',
  },
  {
    id: 'dept-product',
    name: 'Produtos & UX Design',
    openJobs: 3,
    activeCandidates: 8,
    managerName: 'Carlos Eduardo Silva',
    budgetStatus: 'Atenção',
  },
  {
    id: 'dept-sales',
    name: 'Vendas & Expansão Commercial',
    openJobs: 3,
    activeCandidates: 7,
    managerName: 'Mariana Costa',
    budgetStatus: 'Dentro do Limite',
  },
  {
    id: 'dept-ops',
    name: 'Operações & Atendimento',
    openJobs: 2,
    activeCandidates: 5,
    managerName: 'Roberto Andrade',
    budgetStatus: 'Dentro do Limite',
  },
];

export const INITIAL_RESPONSIBLE_SUMMARY: ResponsibleSummary[] = [
  {
    id: 'resp-01',
    name: 'Mariana Costa',
    role: 'Recrutador Sênior',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    activeJobsCount: 5,
    activeCandidatesCount: 15,
    completedHiresThisMonth: 4,
  },
  {
    id: 'resp-02',
    name: 'Carlos Eduardo Silva',
    role: 'Gestor de Seleção',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    activeJobsCount: 4,
    activeCandidatesCount: 12,
    completedHiresThisMonth: 3,
  },
  {
    id: 'resp-03',
    name: 'Roberto Andrade',
    role: 'Analista de RH',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    activeJobsCount: 3,
    activeCandidatesCount: 7,
    completedHiresThisMonth: 2,
  },
  {
    id: 'resp-04',
    name: 'Luciana Mello',
    role: 'Administradora RH',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    activeJobsCount: 2,
    activeCandidatesCount: 4,
    completedHiresThisMonth: 5,
  },
];

export const INITIAL_PROCESS_ALERTS: ProcessAlert[] = [
  {
    id: 'alt-01',
    title: 'Vaga SLA Estourado: Dev React Senior',
    description: 'Processo aberto há 34 dias (SLA limite: 30 dias). Aguardando alinhamento de proposta.',
    department: 'Tecnologia & Engenharia',
    severity: 'CRITICAL',
    daysPending: 34,
    actionRequired: 'Aprovação urgente do orçamento de proposta com Gestor.',
    date: '2026-07-25',
  },
  {
    id: 'alt-02',
    title: 'Aprovação Pendente de Orçamento',
    description: 'Vaga de Product Manager aguarda validação de faixa salarial acima da tabela.',
    department: 'Produtos & UX Design',
    severity: 'WARNING',
    daysPending: 4,
    actionRequired: 'Aprovação financeira requerida pelo Administrador.',
    date: '2026-07-24',
  },
  {
    id: 'alt-03',
    title: 'Entrevista Técnica Agendada para Hoje',
    description: '3 candidatos confirmados para avaliação ao vivo com a liderança de engenharia.',
    department: 'Tecnologia & Engenharia',
    severity: 'INFO',
    daysPending: 0,
    actionRequired: 'Enviar link de videoconferência para os avaliadores.',
    date: '2026-07-26',
  },
];

export const INITIAL_FUNNEL_STEPS: FunnelStepSummary[] = [
  { stageId: 'triagem', stageName: 'Triagem Inicial', candidateCount: 18, colorClass: 'bg-indigo-500' },
  { stageId: 'entrevista_rh', stageName: 'Entrevista RH', candidateCount: 10, colorClass: 'bg-purple-500' },
  { stageId: 'teste_tecnico', stageName: 'Avaliação Técnica', candidateCount: 5, colorClass: 'bg-amber-500' },
  { stageId: 'entrevista_gestor', stageName: 'Entrevista Gestor', candidateCount: 3, colorClass: 'bg-blue-500' },
  { stageId: 'proposta', stageName: 'Proposta / Emissão', candidateCount: 2, colorClass: 'bg-emerald-500' },
];
