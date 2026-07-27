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
  contractType: 'CLT' | 'PJ' | 'Estágio' | 'Temporário';
  salaryRange?: string;
  description: string;
  requirements: string[];
  benefits: string[];
  publishedAt: string;
  deadline?: string;
  featured?: boolean;
}

export interface CandidateApplicationPayload {
  jobId: string;
  fullName: string;
  email: string;
  phone: string;
  linkedinUrl?: string;
  cityState: string;
  resumeFileName: string;
  coverNote?: string;
  pne?: boolean;
}
