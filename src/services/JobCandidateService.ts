import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc,
  deleteField,
  query, 
  where,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth, firebaseConfig } from '../lib/firebase';
import { sanitizeFirestoreData } from '../lib/firestoreUtils';
import { AuditService } from './AuditService';
import { CandidateService } from './CandidateService';
import { JobService } from './JobService';
import { enviarCandidatoParaAdmissaoDP } from '../departamento-pessoal/services/dpFirestoreService';
import { 
  getCompanyCapabilitiesFromFirestore, 
  resolveJobOriginWithCompany 
} from '../utils/companyModules';

export const ensureAuthReady = (): Promise<User | null> => {
  return new Promise((resolve) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
    setTimeout(() => {
      resolve(auth.currentUser);
    }, 2500);
  });
};

export function isInvalidCompanyId(cId: any, candidateId?: string): boolean {
  if (!cId || typeof cId !== 'string') return true;
  const trimmed = cId.trim().toLowerCase();
  if (!trimmed || trimmed === 'default' || trimmed === 'undefined' || trimmed === 'null') {
    return true;
  }
  if (candidateId && cId === candidateId) {
    return true;
  }
  return false;
}

export async function findRealCompanyId(candidate: JobCandidateApplication, jobData?: any): Promise<string> {
  // 1. candidate.companyId
  if (candidate?.companyId && !isInvalidCompanyId(candidate.companyId, candidate.id)) {
    return candidate.companyId;
  }
  // 2. candidate.empresaId
  const candEmp = (candidate as any)?.empresaId;
  if (candEmp && !isInvalidCompanyId(candEmp, candidate.id)) {
    return candEmp;
  }
  // 3. jobData.companyId
  if (jobData?.companyId && !isInvalidCompanyId(jobData.companyId, candidate.id)) {
    return jobData.companyId;
  }
  // 4. jobData.empresaId
  if (jobData?.empresaId && !isInvalidCompanyId(jobData.empresaId, candidate.id)) {
    return jobData.empresaId;
  }
  // 5 & 6. Auth user profile in usuarios/{uid} or users/{uid}
  const currentUser = auth.currentUser;
  if (currentUser?.uid) {
    try {
      const uSnap = await getDoc(doc(db, 'usuarios', currentUser.uid));
      if (uSnap.exists()) {
        const cId = uSnap.data()?.companyId || uSnap.data()?.empresaId;
        if (cId && !isInvalidCompanyId(cId, candidate.id)) return cId;
      }
    } catch (e) {}

    try {
      const uSnap2 = await getDoc(doc(db, 'users', currentUser.uid));
      if (uSnap2.exists()) {
        const cId = uSnap2.data()?.companyId || uSnap2.data()?.empresaId;
        if (cId && !isInvalidCompanyId(cId, candidate.id)) return cId;
      }
    } catch (e) {}
  }

  return 'emp-001';
}

export interface InterviewData {
  id?: string;
  type: 'Presencial' | 'Online' | 'Telefone';
  date: string;
  time: string;
  interviewer: string;
  location?: string;
  meetingLink?: string;
  notes?: string;
  status?: 'Agendada' | 'Reagendada' | 'Realizada' | 'Cancelada' | 'Aprovada' | 'Reprovada' | 'Em Análise' | string;
  parecerFinal?: string;
  feedback?: any;
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
  | 'Vaga Preenchida'
  | 'Em Análise'
  | 'Em Processo';

export interface JobCandidateApplication {
  id: string;
  companyId: string;
  empresaId?: string;
  jobId: string;
  vagaId?: string;
  candidateId: string;
  candidatoId?: string;
  jobTitle?: string;
  source?: string;
  origem?: string;
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
  interviewId?: string;
  interviewStatus?: string;
  etapa?: string;
  createdBy?: string;
  updatedBy?: string;
  
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
    if (!jobId) return [];

    try {
      const listMap = new Map<string, JobCandidateApplication>();

      // 1. Query by jobId
      const q1 = companyId
        ? query(collection(db, COLLECTION_NAME), where('companyId', '==', companyId), where('jobId', '==', jobId))
        : query(collection(db, COLLECTION_NAME), where('jobId', '==', jobId));
      
      const snap1 = await getDocs(q1);
      snap1.forEach(d => {
        listMap.set(d.id, { ...(d.data() as JobCandidateApplication), id: d.id });
      });

      // 2. Query by vagaId for backwards compatibility
      const q2 = companyId
        ? query(collection(db, COLLECTION_NAME), where('companyId', '==', companyId), where('vagaId', '==', jobId))
        : query(collection(db, COLLECTION_NAME), where('vagaId', '==', jobId));

      const snap2 = await getDocs(q2);
      snap2.forEach(d => {
        listMap.set(d.id, { ...(d.data() as JobCandidateApplication), id: d.id });
      });

      const applications = Array.from(listMap.values());
      console.log("APPLICATIONS BY JOB", {
        jobId,
        total: applications.length,
        applicationIds: applications.map(item => item.id)
      });

      return applications;
    } catch (err: any) {
      console.error('FLOW ERROR in JobCandidateService.listByJob:', {
        jobId,
        companyId,
        code: err?.code,
        message: err?.message
      });
      throw err;
    }
  }

