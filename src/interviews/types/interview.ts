/**
 * MÓDULO ENTREVISTAS E PROCESSOS SELETIVOS - Tipos e Interfaces
 * MAIS RH - Sistema de Gestão de Pessoas
 */

export type InterviewType = 'Online (Google Meet)' | 'Online (Teams)' | 'Presencial' | 'Entrevista por Telefone';

export type InterviewStatus = 'Agendada' | 'Realizada' | 'Aprovada' | 'Reprovada' | 'Em Análise' | 'Cancelada';

export type InterviewRecommendation = 'Aprovar' | 'Reprovar' | 'Manter no Banco' | 'Avançar para Próxima Etapa';

export interface InterviewFeedback {
  rating: number; // 1 a 5
  strengths: string;
  weaknesses: string;
  recommendation: InterviewRecommendation;
  evaluatedBy?: string;
  evaluatedAt?: string;
  internalNotes?: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateAvatar?: string;
  candidateRole?: string;
  jobId: string;
  jobTitle: string;
  department?: string;
  interviewerId?: string;
  interviewerName: string;
  interviewerEmail?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes?: number;
  type: InterviewType;
  locationUrl?: string; // Link da videochamada ou endereço físico
  stageName?: string; // ex: "Entrevista Técnica", "Fit Cultural", "Entrevista com Gestor"
  status: InterviewStatus;
  feedback?: InterviewFeedback;
  notes?: string;
  reminderSent?: boolean;
  createdAt?: string;
}

export interface InterviewFilterParams {
  searchTerm?: string;
  status?: string;
  type?: string;
  jobId?: string;
  interviewerName?: string;
  dateRange?: 'Todos' | 'Hoje' | 'Esta Semana' | 'Próximos Dias';
}
