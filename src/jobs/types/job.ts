/**
 * Módulo GESTÃO DE VAGAS - Contratos de Dados
 * Depende exclusivamente do Módulo NÚCLEO, COMPARTILHADO, AUTENTICAÇÃO e DASHBOARD.
 */

export type JobStatus = 'Aberta' | 'Pausada' | 'Fechada' | 'Arquivada' | 'Rascunho';
export type JobType = 'CLT' | 'PJ' | 'Estágio' | 'Temporário';
export type JobLocationType = 'Presencial' | 'Remoto' | 'Híbrido';

export interface JobBudgetInfo {
  approvedSalaryRange: string;
  monthlyCostLimit?: number;
  centerCostCode: string;
  isApproved: boolean;
}

export interface Job {
  id: string;
  empresaId?: string;
  nomeEmpresa?: string;
  titulo?: string;
  title: string;
  descricao?: string;
  description: string;
  requisitos?: string[];
  requirements: string[];
  cidade?: string;
  estado?: string;
  location: string;
  locationType: JobLocationType;
  salario?: string;
  salaryRange: string;
  tipoContrato?: JobType;
  type: JobType;
  beneficios?: string[];
  benefits?: string[];
  quantidadeVagas?: number;
  openings: number;
  applicantsCount: number;
  dataCriacao?: string;
  createdAt: string;
  deadline: string;
  status: JobStatus | 'ativa';
  publicada?: boolean;
  department: string;
  recruiterName: string;
  recruiterId?: string;
  managerName?: string;
  budget?: JobBudgetInfo;
  isArchived?: boolean;
}

export interface JobFilterParams {
  searchTerm: string;
  department: string;
  status: string;
  type: string;
  startDate?: string;
  endDate?: string;
  includeArchived: boolean;
}

export interface DepartmentOpenJobCount {
  departmentName: string;
  openCount: number;
  totalCount: number;
}
