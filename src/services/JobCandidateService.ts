import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { sanitizeFirestoreData } from '../lib/firestoreUtils';
import { AuditService } from './AuditService';

export interface InterviewData {
  id?: string;
  type: 'Presencial' | 'Online' | 'Telefone';
  date: string;
  time: string;
  interviewer: string;
  location?: string;
  meetingLink?: string;
  notes?: string;
  status?: 'Agendada' | 'Realizada' | 'Cancelada';
}

export interface EvaluationData {
  id: string;
  technicalScore: number; // 1-5
  communicationScore: number; // 1-5
  postureScore: number; // 1-5
  knowledgeScore: number; // 1-5
  notes: string;
  finalOpinion: 'Aprovado' | 'Reprovado' | 'Em Dúvida' | 'Pendente';
  evaluatedBy: string;
  evaluatedAt: string;
}

export interface AIAnalysisData {
  summary: string;
  strengths: string[];
  pointsOfAttention: string[];
  competencies: string[];
  behavioralAnalysis: string;
  interviewSuggestions: string[];
  score: number; // 0-100
  recommendation: 'Altamente Recomendado' | 'Recomendado' | 'Recomendado com Ressalvas' | 'Não Recomendado';
}

export interface HistoryEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  by?: string;
}

export type ApplicationStatus = 
  | 'Novos' 
  | 'Triagem IA' 
  | 'Em Análise RH' 
  | 'Entrevista Agendada' 
  | 'Entrevista Realizada' 
  | 'Aprovado' 
  | 'Contratado' 
  | 'Reprovado';

export interface JobCandidateApplication {
  id: string;
  companyId: string;
  jobId: string;
  candidateId: string;
  name: string;
  cpf?: string;
  photo?: string;
  email: string;
  phone: string;
  role: string;
  city: string;
  state: string;
  appliedDate: string;
  status: ApplicationStatus;
  
  // Filtering fields
  education: string;
  course?: string;
  experienceYears: number;
  salaryExpectation: string;
  availability: string;
  isPCD: boolean;
  resumeUrl?: string;
  resumeKeywords?: string[];

  // IA Compatibility
  compatibilityScore: number;
  compatibilityLevel: 'Muito compatível' | 'Compatível' | 'Baixa compatibilidade';

  // Profile details
  objective?: string;
  experiences?: { company: string; role: string; period: string; description: string }[];
  educationDetails?: { institution: string; degree: string; year: string }[];
  
  // Sub-objects
  aiAnalysis?: AIAnalysisData;
  interview?: InterviewData;
  evaluations?: EvaluationData[];
  timeline?: HistoryEvent[];
  notes?: string[];

  createdAt: string;
  updatedAt: string;
}

const COLLECTION_NAME = 'candidate_applications';

export class JobCandidateService {
  static async listAll(companyId?: string): Promise<JobCandidateApplication[]> {
    try {
      const q = (companyId && companyId !== 'master')
        ? query(collection(db, COLLECTION_NAME), where('companyId', '==', companyId))
        : collection(db, COLLECTION_NAME);
      
      const snap = await getDocs(q as any);
      if (!snap.empty) {
        const list: JobCandidateApplication[] = [];
        snap.forEach(d => list.push(d.data() as JobCandidateApplication));
        return list;
      }
    } catch (err) {
      console.warn('Erro ao buscar todas as candidaturas no Firestore:', err);
    }

    return [];
  }