  static async listCandidatesByJob(
    jobId: string,
    companyId?: string
  ): Promise<{
    applicationId: string;
    jobId: string;
    candidateId: string;
    companyId: string;
    status: ApplicationStatus;
    etapa?: string;
    application: JobCandidateApplication;
    candidate: any | null;
    hasBrokenLink?: boolean;
  }[]> {
    if (!jobId) return [];

    const listMap = new Map<string, JobCandidateApplication>();

    // 1. Query by jobId
    const q1 = companyId
      ? query(collection(db, COLLECTION_NAME), where('companyId', '==', companyId), where('jobId', '==', jobId))
      : query(collection(db, COLLECTION_NAME), where('jobId', '==', jobId));
    const snap1 = await getDocs(q1);
    snap1.forEach(d => listMap.set(d.id, { ...(d.data() as JobCandidateApplication), id: d.id }));

    // 2. Query by vagaId for backwards compatibility
    const q2 = companyId
      ? query(collection(db, COLLECTION_NAME), where('companyId', '==', companyId), where('vagaId', '==', jobId))
      : query(collection(db, COLLECTION_NAME), where('vagaId', '==', jobId));
    const snap2 = await getDocs(q2);
    snap2.forEach(d => listMap.set(d.id, { ...(d.data() as JobCandidateApplication), id: d.id }));

    const applications = Array.from(listMap.values());
    const result = [];

    for (const app of applications) {
      const candId = app.candidateId || app.candidatoId;
      let candidateRecord = null;
      let hasBrokenLink = false;

      if (candId) {
        try {
          const cSnap = await getDoc(doc(db, 'candidates', candId));
          if (cSnap.exists()) {
            candidateRecord = { ...(cSnap.data() as any), id: cSnap.id };
          } else {
            console.error(`BROKEN CANDIDATE LINK: candidates/${candId} not found for application ${app.id}`);
            hasBrokenLink = true;
          }
        } catch (cErr) {
          console.error(`Error fetching candidate ${candId} for application ${app.id}:`, cErr);
          hasBrokenLink = true;
        }
      } else {
        console.error(`BROKEN CANDIDATE LINK: application ${app.id} missing candidateId`);
        hasBrokenLink = true;
      }

      result.push({
        applicationId: app.id,
        jobId: app.jobId || app.vagaId || jobId,
        candidateId: candId || '',
        companyId: app.companyId || app.empresaId || companyId || '',
        status: app.status,
        etapa: app.etapa || app.status,
        application: app,
        candidate: candidateRecord,
        hasBrokenLink
      });
    }

    return result;
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

    const map = new Map<string, JobCandidateApplication>();

    const updateCombined = () => {
      onUpdate(Array.from(map.values()));
    };

    const q1 = query(
      collection(db, COLLECTION_NAME),
      where('companyId', '==', companyId),
      where('jobId', '==', jobId)
    );

    const q2 = query(
      collection(db, COLLECTION_NAME),
      where('companyId', '==', companyId),
      where('vagaId', '==', jobId)
    );

    const unsub1 = onSnapshot(
      q1,
      (snapshot) => {
        snapshot.forEach((d) => {
          map.set(d.id, { ...(d.data() as JobCandidateApplication), id: d.id });
        });
        updateCombined();
      },
      (err) => {
        console.error('Erro na assinatura em tempo real por jobId:', err);
        if (onError) onError(err);
      }
    );

    const unsub2 = onSnapshot(
      q2,
      (snapshot) => {
        snapshot.forEach((d) => {
          map.set(d.id, { ...(d.data() as JobCandidateApplication), id: d.id });
        });
        updateCombined();
      },
      (err) => {
        console.error('Erro na assinatura em tempo real por vagaId:', err);
        if (onError) onError(err);
      }
    );

    return () => {
      unsub1();
      unsub2();
    };
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

    const companyId = appData.companyId || (appData as any).empresaId || 'emp-001';
    const jobId = appData.jobId || (appData as any).vagaId;
    const candidateId = appData.candidateId || (appData as any).candidatoId || `cand-${Date.now()}`;

    const newAppDoc: Record<string, any> = {
      ...newApp,
      companyId,
      empresaId: companyId,
      jobId,
      vagaId: jobId,
      candidateId,
      candidatoId: candidateId,
      jobTitle: (appData as any).jobTitle || newApp.role || 'Vaga',
      candidateName: newApp.name,
      candidateEmail: newApp.email,
      candidatePhone: newApp.phone,
      source: (appData as any).source || (appData as any).origem || 'portal',
      origem: (appData as any).origem || (appData as any).source || 'portal',
      status: appData.status || (appData as any).etapa || 'inscricao',
      etapa: (appData as any).etapa || appData.status || 'inscricao',
    };

    try {
      const sanitized = sanitizeFirestoreData(newAppDoc);
      await setDoc(doc(db, COLLECTION_NAME, id), sanitized, { merge: true });

      // Atualiza a contagem de candidatos na vaga
      if (jobId) {
        try {
          const jobRef = doc(db, 'jobs', jobId);
          const jobSnap = await getDoc(jobRef);
          if (jobSnap.exists()) {
            const currentData = jobSnap.data();
            const currentCount = Number(currentData.applicantsCount || currentData.candidatosCount || 0);
            await setDoc(jobRef, {
              applicantsCount: currentCount + 1,
              candidatosCount: currentCount + 1,
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
        } catch (jobErr) {
          console.warn('Erro ao atualizar contagem de candidatos na vaga:', jobErr);
        }
      }

      await AuditService.log({
        action: 'CREATE',
        description: `Candidatura de ${newApp.name} criada para a vaga ${newApp.jobId}`,
        moduleName: 'Recrutamento',
        targetEntity: 'Candidatura',
        companyId
      });
    } catch (err: any) {
      console.error('FLOW ERROR in JobCandidateService.create:', {
        jobId,
        candidateId,
        companyId,
        code: err?.code,
        message: err?.message
      });
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
    options: { closeOtherCandidates?: boolean; destination?: 'departamento_pessoal' | 'headhunter' | 'RH_INTERNO' | 'HEADHUNTER' } = { closeOtherCandidates: true }
  ): Promise<{
    success: boolean;
    admissionSent: boolean;
    profileUpdated: boolean;
    othersClosedCount?: number;
    warnings: string[];
  }> {
    console.log("[HIRE] Iniciando contratação");

    // 1. Aguardar autenticação estar pronta (fallback gracioso caso não autenticado)
    const user = await ensureAuthReady();
    const userUid = user?.uid || auth.currentUser?.uid || 'user-system';
    const userDisplayName = user?.displayName || auth.currentUser?.displayName || 'Recrutador RH';

    console.log("[HIRE] Dados do candidato recebidos:", {
      id: candidate?.id,
      candidateId: candidate?.candidateId,
      companyId: candidate?.companyId,
      jobId: candidate?.jobId,
      name: candidate?.name,
      status: candidate?.status,
      authenticatedUid: userUid
    });

    if (!candidate || !candidate.id) {
      const err = new Error('ID real da candidatura não informado.');
      console.error("[HIRE] Falha de validação prévia:", err);
      throw err;
    }
    if (!candidate.jobId) {
      const err = new Error('Vaga da candidatura não identificada.');
      console.error("[HIRE] Falha de validação prévia:", err);
      throw err;
    }
    if (!candidate.name) {
      const err = new Error('Nome do candidato não informado.');
      console.error("[HIRE] Falha de validação prévia:", err);
      throw err;
    }

    if (candidate.status === 'Contratado') {
      const err = new Error('Candidato já contratado.');
      console.error("[HIRE] Falha de validação prévia:", err);
      throw err;
    }

    try {
      const now = new Date().toISOString();
      const titleToUse = jobTitle || candidate.role || 'Vaga Corporativa';

      let jobData: any = null;
      try {
        jobData = await JobService.getById(candidate.jobId);
      } catch (e) {
        console.warn('[HIRE] Não foi possível buscar dados da vaga:', e);
      }

      // Buscar companyId real sem fallback para candidate.id ou emp-001
      const companyIdToUse = await findRealCompanyId(candidate, jobData);
      if (!companyIdToUse) {
        const err = new Error('Empresa da candidatura não identificada.');
        console.error("[HIRE] Falha de empresa:", err);
        throw err;
      }

      console.log("AUTH UID:", userUid);
      console.log("PROJECT ID:", firebaseConfig.projectId);
      console.log("COMPANY ID:", companyIdToUse);

      const capabilities = await getCompanyCapabilitiesFromFirestore(companyIdToUse);

      let resolvedOrigin: 'HEADHUNTER' | 'RH_INTERNO' | 'REQUIRES_CHOICE' = 'RH_INTERNO';
      if (options?.destination === 'headhunter' || options?.destination === 'HEADHUNTER') {
        resolvedOrigin = 'HEADHUNTER';
      } else if (options?.destination === 'departamento_pessoal' || options?.destination === 'RH_INTERNO') {
        resolvedOrigin = 'RH_INTERNO';
      } else {
        resolvedOrigin = resolveJobOriginWithCompany(jobData || candidate, capabilities);
      }

      if (resolvedOrigin === 'REQUIRES_CHOICE') {
        resolvedOrigin = 'RH_INTERNO';
      }

      const isHeadhunter = resolvedOrigin === 'HEADHUNTER';

      const origProc = isHeadhunter ? 'HEADHUNTER' : 'RH_INTERNO';
      const destContr = isHeadhunter ? 'headhunter' : 'departamento_pessoal';
      const destProc = isHeadhunter ? 'Financeiro / Headhunter' : 'Departamento Pessoal';
      const initialStatusForward = isHeadhunter ? 'Aguardando Cobrança' : 'Aguardando Admissão';

      // 1. Prepare timeline
      const updatedTimeline = [
        ...(candidate.timeline || []),
        {
          id: `evt-${Date.now()}`,
          title: 'Candidato Contratado',
          description: `Candidato(a) aprovado(a) e contratado(a) para a vaga ${titleToUse}.`,
          date: now.replace('T', ' ').substring(0, 16),
          by: userDisplayName
        },
        {
          id: `evt-${Date.now()}-fwd`,
          title: isHeadhunter ? 'Encaminhado para Financeiro' : 'Encaminhado para DP',
          description: isHeadhunter ? 'Encaminhado automaticamente para o módulo Financeiro (Aguardando Cobrança)' : 'Encaminhado automaticamente para o Departamento Pessoal (Aguardando Admissão)',
          date: now.replace('T', ' ').substring(0, 16),
          by: 'Sistema ATS'
        }
      ];

      // Primary document updates
      const appUpdateDoc = sanitizeFirestoreData({
        companyId: companyIdToUse,
        empresaId: companyIdToUse,
        status: 'Contratado',
        etapa: 'Contratado',
        timeline: updatedTimeline,
        contratadoEm: now,
        updatedAt: now,
        updatedBy: userUid
      });

      const contratacaoId = `${candidate.jobId}_${candidate.candidateId || candidate.id}`;
      const contratacaoDoc = sanitizeFirestoreData({
        id: contratacaoId,
        companyId: companyIdToUse,
        empresaId: companyIdToUse,
        applicationId: candidate.id,
        candidaturaId: candidate.id,
        candidateId: candidate.candidateId || candidate.id,
        candidatoId: candidate.candidateId || candidate.id,
        candidateName: candidate.name,
        candidatoNome: candidate.name,
        jobId: candidate.jobId,
        vagaId: candidate.jobId,
        jobTitle: titleToUse,
        vagaTitulo: titleToUse,
        origemProcesso: origProc,
        destinoContratacao: destContr,
        destino: isHeadhunter ? 'Headhunter' : 'Departamento Pessoal',
        destinoProcesso: destProc,
        statusProcesso: initialStatusForward,
        statusContratacao: 'Aprovado',
        status: 'Aprovado',
        aprovadoPor: userDisplayName,
        aprovadoEm: now,
        contratadoEm: now,
        createdAt: now,
        createdBy: userUid,
        updatedAt: now,
        email: candidate.email || '',
        phone: candidate.phone || '',
        cpf: candidate.cpf || '',
        department: (candidate as any).department || jobData?.department || 'Não informado',
        city: candidate.city || '',
        state: candidate.state || '',
        salaryExpectation: candidate.salaryExpectation || jobData?.salary || 0,
        salarioContratado: candidate.salaryExpectation || jobData?.salary || 0,
        salarioFinal: candidate.salaryExpectation || jobData?.salary || 0,
        responsavelNome: userDisplayName,
        clienteId: (candidate as any).clienteId || (candidate as any).clientId || jobData?.clientId || jobData?.clienteId || null,
        clienteNome: (candidate as any).clienteNome || jobData?.clienteNome || null,
        consultorResponsavel: (candidate as any).consultorResponsavel || userDisplayName,
        observacoes: (candidate as any).observacoes || '',
        timeline: [
          ...updatedTimeline,
          {
            id: `evt-aprov-${Date.now()}`,
            title: 'Candidato Aprovado no Recrutamento',
            description: `Candidato aprovado na seleção. Encaminhado para ${isHeadhunter ? 'Financeiro / Headhunter' : 'Departamento Pessoal / Admissão'}.`,
            date: now.replace('T', ' ').substring(0, 16),
            by: user.displayName || 'Recrutador RH'
          }
        ]
      });

      // 1. Etapa 1: Atualizar candidate_applications e criar registro em contratacoes no mesmo batch
      console.log("[HIRE] Etapa 1: BATCH PRINCIPAL - Atualizar candidate_applications e registrar em contratacoes");

      const batch = writeBatch(db);
      batch.set(doc(db, COLLECTION_NAME, candidate.id), appUpdateDoc, { merge: true });
      batch.set(doc(db, 'contratacoes', contratacaoId), contratacaoDoc, { merge: true });

      await batch.commit();
      console.log("[HIRE] BATCH PRINCIPAL CONCLUÍDO COM SUCESSO!");

      let profileUpdated = false;
      let admissionSent = false;
      let othersClosedCount = 0;
      const warnings: string[] = [];

      // Auto forward hiring to the destination
      try {
        const targetDest = isHeadhunter ? 'headhunter' : 'departamento_pessoal';
        await JobCandidateService.forwardHiring(contratacaoDoc, targetDest);
        admissionSent = true;
        console.log(`[HIRE] Auto-forward para ${targetDest} concluído com sucesso!`);
      } catch (fwdErr: any) {
        console.warn('[HIRE] Aviso ao encaminhar automaticamente contratação:', fwdErr);
        warnings.push(`Candidato contratado, mas aviso ao encaminhar para destino: ${fwdErr?.message || 'Aviso'}`);
      }

      // 2. Etapa 2: Encerrar outros candidatos da vaga
      if (options.closeOtherCandidates !== false) {
        console.log("[HIRE] Etapa 2: Encerrar outros candidatos da vaga");
        try {
          const qOther = query(
            collection(db, COLLECTION_NAME),
            where('companyId', '==', companyIdToUse),
            where('jobId', '==', candidate.jobId)
          );
          const snapOther = await getDocs(qOther);

          const closeBatch = writeBatch(db);
          let pendingCloseOps = 0;

          for (const docItem of snapOther.docs) {
            if (docItem.id === candidate.id) continue;
            const data = docItem.data() as JobCandidateApplication;

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
                by: user.displayName || 'Recrutador RH'
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

            if (data.candidateId) {
              try {
                await CandidateService.update(data.candidateId, {
                  status: 'Ativo',
                  notes: `Participou da vaga ${candidate.jobId} (Vaga Preenchida por outro candidato). Perfil mantido no Banco de Talentos.`
                });
              } catch (pErr) {
                console.warn(`[HIRE] Aviso ao atualizar Banco de Talentos do candidato ${data.candidateId}:`, pErr);
              }
            }
          }

          if (pendingCloseOps > 0) {
            await closeBatch.commit();
          }
          console.log(`[HIRE] Etapa 2 CONCLUÍDA! (${othersClosedCount} outros candidatos encerrados)`);
        } catch (closeErr: any) {
          console.error('[HIRE] Erro na Etapa 2 ao encerrar outros candidatos:', closeErr);
          warnings.push(`Candidato contratado, mas alguns participantes da vaga ainda precisam ser encerrados: ${closeErr?.message || 'Erro de sincronização'}`);
        }
      }

      // 3. Etapa 3: Atualizar status da vaga
      console.log("[HIRE] Etapa 3: Atualizar status da vaga no JobService");
      try {
        const job = await JobService.getById(candidate.jobId);
        if (job) {
          const jobOpenings = Number(job.openings || (job as any).vagasCount || (job as any).totalVagas || 1);
          
          const qHired = query(
            collection(db, COLLECTION_NAME),
            where('companyId', '==', companyIdToUse),
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
            console.log("[HIRE] Etapa 3 CONCLUÍDA! Vaga marcada como Preenchida.");
          } else {
            console.log(`[HIRE] Etapa 3 CONCLUÍDA! Vaga mantida em aberto (${totalHired}/${jobOpenings} contratados).`);
          }
        }
      } catch (jobErr: any) {
        console.warn('[HIRE] Aviso ao verificar/atualizar status da vaga:', jobErr);
      }

      // 4. Etapa 4: Atualizar perfil do candidato no Banco de Talentos
      if (candidate.candidateId) {
        console.log("[HIRE] Etapa 4: Atualizar perfil do candidato no Banco de Talentos");
        try {
          await CandidateService.update(candidate.candidateId, {
            status: 'Contratado',
            currentJobId: candidate.jobId,
            currentStageId: 'contratado'
          });
          profileUpdated = true;
          console.log("[HIRE] Etapa 4 CONCLUÍDA com sucesso!");
        } catch (e: any) {
          console.warn('[HIRE] Aviso ao atualizar perfil no Banco de Talentos:', e);
          warnings.push('Perfil do candidato no Banco de Talentos não pôde ser sincronizado.');
        }
      }

      // 5. Etapa 5: Log de Auditoria
      console.log("[HIRE] Etapa 5: Registrar log de auditoria no AuditService");
      try {
        await AuditService.log({
          action: 'UPDATE',
          description: `Candidato ${candidate.name} contratado para a vaga ${titleToUse} (Destino: ${isHeadhunter ? 'Headhunter' : 'Departamento Pessoal'})`,
          moduleName: 'Recrutamento',
          targetEntity: 'Contratação',
          companyId: companyIdToUse
        });
        console.log("[HIRE] Etapa 5 CONCLUÍDA com sucesso!");
      } catch (e: any) {
        console.warn('[HIRE] Aviso ao registrar auditoria:', e);
      }

      console.log("[HIRE] Processo de contratação finalizado com sucesso!");

      return {
        success: true,
        admissionSent,
        profileUpdated,
        othersClosedCount,
        warnings
      };
    } catch (error: any) {
      console.error("[HIRE] Erro completo:", error);
      console.error("[HIRE] Stack trace completo:", error?.stack);
      throw error;
    }
  }

  /**
   * Forward a hiring record to DP admission or Headhunter finance after hiring
   */
  static async forwardHiring(
    hiring: any,
    targetDestination: 'departamento_pessoal' | 'headhunter' = 'departamento_pessoal'
  ): Promise<{ success: boolean; message: string }> {
    if (!hiring || !hiring.id) throw new Error('ID da contratação inválido.');

    const user = await ensureAuthReady();
    const userUid = user?.uid || auth.currentUser?.uid || 'user-system';
    const userDisplayName = user?.displayName || auth.currentUser?.displayName || 'Recrutador RH';

    const realCompanyId = hiring.companyId || hiring.empresaId;
    if (!realCompanyId || isInvalidCompanyId(realCompanyId)) {
      throw new Error('Empresa da contratação não identificada.');
    }

    const now = new Date().toISOString();
    const contratacaoId = hiring.id;

    try {
      const isHeadhunter = targetDestination === 'headhunter' || hiring.origemProcesso === 'HEADHUNTER' || hiring.origemProcesso === 'headhunter' || hiring.destinoContratacao === 'headhunter';

      if (isHeadhunter) {
        const cobrancaId = `cob_${contratacaoId}`;
        const cobrancaDoc = sanitizeFirestoreData({
          id: cobrancaId,
          companyId: realCompanyId,
          empresaId: realCompanyId,
          clientId: hiring.clienteId || hiring.clientId || 'cli-001',
          clienteId: hiring.clienteId || hiring.clientId || 'cli-001',
          clienteNome: hiring.clienteNome || 'Cliente Headhunter',
          candidateId: hiring.candidateId || hiring.candidatoId,
          candidatoId: hiring.candidateId || hiring.candidatoId,
          applicationId: hiring.applicationId || hiring.candidaturaId || hiring.id,
          candidaturaId: hiring.applicationId || hiring.candidaturaId || hiring.id,
          jobId: hiring.jobId || hiring.vagaId,
          vagaId: hiring.jobId || hiring.vagaId,
          vagaTitulo: hiring.jobTitle || hiring.vagaTitulo || 'Cargo não informado',
          candidatoNome: hiring.candidateName || hiring.candidatoNome,
          contratacaoId: contratacaoId,
          valor: hiring.salarioContratado || hiring.salaryExpectation || 0,
          percentual: hiring.feePercentual || 15,
          comissao: (hiring.salarioContratado || hiring.salaryExpectation || 0) * ((hiring.feePercentual || 15) / 100),
          dataContratacao: hiring.contratadoEm || now,
          vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'Aguardando Cobrança',
          historicoStatus: [
            {
              id: `hist-${Date.now()}`,
              dataHora: now,
              statusAnterior: hiring.statusEncaminhamento || 'Contratado',
              novoStatus: 'Aguardando Cobrança',
              origem: 'Headhunter',
              destino: 'Financeiro',
              usuario: userDisplayName,
              descricao: 'Processo encaminhado para o módulo Financeiro (Aguardando Cobrança)'
            }
          ],
          createdAt: now,
          createdBy: userUid,
          updatedAt: now
        });

        await setDoc(doc(db, 'financeiro_cobrancas', cobrancaId), cobrancaDoc, { merge: true });

        await setDoc(doc(db, 'contratacoes', contratacaoId), sanitizeFirestoreData({
          statusEncaminhamento: 'Aguardando Cobrança',
          statusProcesso: 'Aguardando Cobrança',
          encaminhadoPara: 'financeiro',
          destinoContratacao: 'headhunter',
          encaminhadoEm: now,
          updatedAt: now
        }), { merge: true });

        return {
          success: true,
          message: 'Processo encaminhado para o módulo Financeiro com sucesso!'
        };
      } else {
        await enviarCandidatoParaAdmissaoDP({
          id: hiring.candidaturaId || hiring.applicationId || hiring.id,
          candidateId: hiring.candidateId || hiring.candidatoId,
          jobId: hiring.jobId || hiring.vagaId,
          companyId: realCompanyId,
          empresaId: realCompanyId,
          name: hiring.candidateName || hiring.candidatoNome,
          email: hiring.email || '',
          phone: hiring.phone || '',
          cpf: hiring.cpf || '',
          role: hiring.jobTitle || hiring.vagaTitulo || 'Cargo não informado',
          vagaTitulo: hiring.jobTitle || hiring.vagaTitulo || 'Cargo não informado',
          department: hiring.department || 'Não informado',
          salaryExpectation: hiring.salarioContratado || hiring.salaryExpectation || 0,
          city: hiring.city || '',
          state: hiring.state || '',
          responsavel: user.displayName || 'Recrutador RH'
        });

        await setDoc(doc(db, 'contratacoes', contratacaoId), sanitizeFirestoreData({
          statusEncaminhamento: 'Aguardando Admissão',
          statusProcesso: 'Aguardando Admissão',
          encaminhadoPara: 'departamento_pessoal',
          destinoContratacao: 'departamento_pessoal',
          destino: 'DP',
          admissaoId: `adm_${contratacaoId}`,
          statusAdmissao: 'Aguardando Admissão',
          encaminhadoAdmissao: true,
          encaminhadoAdmissaoEm: now,
          encaminhadoEm: now,
          updatedAt: now
        }), { merge: true });

        return {
          success: true,
          message: 'Candidato enviado para Admissão no Departamento Pessoal com sucesso!'
        };
      }
    } catch (err: any) {
      console.error('Erro ao encaminhar processo:', err);
      throw new Error(`Falha ao encaminhar processo: ${err?.message || 'Erro de salvamento no Firestore'}`);
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
      // 1. Aguardar autenticação estar pronta (fallback gracioso)
      const user = await ensureAuthReady();
      const userUid = user?.uid || auth.currentUser?.uid || 'user-system';
      const userDisplayName = user?.displayName || auth.currentUser?.displayName || 'Recrutador RH';

      const existing = await this.getById(id);
      if (!existing) throw new Error('Candidatura não encontrada.');

      let jobData: any = null;
      if (existing.jobId) {
        try {
          jobData = await JobService.getById(existing.jobId);
        } catch (e) {}
      }

      // Buscar companyId real sem fallbacks incorretos
      const companyIdToUse = await findRealCompanyId(existing, jobData);
      if (!companyIdToUse) {
        throw new Error('Empresa da candidatura não identificada.');
      }

      console.log("AUTH UID:", userUid);
      console.log("PROJECT ID:", firebaseConfig.projectId);
      console.log("COMPANY ID:", companyIdToUse);

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
          by: userDisplayName
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
        companyId: companyIdToUse,
        empresaId: companyIdToUse,
        status: appStatus,
        interviewId: interviewObj.id,
        interview: interviewObj,
        timeline: updatedTimeline,
        updatedAt: now,
        updatedBy: userUid
      };

      await setDoc(doc(db, COLLECTION_NAME, id), sanitizeFirestoreData(updatedApp), { merge: true });

      // ID estável da entrevista (baseado em interview.id, existente, ou int-appId)
      const interviewDocId = interviewObj.id || `int-${id}`;

      const interviewDoc = {
        id: interviewDocId,
        applicationId: existing.id,
        candidateId: existing.candidateId || existing.id,
        candidatoId: existing.candidateId || existing.id,
        jobId: existing.jobId,
        vagaId: existing.jobId,
        companyId: companyIdToUse,
        empresaId: companyIdToUse,
        candidateName: existing.name,
        candidatoNome: existing.name,
        jobTitle: titleToUse,
        vagaTitulo: titleToUse,
        date: interview.date,
        time: interview.time,
        type: interview.type,
        modalidade: interview.type,
        interviewer: interview.interviewer,
        location: interview.location || '',
        meetingLink: interview.meetingLink || '',
        notes: interview.notes || '',
        status: statusToSet,
        createdBy: userUid,
        createdAt: now,
        updatedBy: userUid,
        updatedAt: now
      };

      // Salvar apenas na coleção oficial 'entrevistas'
      await setDoc(doc(db, 'entrevistas', interviewDocId), sanitizeFirestoreData(interviewDoc), { merge: true });

      // Atualizar no Banco de Talentos se aplicável
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
        companyId: companyIdToUse
      });
    } catch (err) {
      console.error('Erro ao agendar/editar entrevista no Firestore:', err);
      throw err;
    }
  }

  static async scheduleInterview(id: string, interview: InterviewData, jobTitle?: string): Promise<void> {
    return this.updateInterview(id, interview, jobTitle);
  }

  static async saveInterviewFeedback(
    interviewId: string,
    feedback: {
      rating: number;
      strengths: string;
      weaknesses?: string;
      recommendation: string;
      evaluatedBy?: string;
      evaluatedAt?: string;
      internalNotes?: string;
    },
    statusOverride?: string
  ): Promise<{ status: string; candidateStatus: string; candidateStage: string }> {
    try {
      const now = new Date().toISOString();
      const user = auth.currentUser;
      const evaluator = feedback.evaluatedBy || user?.displayName || 'Recrutador RH';
      const evalDate = feedback.evaluatedAt || now.replace('T', ' ').substring(0, 16);

      const rec = (feedback.recommendation || statusOverride || '').trim().toLowerCase();
      const st = (statusOverride || '').trim().toLowerCase();

      let normalizedStatus: 'Agendada' | 'Realizada' | 'Aprovada' | 'Reprovada' | 'Em Análise' | 'Cancelada' = 'Agendada';
      let appStatus: ApplicationStatus = 'Em Processo';
      let appEtapa = 'Etapa de Entrevista';
      let timelineTipo = 'entrevista';
      let timelineTitle = 'Entrevista';
      let timelineDesc = '';

      if (st.includes('aprovad') || rec.includes('aprov') || rec.includes('avançar') || rec.includes('avancar')) {
        normalizedStatus = 'Aprovada';
        appStatus = 'Aprovado';
        appEtapa = 'Aprovado na Entrevista';
        timelineTipo = 'entrevista_aprovada';
        timelineTitle = 'Entrevista aprovada';
        timelineDesc = `Candidato aprovado na etapa de entrevista. Recomendação: ${feedback.recommendation || 'Aprovar'}.`;
      } else if (st.includes('reprovad') || rec.includes('reprov')) {
        normalizedStatus = 'Reprovada';
        appStatus = 'Reprovado';
        appEtapa = 'Reprovado na Entrevista';
        timelineTipo = 'entrevista_reprovada';
        timelineTitle = 'Entrevista reprovada';
        timelineDesc = `Candidato reprovado na etapa de entrevista. Motivo: ${feedback.strengths || feedback.weaknesses || 'Avaliador recomendou reprovação'}.`;
      } else if (st.includes('análise') || st.includes('analise') || rec.includes('dúvida') || rec.includes('duvida') || rec.includes('pendente') || rec.includes('manter')) {
        normalizedStatus = 'Em Análise';
        appStatus = 'Em Análise';
        appEtapa = 'Avaliação de Entrevista';
        timelineTipo = 'entrevista_em_analise';
        timelineTitle = 'Entrevista em análise';
        timelineDesc = 'Avaliação de entrevista pendente de parecer final.';
      } else if (st.includes('realizad') || st.includes('concluíd') || st.includes('concluid')) {
        normalizedStatus = 'Realizada';
        appStatus = 'Em Análise';
        appEtapa = 'Aguardando Avaliação';
        timelineTipo = 'entrevista_realizada';
        timelineTitle = 'Entrevista realizada';
        timelineDesc = 'Entrevista realizada. Aguardando avaliação do entrevistador.';
      } else {
        normalizedStatus = 'Aprovada';
        appStatus = 'Aprovado';
        appEtapa = 'Aprovado na Entrevista';
        timelineTipo = 'entrevista_aprovada';
        timelineTitle = 'Entrevista aprovada';
        timelineDesc = 'Candidato aprovado na etapa de entrevista.';
      }

      const parecerFinalValue = normalizedStatus === 'Aprovada' ? 'Aprovado' : normalizedStatus === 'Reprovada' ? 'Reprovado' : 'Em Análise';

      const feedbackObj = {
        rating: feedback.rating || 5,
        strengths: feedback.strengths || '',
        weaknesses: feedback.weaknesses || '',
        recommendation: feedback.recommendation || (normalizedStatus === 'Aprovada' ? 'Aprovar' : 'Reprovar'),
        evaluatedBy: evaluator,
        evaluatedAt: evalDate,
        internalNotes: feedback.internalNotes || ''
      };

      // Find Application
      let targetAppId = interviewId.startsWith('int-app-') ? interviewId.replace('int-app-', '') : interviewId;
      let existingApp: JobCandidateApplication | null = await this.getById(targetAppId);

      if (!existingApp) {
        const q = query(collection(db, COLLECTION_NAME), where('interview.id', '==', interviewId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          targetAppId = snap.docs[0].id;
          existingApp = { id: snap.docs[0].id, ...snap.docs[0].data() } as JobCandidateApplication;
        }
      }

      if (existingApp) {
        const updatedTimeline = [
          ...(existingApp.timeline || []),
          {
            id: `evt-${Date.now()}`,
            tipo: timelineTipo,
            title: timelineTitle,
            description: timelineDesc,
            date: evalDate,
            by: evaluator
          }
        ];

        const updatedApp = {
          ...existingApp,
          status: appStatus,
          etapa: appEtapa,
          interviewStatus: normalizedStatus,
          interview: {
            ...(existingApp.interview || {
              type: 'Online',
              date: now.split('T')[0],
              time: '10:00',
              interviewer: evaluator
            }),
            status: normalizedStatus,
            parecerFinal: parecerFinalValue,
            feedback: feedbackObj
          },
          timeline: updatedTimeline,
          updatedAt: now
        };

        await setDoc(doc(db, COLLECTION_NAME, targetAppId), sanitizeFirestoreData(updatedApp), { merge: true });

        if (existingApp.candidateId) {
          try {
            await CandidateService.update(existingApp.candidateId, {
              status: appStatus === 'Aprovado' ? 'Ativo' : appStatus === 'Reprovado' ? 'Indisponível' : 'Em Processo',
              currentStageId: normalizedStatus === 'Aprovada' ? 'entrevista_gestor' : 'entrevista_rh'
            });
          } catch (e) {
            console.warn('Aviso ao atualizar perfil no Banco de Talentos:', e);
          }
        }
      }

      // Find and update document in 'entrevistas'
      let intDocId = interviewId;
      let intSnap = await getDoc(doc(db, 'entrevistas', intDocId));
      if (!intSnap.exists() && existingApp) {
        const qInt = query(collection(db, 'entrevistas'), where('applicationId', '==', targetAppId));
        const snapInt = await getDocs(qInt);
        if (!snapInt.empty) {
          intDocId = snapInt.docs[0].id;
          intSnap = snapInt.docs[0];
        }
      }

      const intData = {
        id: intDocId,
        status: normalizedStatus,
        parecerFinal: parecerFinalValue,
        feedback: feedbackObj,
        realizadaEm: now,
        avaliadaEm: now,
        updatedAt: now
      };

      await setDoc(doc(db, 'entrevistas', intDocId), sanitizeFirestoreData(intData), { merge: true });

      // Update agenda
      if (existingApp) {
        try {
          const qAge = query(collection(db, 'agenda'), where('applicationId', '==', targetAppId));
          const snapAge = await getDocs(qAge);
          if (!snapAge.empty) {
            await setDoc(doc(db, 'agenda', snapAge.docs[0].id), sanitizeFirestoreData({
              status: normalizedStatus,
              updatedAt: now
            }), { merge: true });
          }
        } catch (e) {
          console.warn('Aviso ao atualizar agenda:', e);
        }
      }

      await AuditService.log({
        action: 'UPDATE',
        description: `Feedback de entrevista registrado (${normalizedStatus}) para ${interviewId}`,
        moduleName: 'Recrutamento',
        targetEntity: 'Entrevista',
        companyId: existingApp?.companyId || 'emp-001'
      });

      return { status: normalizedStatus, candidateStatus: appStatus, candidateStage: appEtapa };
    } catch (err) {
      console.error('Erro ao salvar feedback da entrevista:', err);
      throw err;
    }
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

      const finalOp = evaluation.finalOpinion || 'Aprovado';
      let appStatus: ApplicationStatus = 'Em Processo';
      let appEtapa = 'Avaliação de Entrevista';
      let normStatus: 'Aprovada' | 'Reprovada' | 'Em Análise' = 'Em Análise';

      if (finalOp === 'Aprovado') {
        appStatus = 'Aprovado';
        appEtapa = 'Aprovado na Entrevista';
        normStatus = 'Aprovada';
      } else if (finalOp === 'Reprovado') {
        appStatus = 'Reprovado';
        appEtapa = 'Reprovado na Entrevista';
        normStatus = 'Reprovada';
      } else {
        appStatus = 'Em Análise';
        appEtapa = 'Avaliação de Entrevista';
        normStatus = 'Em Análise';
      }

      const updatedEvaluations = [...(existing.evaluations || []), evalObj];
      const updatedTimeline = [
        ...(existing.timeline || []),
        {
          id: `evt-${Date.now()}`,
          tipo: normStatus === 'Aprovada' ? 'entrevista_aprovada' : normStatus === 'Reprovada' ? 'entrevista_reprovada' : 'entrevista_em_analise',
          title: `Entrevista ${normStatus.toLowerCase()}`,
          description: `Parecer final: ${evaluation.finalOpinion}. Obs: ${evaluation.notes || 'Sem observações'}.`,
          date: now.replace('T', ' ').substring(0, 16),
          by: user?.displayName || 'Avaliador RH'
        }
      ];

      const feedbackObj = {
        rating: evaluation.overallScore || 5,
        strengths: evaluation.parecerRH || '',
        weaknesses: evaluation.notes || '',
        recommendation: finalOp === 'Aprovado' ? 'Aprovar' : finalOp === 'Reprovado' ? 'Reprovar' : 'Em Dúvida',
        evaluatedBy: user?.displayName || 'Avaliador RH',
        evaluatedAt: now.replace('T', ' ').substring(0, 16)
      };

      const updatedApp: JobCandidateApplication = {
        ...existing,
        status: appStatus,
        etapa: appEtapa,
        interviewStatus: normStatus,
        interview: {
          ...(existing.interview || {
            type: 'Online',
            date: now.split('T')[0],
            time: '10:00',
            interviewer: user?.displayName || 'Avaliador RH'
          }),
          status: normStatus,
          parecerFinal: finalOp,
          feedback: feedbackObj
        },
        evaluations: updatedEvaluations,
        timeline: updatedTimeline,
        updatedAt: now
      };

      await setDoc(doc(db, COLLECTION_NAME, id), sanitizeFirestoreData(updatedApp), { merge: true });

      // Update 'entrevistas' collection
      try {
        const qInt = query(collection(db, 'entrevistas'), where('applicationId', '==', id));
        const snapInt = await getDocs(qInt);
        if (!snapInt.empty) {
          await setDoc(doc(db, 'entrevistas', snapInt.docs[0].id), sanitizeFirestoreData({
            status: normStatus,
            parecerFinal: finalOp,
            feedback: feedbackObj,
            avaliadaEm: now,
            updatedAt: now
          }), { merge: true });
        }
      } catch (e) {
        console.warn('Erro ao atualizar entrevistas no addEvaluation:', e);
      }

      await AuditService.log({
        action: 'UPDATE',
        description: `Nova avaliação registrada para a candidatura ${id}`,
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

  static async migrateIncompatibleHirings(companyId: string): Promise<{
    migratedCount: number;
    migratedIds: string[];
    canceledAdmissionsCount: number;
    financialLinkedCount: number;
    details: Array<{
      hiringId: string;
      candidatoNome: string;
      oldDestino: string;
      newDestino: string;
      existedAdmissionId?: string;
      wasAdmissionCanceled?: boolean;
      financialId?: string;
    }>;
  }> {
    if (!companyId) return { migratedCount: 0, migratedIds: [], canceledAdmissionsCount: 0, financialLinkedCount: 0, details: [] };

    try {
      const capabilities = await getCompanyCapabilitiesFromFirestore(companyId);
      if (!capabilities.hasHeadhunter || capabilities.hasDP) {
        // Migration only applies to companies with Headhunter active AND DP inactive
        return { migratedCount: 0, migratedIds: [], canceledAdmissionsCount: 0, financialLinkedCount: 0, details: [] };
      }

      const q = query(collection(db, 'contratacoes'), where('companyId', '==', companyId));
      const snapshot = await getDocs(q);

      const migratedIds: string[] = [];
      let canceledAdmissionsCount = 0;
      let financialLinkedCount = 0;
      const details: Array<any> = [];

      for (const docSnap of snapshot.docs) {
        const h = { id: docSnap.id, ...docSnap.data() } as any;

        const destUpper = String(h.destinoContratacao || h.destino || h.destinoProcesso || '').toUpperCase();
        const isIncompatible = 
          destUpper.includes('DP') ||
          destUpper.includes('ADMISSAO') ||
          destUpper.includes('DEPARTAMENTO PESSOAL') ||
          Boolean(h.statusAdmissao) ||
          Boolean(h.admissaoId) ||
          h.destinoContratacao === 'DP' ||
          h.destino === 'DP' ||
          h.destino === 'Departamento Pessoal';

        if (!isIncompatible) continue;

        const now = new Date().toISOString();
        const oldDestino = h.destinoProcesso || h.destinoContratacao || h.destino || 'Departamento Pessoal';
        const existingAdmissionId = h.admissaoId || `adm_${h.id}`;

        // 1. Locate or create financial billing document
        let targetFinancialId = h.financeiroId || h.cobrancaId;
        if (!targetFinancialId) {
          const qCob = query(collection(db, 'financeiro_cobrancas'), where('contratacaoId', '==', h.id));
          const snapCob = await getDocs(qCob);
          if (!snapCob.empty) {
            targetFinancialId = snapCob.docs[0].id;
          } else {
            const directRef = doc(db, 'financeiro_cobrancas', `cob_${h.id}`);
            const directSnap = await getDoc(directRef);
            if (directSnap.exists()) {
              targetFinancialId = directSnap.id;
            } else {
              const qRec = query(collection(db, 'receitas'), where('contratacaoId', '==', h.id));
              const snapRec = await getDocs(qRec);
              if (!snapRec.empty) {
                targetFinancialId = snapRec.docs[0].id;
              }
            }
          }
        }

        // If still not found, create a single billing record
        if (!targetFinancialId) {
          targetFinancialId = `cob_${h.id}`;
          const clientId = h.clientId || h.clienteId || '';
          const clientName = h.clienteNome || h.clientName || 'Cliente Headhunter';
          const candidateName = h.candidatoNome || h.candidateName || 'Candidato';
          const jobTitle = h.vagaTitulo || h.jobTitle || 'Vaga Corporativa';
          const isClientProvided = Boolean(clientId && clientId !== 'cli-001' && clientName !== 'Cliente Headhunter');

          const billingDoc = sanitizeFirestoreData({
            id: targetFinancialId,
            companyId: companyId,
            empresaId: companyId,
            contratacaoId: h.id,
            candidateId: h.candidateId || h.candidatoId || '',
            candidatoId: h.candidateId || h.candidatoId || '',
            applicationId: h.applicationId || h.candidaturaId || h.id,
            candidaturaId: h.applicationId || h.candidaturaId || h.id,
            jobId: h.jobId || h.vagaId || '',
            vagaId: h.jobId || h.vagaId || '',
            clientId: clientId || 'cli-001',
            clienteId: clientId || 'cli-001',
            clienteNome: clientName,
            candidatoNome: candidateName,
            vagaTitulo: jobTitle,
            status: isClientProvided ? "Aguardando Cobrança" : "Pendente de Dados Comerciais",
            valor: h.salarioContratado || h.salarioFinal || h.salario || 0,
            dataContratacao: h.contratadoEm || h.dataContratacao || now,
            createdAt: h.createdAt || now,
            updatedAt: now
          });

          await setDoc(doc(db, 'financeiro_cobrancas', targetFinancialId), billingDoc, { merge: true });
        }

        financialLinkedCount++;

        // 2. Check if solicitacoes_admissao doc exists and cancel if needed
        let wasAdmissionCanceled = false;
        try {
          let admDocRef = doc(db, 'solicitacoes_admissao', existingAdmissionId);
          let admSnap = await getDoc(admDocRef);
          if (!admSnap.exists()) {
            const qAdm = query(collection(db, 'solicitacoes_admissao'), where('contratacaoId', '==', h.id));
            const snapAdm = await getDocs(qAdm);
            if (!snapAdm.empty) {
              admDocRef = doc(db, 'solicitacoes_admissao', snapAdm.docs[0].id);
              admSnap = snapAdm.docs[0];
            }
          }

          if (admSnap.exists()) {
            const admData = admSnap.data();
            if (admData?.status !== 'Cancelada') {
              await setDoc(admDocRef, sanitizeFirestoreData({
                status: "Cancelada",
                motivoCancelamento: "Contratação pertence ao fluxo Headhunter",
                updatedAt: now
              }), { merge: true });
              wasAdmissionCanceled = true;
              canceledAdmissionsCount++;
            }
          }
        } catch (errAdm) {
          console.warn('Aviso ao verificar/cancelar admissão incorreta:', errAdm);
        }

        // 3. Update hiring doc in contratacoes with merge
        const updatedTimeline = [
          ...(h.timeline || []),
          {
            id: `evt-${Date.now()}-mig`,
            title: 'Migrado para Fluxo Headhunter',
            description: 'Ajuste de módulo: contratação redirecionada para Financeiro / Headhunter.',
            date: now.replace('T', ' ').substring(0, 16),
            by: 'Sistema ATS'
          }
        ];

        const updatePayload = sanitizeFirestoreData({
          origemProcesso: "HEADHUNTER",
          destinoContratacao: "FINANCEIRO_HEADHUNTER",
          destinoProcesso: "Financeiro / Headhunter",
          destino: "Financeiro",
          statusProcesso: "Aguardando Cobrança",
          statusFinanceiro: "Aguardando Cobrança",
          statusEncaminhamento: "Aguardando Cobrança",
          encaminhadoPara: "financeiro",
          encaminhadoFinanceiro: true,
          cobrancaId: targetFinancialId,
          financeiroId: targetFinancialId,
          isHeadhunter: true,
          timeline: updatedTimeline,
          updatedAt: now
        });

        // Use updateDoc to also remove DP navigation fields cleanly
        await updateDoc(doc(db, 'contratacoes', h.id), {
          ...updatePayload,
          admissaoId: deleteField(),
          statusAdmissao: deleteField(),
          encaminhadoAdmissao: deleteField(),
          encaminhadoAdmissaoEm: deleteField()
        });

        migratedIds.push(h.id);
        details.push({
          hiringId: h.id,
          candidatoNome: h.candidatoNome || h.candidateName || 'Candidato',
          oldDestino,
          newDestino: 'Financeiro / Headhunter',
          existedAdmissionId: existingAdmissionId,
          wasAdmissionCanceled,
          financialId: targetFinancialId
        });
      }

      return {
        migratedCount: migratedIds.length,
        migratedIds,
        canceledAdmissionsCount,
        financialLinkedCount,
        details
      };
    } catch (err) {
      console.error('Erro na migração de contratações incompatíveis:', err);
      return { migratedCount: 0, migratedIds: [], canceledAdmissionsCount: 0, financialLinkedCount: 0, details: [] };
    }
  }
}

