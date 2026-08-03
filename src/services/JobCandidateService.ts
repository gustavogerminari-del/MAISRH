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
import { CandidateService } from './CandidateService';
import { RecruitmentService } from '../recruitment-core/services/recruitmentService';
import { INITIAL_CANDIDATES } from '../data/initialData';

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

export function mapCandidateToApplication(
  cand: any, 
  jobId: string, 
  companyId: string = 'emp-001',
  index: number = 0
): JobCandidateApplication {
  const scores = [92, 88, 85, 95, 82];
  const compatScore = cand.compatibilityScore || cand.matchIaPercent || scores[index % scores.length];
  
  return {
    id: `app-${jobId}-${cand.id}`,
    companyId: cand.companyId || companyId,
    jobId: jobId,
    candidateId: cand.id,
    name: cand.name || cand.nome || 'Candidato',
    cpf: cand.cpf || '123.456.789-00',
    photo: cand.avatar || cand.photo || cand.fotoUrl || '',
    email: cand.email || 'candidato@email.com',
    phone: cand.phone || cand.telefone || '(11) 99999-9999',
    role: cand.role || cand.cargoAtual || 'Profissional',
    city: cand.location ? cand.location.split('-')[0].trim() : cand.cidade || 'São Paulo',
    state: cand.location && cand.location.includes('-') ? cand.location.split('-')[1].trim() : 'SP',
    appliedDate: cand.appliedDate || new Date().toISOString().split('T')[0],
    status: (cand.currentStageId === 'triagem' ? 'Triagem IA' : cand.currentStageId === 'entrevista_rh' ? 'Em Análise RH' : cand.status || 'Novos') as ApplicationStatus,
    education: cand.education || cand.escolaridade || 'Superior Completo',
    course: cand.course || cand.curso || 'Engenharia / Administração / TI',
    experienceYears: cand.experienceYears || cand.experienciaAnos || 3,
    salaryExpectation: cand.salaryExpectation || (cand.pretensaoSalarial ? `R$ ${cand.pretensaoSalarial}` : 'R$ 7.500'),
    availability: 'Imediata',
    isPCD: cand.isPCD || cand.pcd || false,
    resumeUrl: cand.resumeUrl || cand.curriculoUrl || '',
    resumeKeywords: cand.skills || cand.competencias || ['Logística', 'Supply Chain', 'Processos'],
    compatibilityScore: compatScore,
    compatibilityLevel: compatScore >= 85 ? 'Muito compatível' : 'Compatível',
    objective: cand.objective || `Interesse na oportunidade para a vaga`,
    experiences: cand.experiences || [
      { company: 'Empresa Anterior S/A', role: cand.role || 'Analista Sênior', period: '2021 - Atual', description: 'Responsável pela execução de processos de alto desempenho.' }
    ],
    educationDetails: cand.educationDetails || [
      { institution: 'Universidade de São Paulo', degree: 'Bacharelado', year: '2020' }
    ],
    aiAnalysis: cand.aiAnalysis || {
      summary: 'Candidato de alto potencial, com boa aderência aos requisitos da vaga e perfil proativo.',
      strengths: ['Organização e processos', 'Comunicação assertiva', 'Análise técnica'],
      pointsOfAttention: ['Alinhamento prévio de expectativas'],
      competencies: cand.skills || cand.competencias || ['Logística', 'Gestão', 'Processos'],
      behavioralAnalysis: 'Demonstra postura colaborativa, excelente capacidade técnica e visão analítica.',
      interviewSuggestions: ['Perguntar sobre soluções adotadas em situações desafiadoras anteriores'],
      score: compatScore,
      recommendation: compatScore >= 85 ? 'Altamente Recomendado' : 'Recomendado'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
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

    // Fallback: Map candidates from candidate bank
    const bankCandidates = await CandidateService.list(companyId);
    return bankCandidates.map((c, i) => mapCandidateToApplication(c, c.currentJobId || 'vaga-1', companyId, i));
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

    // Fallback if no specific candidatures exist for this jobId yet:
    // Map candidates from CandidateService (talent bank) into applications for this jobId so they appear in this job's candidates view!
    const bankCandidates = await CandidateService.list(companyId);
    if (bankCandidates.length > 0) {
      return bankCandidates.map((c, i) => mapCandidateToApplication(c, jobId, companyId, i));
    }

    return INITIAL_CANDIDATES.map((c, i) => mapCandidateToApplication(c, jobId, companyId, i));
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

    // Fallback: search across mapped candidates
    const all = await this.listAll();
    const found = all.find(c => c.id === id);
    if (found) return found;

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

      const updatedApp: JobCandidateApplication = {
        ...existing,
        status,
        timeline: updatedTimeline,
        updatedAt: now
      };

      await setDoc(doc(db, COLLECTION_NAME, id), sanitizeFirestoreData(updatedApp), { merge: true });

      // Sincronizar com Banco de Talentos
      if (existing.candidateId) {
        let candStatus: 'Ativo' | 'Em Processo' | 'Contratado' | 'Indisponível' = 'Em Processo';
        if (status === 'Contratado' || status === 'Aprovado') candStatus = 'Contratado';
        else if (status === 'Reprovado') candStatus = 'Indisponível';

        await CandidateService.update(existing.candidateId, {
          status: candStatus,
          currentJobId: existing.jobId
        });
      }

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

      const updatedApp: JobCandidateApplication = {
        ...existing,
        status: 'Entrevista Agendada',
        interview: interviewObj,
        timeline: updatedTimeline,
        updatedAt: now
      };

      await setDoc(doc(db, COLLECTION_NAME, id), sanitizeFirestoreData(updatedApp), { merge: true });

      // Sincronizar com o módulo unificado de Entrevistas
      try {
        await RecruitmentService.createInterview({
          id: `int-${existing.id}`,
          empresaId: existing.companyId || 'emp-001',
          origemProcesso: 'recrutamento_interno',
          candidatoId: existing.candidateId || existing.id,
          candidatoNome: existing.name,
          candidateRole: existing.role,
          vagaId: existing.jobId,
          vagaTitulo: existing.role || 'Vaga Corporativa',
          entrevistadorNome: interview.interviewer,
          interviewerName: interview.interviewer,
          dataHora: `${interview.date}T${interview.time}:00`,
          date: interview.date,
          time: interview.time,
          tipo: interview.type === 'Presencial' ? 'Teste Técnico' : 'Entrevista RH',
          type: interview.type,
          modalidade: interview.type === 'Presencial' ? 'Presencial' : 'Online (Meet)',
          salaVirtualUrl: interview.meetingLink,
          status: 'Agendada',
          pauta: interview.notes
        });

        await RecruitmentService.createAgendaEvent({
          id: `age-${Date.now()}`,
          empresaId: existing.companyId || 'emp-001',
          origemProcesso: 'recrutamento_interno',
          tipoEvento: 'Entrevista',
          titulo: `Entrevista: ${existing.name}`,
          responsavelNome: interview.interviewer || 'Recrutador RH',
          dataHora: `${interview.date}T${interview.time}:00`,
          descricao: `Entrevista ${interview.type} agendada para a vaga ${existing.role} com ${interview.interviewer}.`,
          candidatoId: existing.candidateId || existing.id,
          candidatoNome: existing.name,
          vagaId: existing.jobId,
          vagaTitulo: existing.role || 'Vaga Corporativa',
          concluido: false
        });
      } catch (e) {
        console.warn('Erro ao sincronizar entrevista no RecruitmentService:', e);
      }

      // Sincronizar com Banco de Talentos
      if (existing.candidateId) {
        await CandidateService.update(existing.candidateId, {
          status: 'Em Processo',
          currentStageId: 'entrevista_rh'
        });
      }

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

      const updatedApp: JobCandidateApplication = {
        ...existing,
        evaluations: updatedEvaluations,
        timeline: updatedTimeline,
        updatedAt: now
      };

      await setDoc(doc(db, COLLECTION_NAME, id), sanitizeFirestoreData(updatedApp), { merge: true });

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

      const updatedApp: JobCandidateApplication = {
        ...existing,
        notes: updatedNotes,
        updatedAt: now
      };

      await setDoc(doc(db, COLLECTION_NAME, id), sanitizeFirestoreData(updatedApp), { merge: true });
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