  static async listByJob(jobId: string, companyId?: string): Promise<JobCandidateApplication[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('jobId', '==', jobId));
      
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list: JobCandidateApplication[] = [];
        snap.forEach(d => list.push(d.data() as JobCandidateApplication));
        return list;
      }
    } catch (err) {
      console.warn('Erro ao buscar candidaturas por vaga no Firestore:', err);
    }

    return [];
  }

  static async getById(id: string): Promise<JobCandidateApplication | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION_NAME, id));
      if (snap.exists()) {
        return snap.data() as JobCandidateApplication;
      }
    } catch (err) {
      console.warn('Erro ao buscar candidatura por ID no Firestore:', err);
    }
    return null;
  }

  static async create(appData: Partial<JobCandidateApplication> & { jobId: string; companyId?: string }): Promise<JobCandidateApplication> {
    const id = appData.id || `app-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const now = new Date().toISOString();
    const companyId = appData.companyId || 'emp-001';

    const newApp: JobCandidateApplication = {
      id,
      companyId,
      jobId: appData.jobId,
      candidateId: appData.candidateId || `cand-${Date.now()}`,
      name: appData.name || '',
      cpf: appData.cpf || '',
      photo: appData.photo || '',
      email: appData.email || '',
      phone: appData.phone || '',
      role: appData.role || '',
      city: appData.city || '',
      state: appData.state || '',
      appliedDate: appData.appliedDate || new Date().toISOString().split('T')[0],
      status: appData.status || 'Novos',
      education: appData.education || '',
      course: appData.course || '',
      experienceYears: appData.experienceYears || 0,
      salaryExpectation: appData.salaryExpectation || '',
      availability: appData.availability || '',
      isPCD: appData.isPCD || false,
      resumeUrl: appData.resumeUrl || '',
      resumeKeywords: appData.resumeKeywords || [],
      compatibilityScore: appData.compatibilityScore || 0,
      compatibilityLevel: appData.compatibilityLevel || 'Baixa compatibilidade',
      objective: appData.objective || '',
      experiences: appData.experiences || [],
      educationDetails: appData.educationDetails || [],
      aiAnalysis: appData.aiAnalysis,
      interview: appData.interview,
      evaluations: appData.evaluations || [],
      timeline: appData.timeline || [
        {
          id: `evt-${Date.now()}`,
          title: 'Candidatura Recebida',
          description: 'Candidatura registrada.',
          date: new Date().toISOString().replace('T', ' ').substring(0, 16)
        }
      ],
      notes: appData.notes || [],
      createdAt: now,
      updatedAt: now
    };

    try {
      await setDoc(doc(db, COLLECTION_NAME, id), sanitizeFirestoreData(newApp), { merge: true });
      await AuditService.log({
        action: 'CREATE',
        description: `Candidatura de ${newApp.name} criada para a vaga ${newApp.jobId}`,
        moduleName: 'Recrutamento',
        targetEntity: 'Candidatura',
        companyId
      });
    } catch (err) {
      console.warn('Erro ao salvar candidatura no Firestore:', err);
    }

    return newApp;
  }

  static async updateStatus(id: string, status: ApplicationStatus, notes?: string): Promise<void> {
    try {
      const existing = await this.getById(id);
      if (!existing) return;

      const now = new Date().toISOString();
      const updatedTimeline = [
        ...(existing.timeline || []),
        {
          id: `evt-${Date.now()}`,
          title: `Status alterado para: ${status}`,
          description: notes || `Mudança de etapa no processo seletivo para ${status}.`,
          date: now.replace('T', ' ').substring(0, 16),
          by: auth.currentUser?.displayName || 'Recrutador RH'
        }
      ];

      await setDoc(doc(db, COLLECTION_NAME, id), sanitizeFirestoreData({
        status,
        timeline: updatedTimeline,
        updatedAt: now
      }), { merge: true });

      await AuditService.log({
        action: 'UPDATE',
        description: `Status da candidatura ${id} alterado para ${status}`,
        moduleName: 'Recrutamento',
        targetEntity: 'Candidatura'
      });
    } catch (err) {
      console.warn('Erro ao atualizar status da candidatura no Firestore:', err);
    }
  }

  static async scheduleInterview(id: string, interview: InterviewData): Promise<void> {
    try {
      const existing = await this.getById(id);
      if (!existing) return;

      const now = new Date().toISOString();
      const interviewObj: InterviewData = {
        ...interview,
        status: 'Agendada'
      };

      const updatedTimeline = [
        ...(existing.timeline || []),
        {
          id: `evt-${Date.now()}`,
          title: 'Entrevista Agendada',
          description: `Entrevista ${interview.type} agendada para ${interview.date} às ${interview.time} com ${interview.interviewer}.`,
          date: now.replace('T', ' ').substring(0, 16),
          by: auth.currentUser?.displayName || 'Recrutador RH'
        }
      ];

      await setDoc(doc(db, COLLECTION_NAME, id), sanitizeFirestoreData({
        status: 'Entrevista Agendada',
        interview: interviewObj,
        timeline: updatedTimeline,
        updatedAt: now
      }), { merge: true });

      await AuditService.log({
        action: 'UPDATE',
        description: `Entrevista agendada para o candidato ${existing.name}`,
        moduleName: 'Recrutamento',
        targetEntity: 'Entrevista'
      });
    } catch (err) {
      console.warn('Erro ao agendar entrevista no Firestore:', err);
    }
  }

  static async addEvaluation(id: string, evaluation: Omit<EvaluationData, 'id' | 'evaluatedAt' | 'evaluatedBy'>): Promise<void> {
    try {
      const existing = await this.getById(id);
      if (!existing) return;

      const user = auth.currentUser;
      const now = new Date().toISOString();
      const evalObj: EvaluationData = {
        ...evaluation,
        id: `eval-${Date.now()}`,
        evaluatedBy: user?.displayName || 'Avaliador RH',
        evaluatedAt: now.replace('T', ' ').substring(0, 16)
      };

      const updatedEvaluations = [...(existing.evaluations || []), evalObj];
      const updatedTimeline = [
        ...(existing.timeline || []),
        {
          id: `evt-${Date.now()}`,
          title: 'Avaliação Registrada',
          description: `Parecer final: ${evaluation.finalOpinion}. Obs: ${evaluation.notes || 'Sem observações'}.`,
          date: now.replace('T', ' ').substring(0, 16),
          by: user?.displayName || 'Avaliador RH'
        }
      ];

      await setDoc(doc(db, COLLECTION_NAME, id), sanitizeFirestoreData({
        evaluations: updatedEvaluations,
        timeline: updatedTimeline,
        updatedAt: now
      }), { merge: true });

      await AuditService.log({
        action: 'UPDATE',
        description: `Nova avaliação adicionada para a candidatura ${id}`,
        moduleName: 'Recrutamento',
        targetEntity: 'Avaliação'
      });
    } catch (err) {
      console.warn('Erro ao adicionar avaliação no Firestore:', err);
    }
  }

  static async addNote(id: string, note: string): Promise<void> {
    try {
      const existing = await this.getById(id);
      if (!existing) return;

      const now = new Date().toISOString();
      const formattedNote = `[${now.replace('T', ' ').substring(0, 16)}] ${auth.currentUser?.displayName || 'RH'}: ${note}`;
      const updatedNotes = [...(existing.notes || []), formattedNote];

      await setDoc(doc(db, COLLECTION_NAME, id), sanitizeFirestoreData({
        notes: updatedNotes,
        updatedAt: now
      }), { merge: true });
    } catch (err) {
      console.warn('Erro ao adicionar nota no Firestore:', err);
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      await AuditService.log({
        action: 'DELETE',
        description: `Candidatura ${id} excluída do Firestore`,
        moduleName: 'Recrutamento',
        targetEntity: 'Candidatura'
      });
    } catch (err) {
      console.warn('Erro ao excluir candidatura no Firestore:', err);
    }
  }
}
