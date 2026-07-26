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
  title: string;
  department: string;
  location: string;
  locationType: JobLocationType;
  type: JobType;
  status: JobStatus;
  salaryRange: string;
  openings: number;
  applicantsCount: number;
  createdAt: string;
  deadline: string;
  description: string;
  requirements: string[];
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
