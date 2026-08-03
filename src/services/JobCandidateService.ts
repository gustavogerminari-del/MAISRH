import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where,
  onSnapshot 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { sanitizeFirestoreData } from '../lib/firestoreUtils';
import { AuditService } from './AuditService';
import { CandidateService } from './CandidateService';
import { enviarCandidatoParaAdmissaoDP } from '../departamento-pessoal/services/dpFirestoreService';

export interface InterviewData {
  id?: string;
  type: 'Presencial' | 'Online' | 'Telefone';
  date: string;
  time: string;
  interviewer: string;
  location?: string;
  meetingLink?: string;
  notes?: string;
  status?: 'Agendada' | 'Reagendada' | 'Realizada' | 'Cancelada';
}

export interface EvaluationData {
  id: string;
  technicalScore: number; // 1-5
  communicationScore: number; // 1-5
  postureScore: number; // 1-5
  knowledgeScore: number; // 1-5
  overallScore?: number; // 1-5
  parecerRH?: string;
  notes: string;
  competencies?: string[];
  strengths?: string[];
  improvements?: string[];
  aiOpinion?: string;
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
  
  // Rejection details
  motivoReprovacao?: string;
  observacaoReprovacao?: string;
  manterBancoTalentos?: boolean;
  reprovadoEm?: string;

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
    if (!companyId) return [];

    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('companyId', '==', companyId)
      );
      
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({
          ...(d.data() as JobCandidateApplication),
          id: d.id
        }));
      }
    } catch (err) {
      console.error('Erro ao buscar candidaturas no Firestore:', err);
      throw err;
    }

    return [];
  }

  static async listByJob(jobId: string, companyId?: string): Promise<JobCandidateApplication[]> {
    if (!jobId || !companyId) return [];

    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('companyId', '==', companyId),
        where('jobId', '==', jobId)
      );
      
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({
          ...(d.data() as JobCandidateApplication),
          id: d.id
        }));
      }
    } catch (err) {
      console.error('Erro ao buscar candidaturas por vaga no Firestore:', err);
      throw err;
    }

    return [];
  }

  static subscribeByJob(
    jobId: string,
    companyId: string | undefined,
    onUpdate: (apps: JobCandidateApplication[]) => void,
    onError?: (err: any) => void
  ): () => void {
    if (!jobId || !companyId) {
      onUpdate([]);
      return () => {};
    }

    const q = query(
      collection(db, COLLECTION_NAME),
      where('companyId', '==', companyId),
      where('jobId', '==', jobId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const list: JobCandidateApplication[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as JobCandidateApplication;
          list.push({
            ...data,
            id: d.id
          });
        });
        onUpdate(list);
      },
      (err) => {
        console.error('Erro na assinatura em tempo real de candidaturas da vaga:', err);
        if (onError) onError(err);
        else onUpdate([]);
      }
    );
  }

  static async getById(id: string): Promise<JobCandidateApplication | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION_NAME, id));
      if (snap.exists()) {
        return {
          ...(snap.data() as JobCandidateApplication),
          id: snap.id
        };
      }
    } catch (err) {
      console.error('Erro ao buscar candidatura por ID no Firestore:', err);
      throw err;
    }

    return null;
  }

  static async create(appData: Partial<JobCandidateApplication> & { jobId: string; companyId: string }): Promise<JobCandidateApplication> {
    if (!appData.companyId) {
      throw new Error('companyId é obrigatório para registrar uma candidatura.');
    }

    const id = appData.id || `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newApp: JobCandidateApplication = {
      id,
      companyId: appData.companyId,
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
      compatibilityScore: appData.compatibilityScore || 85,
      compatibilityLevel: appData.compatibilityLevel || 'Compatível',
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
        companyId: appData.companyId
      });
    } catch (err) {
      console.error('Erro ao salvar candidatura no Firestore:', err);
      throw err;
    }

    return newApp;
  }

  static async updateStatus(id: string, status: ApplicationStatus, notes?: string): Promise<void> {
    try {
      const existing = await this.getById(id);
      if (!existing) throw new Error('Candidatura não encontrada.');

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
        targetEntity: 'Candidatura',
        companyId: existing.companyId
      });
    } catch (err) {
      console.error('Erro ao atualizar status da candidatura no Firestore:', err);
      throw err;
    }
  }

  static async hireCandidate(candidate: JobCandidateApplication, jobTitle?: string): Promise<void> {
    if (!candidate || !candidate.id) throw new Error('Dados da candidatura inválidos.');

    try {
      const now = new Date().toISOString();
      const titleToUse = jobTitle || candidate.role || 'Vaga Corporativa';

      // 1. Atualizar candidatura em candidate_applications
      const updatedTimeline = [
        ...(candidate.timeline || []),
        {
          id: `evt-${Date.now()}`,
          title: 'Candidato Contratado',
          description: `Candidato(a) aprovado(a) e contratado(a) para a vaga ${titleToUse}. Encaminhado para a fila de admissão DP.`,
          date: now.replace('T', ' ').substring(0, 16),
          by: auth.currentUser?.displayName || 'Recrutador RH'
        }
      ];

      const updatedApp: JobCandidateApplication = {
        ...candidate,
        status: 'Contratado',
        timeline: updatedTimeline,
        updatedAt: now
      };

      await setDoc(doc(db, COLLECTION_NAME, candidate.id), sanitizeFirestoreData(updatedApp), { merge: true });

      // 2. Atualizar perfil em candidatos se existir
      if (candidate.candidateId) {
        try {
          await CandidateService.update(candidate.candidateId, {
            status: 'Contratado',
            currentJobId: candidate.jobId,
            currentStageId: 'contratado'
          });
        } catch (e) {
          console.warn('Aviso ao atualizar perfil no Banco de Talentos:', e);
        }
      }

      // 3. Criar registro em contratacoes
      const contratacaoId = `${candidate.jobId}_${candidate.candidateId || candidate.id}`;
      const contratacaoDoc = {
        id: contratacaoId,
        companyId: candidate.companyId,
        empresaId: candidate.companyId,
        jobId: candidate.jobId,
        vagaId: candidate.jobId,
        candidateId: candidate.candidateId || candidate.id,
        candidatoId: candidate.candidateId || candidate.id,
        candidaturaId: candidate.id,
        candidateName: candidate.name,
        candidatoNome: candidate.name,
        jobTitle: titleToUse,
        vagaTitulo: titleToUse,
        status: 'Concluído',
        createdAt: now,
        updatedAt: now
      };
      await setDoc(doc(db, 'contratacoes', contratacaoId), sanitizeFirestoreData(contratacaoDoc), { merge: true });

      // 4. Enviar para Admissão DP
      await enviarCandidatoParaAdmissaoDP({
        id: candidate.id,
        candidateId: candidate.candidateId || candidate.id,
        jobId: candidate.jobId,
        companyId: candidate.companyId,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        cpf: candidate.cpf,
        role: titleToUse,
        vagaTitulo: titleToUse,
        department: (candidate as any).department,
        salaryExpectation: candidate.salaryExpectation,
        city: candidate.city,
        state: candidate.state
      });

      // 5. Log de auditoria
      await AuditService.log({
        action: 'UPDATE',
        description: `Candidato ${candidate.name} contratado para a vaga ${titleToUse}`,
        moduleName: 'Recrutamento',
        targetEntity: 'Contratação',
        companyId: candidate.companyId
      });
    } catch (err) {
      console.error('Erro ao processar contratação:', err);
      throw err;
    }
  }

  static async rejectCandidate(
    candidateId: string, 
    data: {
      motivoReprovacao: string;
      observacaoReprovacao?: string;
      manterBancoTalentos: boolean;
    }
  ): Promise<void> {
    if (!candidateId) throw new Error('ID do candidato inválido.');

    try {
      const existing = await this.getById(candidateId);
      if (!existing) throw new Error('Candidatura não encontrada.');

      const now = new Date().toISOString();
      const updatedTimeline = [
        ...(existing.timeline || []),
        {
          id: `evt-${Date.now()}`,
          title: 'Candidatura Reprovada',
          description: `Motivo: ${data.motivoReprovacao}.${data.observacaoReprovacao ? ` Obs: ${data.observacaoReprovacao}` : ''}`,
          date: now.replace('T', ' ').substring(0, 16),
          by: auth.currentUser?.displayName || 'Recrutador RH'
        }
      ];

      const updatedApp = {
        ...existing,
        status: 'Reprovado' as ApplicationStatus,
        motivoReprovacao: data.motivoReprovacao,
        observacaoReprovacao: data.observacaoReprovacao || '',
        manterBancoTalentos: data.manterBancoTalentos,
        reprovadoEm: now,
        timeline: updatedTimeline,
        updatedAt: now
      };

      await setDoc(doc(db, COLLECTION_NAME, candidateId), sanitizeFirestoreData(updatedApp), { merge: true });

      // Atualizar no Banco de Talentos
      if (existing.candidateId) {
        try {
          await CandidateService.update(existing.candidateId, {
            status: data.manterBancoTalentos ? 'Ativo' : 'Indisponível'
          });
        } catch (e) {
          console.warn('Aviso ao atualizar perfil no Banco de Talentos:', e);
        }
      }

      await AuditService.log({
        action: 'UPDATE',
        description: `Candidato ${existing.name} reprovado na vaga ${existing.jobId}. Motivo: ${data.motivoReprovacao}`,
        moduleName: 'Recrutamento',
        targetEntity: 'Candidatura',
        companyId: existing.companyId
      });
    } catch (err) {
      console.error('Erro ao reprovar candidato:', err);
      throw err;
    }
  }

  static async updateInterview(id: string, interview: InterviewData, jobTitle?: string): Promise<void> {
    try {
      const existing = await this.getById(id);
      if (!existing) throw new Error('Candidatura não encontrada.');

      const now = new Date().toISOString();
      const titleToUse = jobTitle || existing.role || 'Vaga Corporativa';
      
      const isNew = !existing.interview;
      const statusToSet = interview.status || (isNew ? 'Agendada' : 'Reagendada');

      const interviewObj: InterviewData = {
        ...interview,
        id: interview.id || existing.interview?.id || `int-${id}`,
        status: statusToSet
      };

      const timelineTitle = isNew 
        ? 'Entrevista Agendada' 
        : statusToSet === 'Reagendada' 
          ? 'Entrevista Reagendada' 
          : statusToSet === 'Cancelada' 
            ? 'Entrevista Cancelada' 
            : statusToSet === 'Realizada' 
              ? 'Entrevista Realizada' 
              : 'Entrevista Atualizada';

      const updatedTimeline = [
        ...(existing.timeline || []),
        {
          id: `evt-${Date.now()}`,
          title: timelineTitle,
          description: `Entrevista ${interview.type} ${isNew ? 'agendada' : 'atualizada'} para ${interview.date} às ${interview.time} com ${interview.interviewer}. Status: ${statusToSet}.`,
          date: now.replace('T', ' ').substring(0, 16),
          by: auth.currentUser?.displayName || 'Recrutador RH'
        }
      ];

      let appStatus: ApplicationStatus = existing.status;
      if (statusToSet === 'Realizada') {
        appStatus = 'Entrevista Realizada';
      } else if (statusToSet === 'Agendada' || statusToSet === 'Reagendada') {
        appStatus = 'Entrevista Agendada';
      }

      const updatedApp: JobCandidateApplication = {
        ...existing,
        status: appStatus,
        interview: interviewObj,
        timeline: updatedTimeline,
        updatedAt: now
      };

      await setDoc(doc(db, COLLECTION_NAME, id), sanitizeFirestoreData(updatedApp), { merge: true });

      // 1. Atualizar ou criar documento na coleção 'entrevistas'
      let interviewDocId = interview.id || existing.interview?.id;

      if (!interviewDocId) {
        try {
          const qInt = query(
            collection(db, 'entrevistas'),
            where('jobId', '==', existing.jobId),
            where('candidateId', '==', existing.candidateId || existing.id)
          );
          const snap = await getDocs(qInt);
          if (!snap.empty) {
            interviewDocId = snap.docs[0].id;
          }
        } catch (e) {
          console.warn('Busca de entrevista existente no Firestore falhou:', e);
        }
      }

      if (!interviewDocId) {
        interviewDocId = `int-${id}-${Date.now()}`;
      }

      const interviewDoc = {
        id: interviewDocId,
        companyId: existing.companyId,
        empresaId: existing.companyId,
        candidateId: existing.candidateId || existing.id,
        candidatoId: existing.candidateId || existing.id,
        applicationId: existing.id,
        candidateName: existing.name,
        candidatoNome: existing.name,
        jobId: existing.jobId,
        vagaId: existing.jobId,
        jobTitle: titleToUse,
        vagaTitulo: titleToUse,
        date: interview.date,
        time: interview.time,
        interviewer: interview.interviewer,
        modalidade: interview.type,
        location: interview.location || '',
        meetingLink: interview.meetingLink || '',
        notes: interview.notes || '',
        status: statusToSet,
        createdAt: now,
        updatedAt: now
      };
      await setDoc(doc(db, 'entrevistas', interviewDocId), sanitizeFirestoreData(interviewDoc), { merge: true });

      // 2. Atualizar ou criar documento na coleção 'agenda'
      let agendaDocId = `age-${id}`;
      try {
        const qAge = query(
          collection(db, 'agenda'),
          where('jobId', '==', existing.jobId),
          where('candidateId', '==', existing.candidateId || existing.id)
        );
        const snapAge = await getDocs(qAge);
        if (!snapAge.empty) {
          agendaDocId = snapAge.docs[0].id;
        }
      } catch (e) {
        console.warn('Busca na agenda no Firestore falhou:', e);
      }

      const agendaDoc = {
        id: agendaDocId,
        companyId: existing.companyId,
        empresaId: existing.companyId,
        title: `Entrevista (${statusToSet}): ${existing.name} - ${titleToUse}`,
        date: interview.date,
        time: interview.time,
        type: 'Entrevista',
        candidateId: existing.candidateId || existing.id,
        jobId: existing.jobId,
        applicationId: existing.id,
        interviewer: interview.interviewer,
        notes: interview.notes || '',
        status: statusToSet,
        updatedAt: now
      };
      await setDoc(doc(db, 'agenda', agendaDocId), sanitizeFirestoreData(agendaDoc), { merge: true });

      // 3. Atualizar perfil do candidato
      if (existing.candidateId) {
        try {
          await CandidateService.update(existing.candidateId, {
            status: 'Em Processo',
            currentStageId: 'entrevista_rh'
          });
        } catch (e) {
          console.warn('Aviso ao atualizar perfil no Banco de Talentos:', e);
        }
      }

      await AuditService.log({
        action: 'UPDATE',
        description: `Entrevista ${isNew ? 'agendada' : 'atualizada'} para o candidato ${existing.name}`,
        moduleName: 'Recrutamento',
        targetEntity: 'Entrevista',
        companyId: existing.companyId
      });
    } catch (err) {
      console.error('Erro ao agendar/editar entrevista no Firestore:', err);
      throw err;
    }
  }

  static async scheduleInterview(id: string, interview: InterviewData, jobTitle?: string): Promise<void> {
    return this.updateInterview(id, interview, jobTitle);
  }

  static async addEvaluation(id: string, evaluation: Omit<EvaluationData, 'id' | 'evaluatedAt' | 'evaluatedBy'>): Promise<void> {
    try {
      const existing = await this.getById(id);
      if (!existing) throw new Error('Candidatura não encontrada.');

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
        targetEntity: 'Avaliação',
        companyId: existing.companyId
      });
    } catch (err) {
      console.error('Erro ao adicionar avaliação no Firestore:', err);
      throw err;
    }
  }

  static async addNote(id: string, note: string): Promise<void> {
    try {
      const existing = await this.getById(id);
      if (!existing) throw new Error('Candidatura não encontrada.');

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
      console.error('Erro ao adicionar nota no Firestore:', err);
      throw err;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const existing = await this.getById(id);
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      await AuditService.log({
        action: 'DELETE',
        description: `Candidatura ${id} excluída do Firestore`,
        moduleName: 'Recrutamento',
        targetEntity: 'Candidatura',
        companyId: existing?.companyId
      });
    } catch (err) {
      console.error('Erro ao excluir candidatura no Firestore:', err);
      throw err;
    }
  }
}

