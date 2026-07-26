export type JobStatus = 'Aberta' | 'Pausada' | 'Fechada' | 'Rascunho';
export type JobType = 'CLT' | 'PJ' | 'Estágio' | 'Temporário';
export type JobLocationType = 'Presencial' | 'Remoto' | 'Híbrido';

export type StageId = 'inscritos' | 'triagem' | 'entrevista_rh' | 'teste_tecnico' | 'entrevista_gestor' | 'proposta' | 'contratado';

export interface Stage {
  id: StageId;
  name: string;
  color: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  location: string;
  experienceYears: number;
  skills: string[];
  status: 'Ativo' | 'Em Processo' | 'Contratado' | 'Indisponível';
  currentJobId?: string;
  currentStageId?: StageId;
  rating: number; // 1 to 5
  notes: string;
  avatar: string;
  appliedDate: string;
  source: 'LinkedIn' | 'Indicação' | 'Site Institucional' | 'Gupy' | 'Outro';
  resumeUrl?: string;
  salaryExpectation?: string;
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
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateRole: string;
  jobId: string;
  jobTitle: string;
  interviewerName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: 'Entrevista RH' | 'Teste Técnico' | 'Entrevista com Gestor' | 'Fit Cultural';
  status: 'Agendada' | 'Concluída' | 'Cancelada' | 'Reagendada';
  locationUrl?: string;
  notes?: string;
  feedback?: {
    rating: number;
    strengths: string;
    weaknesses: string;
    recommendation: 'Aprovar' | 'Reprovar' | 'Manter no Banco';
  };
}

export interface Department {
  id: string;
  name: string;
  manager: string;
  employeeCount: number;
  openJobsCount: number;
  budget: string;
}

export interface Recruiter {
  id: string;
  name: string;
  email: string;
  role: 'Recrutador Senior' | 'Analista de RH' | 'Gestor de Vaga' | 'BP de RH';
  department: string;
  activeProcesses: number;
  avatar: string;
}
