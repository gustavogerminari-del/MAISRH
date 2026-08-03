import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { sanitizeFirestoreData } from '../lib/firestoreUtils';
import { AuditService } from './AuditService';
import { CandidateService } from './CandidateService';
import { JobService } from './JobService';
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
  | 'Reprovado'
  | 'Encerrado'
  | 'Vaga Preenchida';

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
  
  // Rejection & Closing details
  motivoReprovacao?: string;
  observacaoReprovacao?: string;
  motivoEncerramento?: string;
  manterBancoTalentos?: boolean;
  reprovadoEm?: string;
  encerradoEm?: string;

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

  static subscribeByCompany(
    companyId: string | undefined,
    onUpdate: (apps: JobCandidateApplication[]) => void,
    onError?: (err: any) => void
  ): () => void {
    if (!companyId) {
      onUpdate([]);
      return () => {};
    }

    const q = query(
      collection(db, COLLECTION_NAME),
      where('companyId', '==', companyId)
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
        console.error('Erro na assinatura em tempo real de candidaturas da empresa:', err);
        if (onError) onError(err);
        else onUpdate([]);
      }
    );
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

    // Verificar se já existe candidatura igual para esta mesma vaga
    if (appData.candidateId && appData.jobId && appData.companyId) {
      try {
        const qDup = query(
          collection(db, COLLECTION_NAME),
          where('companyId', '==', appData.companyId),
          where('jobId', '==', appData.jobId),
          where('candidateId', '==', appData.candidateId)
        );
        const snapDup = await getDocs(qDup);
        if (!snapDup.empty) {
          const existingDoc = snapDup.docs[0];
          return {
            ...(existingDoc.data() as JobCandidateApplication),
            id: existingDoc.id
          };
        }
      } catch (dupErr) {
        console.warn('Aviso ao verificar duplicidade de candidatura:', dupErr);
      }
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

  static async hireCandidate(
    candidate: JobCandidateApplication, 
    jobTitle?: string,
    options: { closeOtherCandidates?: boolean } = { closeOtherCandidates: true }
  ): Promise<{
    success: boolean;
    admissionSent: boolean;
    profileUpdated: boolean;
    othersClosedCount?: number;
    warnings: string[];
  }> {
    if (!candidate || !candidate.id) throw new Error('ID real da candidatura não informado.');
    if (!candidate.companyId) throw new Error('Empresa da candidatura não identificada.');
    if (!candidate.jobId) throw new Error('Vaga da candidatura não identificada.');
    if (!candidate.name) throw new Error('Nome do candidato não informado.');

    if (candidate.status === 'Contratado') {
      throw new Error('Candidato já contratado.');
    }

    const now = new Date().toISOString();
    const titleToUse = jobTitle || candidate.role || 'Vaga Corporativa';

    // 1. Prepare timeline
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

    // Primary document updates
    const appUpdateDoc = sanitizeFirestoreData({
      status: 'Contratado',
      etapa: 'Contratado',
      timeline: updatedTimeline,
      contratadoEm: now,
      updatedAt: now
    });

    const contratacaoId = `${candidate.jobId}_${candidate.candidateId || candidate.id}`;
    const contratacaoDoc = sanitizeFirestoreData({
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
    });

    // 2. Primary Mandatory Step: Write Batch
    const batch = writeBatch(db);
    batch.set(doc(db, COLLECTION_NAME, candidate.id), appUpdateDoc, { merge: true });
    batch.set(doc(db, 'contratacoes', contratacaoId), contratacaoDoc, { merge: true });

    await batch.commit();

    let profileUpdated = false;
    let admissionSent = false;
    let othersClosedCount = 0;
    const warnings: string[] = [];

    // 3. Close other active candidates for the same job if option is true
    if (options.closeOtherCandidates !== false) {
      try {
        const qOther = query(
          collection(db, COLLECTION_NAME),
          where('companyId', '==', candidate.companyId),
          where('jobId', '==', candidate.jobId)
        );
        const snapOther = await getDocs(qOther);

        const closeBatch = writeBatch(db);
        let pendingCloseOps = 0;

        for (const docItem of snapOther.docs) {
          if (docItem.id === candidate.id) continue;
          const data = docItem.data() as JobCandidateApplication;

          // Skip already hired, closed, or rejected candidates
          if (
            data.status === 'Contratado' ||
            data.status === 'Encerrado' ||
            data.status === 'Reprovado' ||
            (data.status as string) === 'Vaga Preenchida'
          ) {
            continue;
          }

          const closeTimeline = [
            ...(data.timeline || []),
            {
              id: `evt-${Date.now()}-${docItem.id}`,
              title: 'Processo encerrado',
              description: 'A vaga foi preenchida por outro candidato. Perfil mantido no Banco de Talentos.',
              date: now.replace('T', ' ').substring(0, 16),
              by: auth.currentUser?.displayName || 'Recrutador RH'
            }
          ];

          const closePayload = sanitizeFirestoreData({
            status: 'Encerrado',
            etapa: 'Vaga Preenchida',
            motivoEncerramento: 'Outro candidato contratado',
            manterBancoTalentos: true,
            encerradoEm: now,
            updatedAt: now,
            timeline: closeTimeline
          });

          closeBatch.set(doc(db, COLLECTION_NAME, docItem.id), closePayload, { merge: true });
          pendingCloseOps++;
          othersClosedCount++;

          // Maintain candidate profile in Talent Bank (candidatos)
          if (data.candidateId) {
            try {
              await CandidateService.update(data.candidateId, {
                disponivelBancoTalentos: true,
                ultimoStatusProcesso: 'Vaga Preenchida',
                ultimaVagaId: candidate.jobId,
                updatedAt: now
              });
            } catch (pErr) {
              console.warn(`Aviso ao atualizar Banco de Talentos do candidato ${data.candidateId}:`, pErr);
            }
          }
        }

        if (pendingCloseOps > 0) {
          await closeBatch.commit();
        }
      } catch (closeErr: any) {
        console.error('Erro ao encerrar outros candidatos da vaga:', closeErr);
        warnings.push(`Candidato contratado, mas alguns participantes da vaga ainda precisam ser encerrados: ${closeErr?.message || 'Erro de sincronização'}`);
      }
    }

    // 4. Update Job Status based on position capacity
    try {
      const job = await JobService.getById(candidate.jobId);
      if (job) {
        const jobOpenings = Number(job.openings || (job as any).vagasCount || (job as any).totalVagas || 1);
        
        // Count total hires for this job
        const qHired = query(
          collection(db, COLLECTION_NAME),
          where('companyId', '==', candidate.companyId),
          where('jobId', '==', candidate.jobId),
          where('status', '==', 'Contratado')
        );
        const snapHired = await getDocs(qHired);
        const totalHired = snapHired.size;

        if (totalHired >= jobOpenings || options.closeOtherCandidates) {
          await JobService.update(candidate.jobId, {
            status: 'Preenchida',
            statusVaga: 'Preenchida',
            preenchidaEm: now
          });
        }
      }
    } catch (jobErr: any) {
      console.warn('Aviso ao verificar/atualizar status da vaga no JobService:', jobErr);
    }

    // 5. Secondary Step A: Profile Sync
    if (candidate.candidateId) {
      try {
        await CandidateService.update(candidate.candidateId, {
          status: 'Contratado',
          currentJobId: candidate.jobId,
          currentStageId: 'contratado'
        });
        profileUpdated = true;
      } catch (e: any) {
        console.warn('Aviso ao atualizar perfil no Banco de Talentos:', e);
        warnings.push('Perfil do candidato no Banco de Talentos não pôde ser sincronizado.');
      }
    }

    // 6. Secondary Step B: DP Admission Queue
    try {
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
      admissionSent = true;
    } catch (e: any) {
      console.warn('Aviso ao enviar para admissão no DP:', e);
      warnings.push(`Envio para admissão do DP: ${e?.message || 'Erro ao gravar registro de admissão'}`);
    }

    // 7. Secondary Step C: Audit Log
    try {
      await AuditService.log({
        action: 'UPDATE',
        description: `Candidato ${candidate.name} contratado para a vaga ${titleToUse}`,
        moduleName: 'Recrutamento',
        targetEntity: 'Contratação',
        companyId: candidate.companyId
      });
    } catch (e: any) {
      console.warn('Aviso ao registrar auditoria:', e);
    }

    return {
      success: true,
      admissionSent,
      profileUpdated,
      othersClosedCount,
      warnings
    };
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

