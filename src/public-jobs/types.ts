/**
 * MÓDULO SITE PÚBLICO DE VAGAS - Contratos e Tipos TypeScript
 * MAIS RH - Sistema de Gestão de Pessoas
 */

export interface PublicJob {
  id: string;
  empresaId?: string;
  code: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  department: string;
  location: string;
  workMode: 'Presencial' | 'Híbrido' | 'Remoto';
  contractType: 'CLT' | 'PJ' | 'Estágio' | 'Temporário' | 'Executive';
  salaryRange?: string;
  description: string;
  requirements: string[];
  benefits: string[];
  publishedAt: string;
  deadline?: string;
  featured?: boolean;
}

export interface CandidateApplicationPayload {
  jobId?: string;
  fullName: string;
  email: string;
  phone: string;
  cityState: string;
  interestArea?: string;
  experienceYears?: number | string;
  educationLevel?: string;
  courses?: string;
  linkedinUrl?: string;
  resumeFileName?: string;
  resumeFile?: File;
  resumeUrl?: string;
  coverNote?: string;
  pne?: boolean;
}

export interface CompanyLeadPayload {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  companySize: string;
  selectedPlan?: string;
  message?: string;
}

export type PortalSectionTab = 
  | 'inicio' 
  | 'vagas' 
  | 'empresas' 
  | 'solucoes' 
  | 'planos' 
  | 'sobre' 
  | 'contato';

