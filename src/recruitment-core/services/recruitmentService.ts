import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { sanitizeFirestoreData } from '../../lib/firestoreUtils';
import { 
  UnifiedJob, 
  UnifiedCandidate, 
  UnifiedCandidateProcess, 
  UnifiedInterview, 
  UnifiedAgendaEvent, 
  UnifiedHiring, 
  OrigemProcesso,
  ProcessStage 
} from '../types/recruitment';

const COLLECTIONS = {
  JOBS: 'vagas',
  CANDIDATES: 'candidatos',
  PROCESSES: 'candidaturas',
  INTERVIEWS: 'entrevistas',
  AGENDA: 'agenda',
  HIRINGS: 'contratacoes'
};

// In-memory cache for immediate synchronous initial renders
let jobsCache: UnifiedJob[] = [];
let candidatesCache: UnifiedCandidate[] = [];
let interviewsCache: UnifiedInterview[] = [];
let agendaCache: UnifiedAgendaEvent[] = [];
let hiringsCache: UnifiedHiring[] = [];
let processesCache: UnifiedCandidateProcess[] = [];

let isInitialized = false;

// Async background loader to sync with Firestore
export async function syncRecruitmentWithFirestore(): Promise<void> {
  try {
    const jobsSnap = await getDocs(collection(db, COLLECTIONS.JOBS));
    if (!jobsSnap.empty) {
      jobsCache = jobsSnap.docs.map(d => ({ id: d.id, ...d.data() } as UnifiedJob));
    }

    const candSnap = await getDocs(collection(db, COLLECTIONS.CANDIDATES));
    if (!candSnap.empty) {
      candidatesCache = candSnap.docs.map(d => ({ id: d.id, ...d.data() } as UnifiedCandidate));
    }

    const intSnap = await getDocs(collection(db, COLLECTIONS.INTERVIEWS));
    if (!intSnap.empty) {
      interviewsCache = intSnap.docs.map(d => ({ id: d.id, ...d.data() } as UnifiedInterview));
    }

    const ageSnap = await getDocs(collection(db, COLLECTIONS.AGENDA));
    if (!ageSnap.empty) {
      agendaCache = ageSnap.docs.map(d => ({ id: d.id, ...d.data() } as UnifiedAgendaEvent));
    }

    const hirSnap = await getDocs(collection(db, COLLECTIONS.HIRINGS));
    if (!hirSnap.empty) {
      hiringsCache = hirSnap.docs.map(d => ({ id: d.id, ...d.data() } as UnifiedHiring));
    }

    const procSnap = await getDocs(collection(db, COLLECTIONS.PROCESSES));
    if (!procSnap.empty) {
      processesCache = procSnap.docs.map(d => ({ id: d.id, ...d.data() } as UnifiedCandidateProcess));
    }

    isInitialized = true;
  } catch (err) {
    console.warn('Firestore sync note:', err);
  }
}

// Trigger initial sync on module load
syncRecruitmentWithFirestore();

export class RecruitmentService {
  // JOBS
  static getJobs(companyId: string = 'emp-001', origem?: OrigemProcesso): UnifiedJob[] {
    return jobsCache.filter(j => {
      const matchesCompany = !companyId || j.empresaId === companyId || companyId === 'emp-001';
      const matchesOrigem = !origem || j.origemProcesso === origem;
      return matchesCompany && matchesOrigem;
    });
  }

  static async createJob(job: UnifiedJob): Promise<UnifiedJob> {
    const id = job.id || `vaga-${Date.now()}`;
    const newJob: UnifiedJob = {
      ...job,
      id,
      empresaId: job.empresaId || 'emp-001',
      dataCriacao: job.dataCriacao || new Date().toISOString(),
      status: job.status || 'Aberta'
    };

    // Update Cache
    jobsCache = [newJob, ...jobsCache.filter(j => j.id !== id)];

    // Persist to Firestore
    try {
      await setDoc(doc(db, COLLECTIONS.JOBS, id), sanitizeFirestoreData(newJob), { merge: true });
    } catch (err) {
      console.error('Erro ao salvar vaga no Firestore:', err);
    }

    return newJob;
  }

  static async updateJob(job: UnifiedJob): Promise<UnifiedJob> {
    return this.createJob(job);
  }

  static async deleteJob(jobId: string): Promise<void> {
    jobsCache = jobsCache.filter(j => j.id !== jobId);
    try {
      await deleteDoc(doc(db, COLLECTIONS.JOBS, jobId));
    } catch (err) {
      console.error('Erro ao remover vaga do Firestore:', err);
    }
  }

  // CANDIDATES
  static getCandidates(companyId: string = 'emp-001', origem?: OrigemProcesso): UnifiedCandidate[] {
    return candidatesCache.filter(c => !companyId || c.empresaId === companyId || companyId === 'emp-001');
  }

  static async createCandidate(candidate: UnifiedCandidate): Promise<UnifiedCandidate> {
    const id = candidate.id || `cand-${Date.now()}`;
    const newCandidate: UnifiedCandidate = {
      ...candidate,
      id,
      empresaId: candidate.empresaId || 'emp-001',
      status: candidate.status || 'Ativo'
    };

    candidatesCache = [newCandidate, ...candidatesCache.filter(c => c.id !== id)];

    try {
      await setDoc(doc(db, COLLECTIONS.CANDIDATES, id), sanitizeFirestoreData(newCandidate), { merge: true });
    } catch (err) {
      console.error('Erro ao salvar candidato no Firestore:', err);
    }

    return newCandidate;
  }

  static async updateCandidate(candidate: UnifiedCandidate): Promise<UnifiedCandidate> {
    return this.createCandidate(candidate);
  }

  static async deleteCandidate(candidateId: string): Promise<void> {
    candidatesCache = candidatesCache.filter(c => c.id !== candidateId);
    try {
      await deleteDoc(doc(db, COLLECTIONS.CANDIDATES, candidateId));
    } catch (err) {
      console.error('Erro ao remover candidato do Firestore:', err);
    }
  }

  static async linkCandidateToJob(candidateId: string, jobId: string, origem: OrigemProcesso = 'recrutamento_interno'): Promise<void> {
    const cand = candidatesCache.find(c => c.id === candidateId);
    if (cand) {
      cand.currentJobId = jobId;
      cand.currentStageId = 'Triagem';
      await this.updateCandidate(cand);
    }

    const job = jobsCache.find(j => j.id === jobId);
    if (job) {
      const existing = job.candidatosIds || [];
      if (!existing.includes(candidateId)) {
        job.candidatosIds = [...existing, candidateId];
        await this.updateJob(job);
      }
    }
  }

  static async moveCandidateStage(candidateId: string, newStage: ProcessStage): Promise<void> {
    const cand = candidatesCache.find(c => c.id === candidateId);
    if (cand) {
      cand.currentStageId = newStage;
      cand.status = newStage === 'Contratado' ? 'Contratado' : 'Em Processo';
      await this.updateCandidate(cand);
    }
  }

  // INTERVIEWS
  static getInterviews(companyId: string = 'emp-001', origem?: OrigemProcesso): UnifiedInterview[] {
    return interviewsCache.filter(i => {
      const matchesCompany = !companyId || i.empresaId === companyId || companyId === 'emp-001';
      const matchesOrigem = !origem || i.origemProcesso === origem;
      return matchesCompany && matchesOrigem;
    });
  }

  static async createInterview(interview: UnifiedInterview): Promise<UnifiedInterview> {
    const id = interview.id || `int-${Date.now()}`;
    const newInt: UnifiedInterview = {
      ...interview,
      id,
      empresaId: interview.empresaId || 'emp-001',
      status: interview.status || 'Agendada'
    };

    interviewsCache = [newInt, ...interviewsCache.filter(i => i.id !== id)];

    try {
      await setDoc(doc(db, COLLECTIONS.INTERVIEWS, id), sanitizeFirestoreData(newInt), { merge: true });
    } catch (err) {
      console.error('Erro ao salvar entrevista no Firestore:', err);
    }

    return newInt;
  }

  static async updateInterview(interview: UnifiedInterview): Promise<UnifiedInterview> {
    return this.createInterview(interview);
  }

  static async deleteInterview(interviewId: string): Promise<void> {
    interviewsCache = interviewsCache.filter(i => i.id !== interviewId);
    try {
      await deleteDoc(doc(db, COLLECTIONS.INTERVIEWS, interviewId));
    } catch (err) {
      console.error('Erro ao excluir entrevista no Firestore:', err);
    }
  }

  // AGENDA
  static getAgendaEvents(companyId: string = 'emp-001', origem?: OrigemProcesso): UnifiedAgendaEvent[] {
    return agendaCache.filter(e => {
      const matchesCompany = !companyId || e.empresaId === companyId || companyId === 'emp-001';
      const matchesOrigem = !origem || e.origemProcesso === origem;
      return matchesCompany && matchesOrigem;
    });
  }

  static async createAgendaEvent(event: UnifiedAgendaEvent): Promise<UnifiedAgendaEvent> {
    const id = event.id || `evt-${Date.now()}`;
    const newEvt: UnifiedAgendaEvent = {
      ...event,
      id,
      empresaId: event.empresaId || 'emp-001'
    };

    agendaCache = [newEvt, ...agendaCache.filter(e => e.id !== id)];

    try {
      await setDoc(doc(db, COLLECTIONS.AGENDA, id), sanitizeFirestoreData(newEvt), { merge: true });
    } catch (err) {
      console.error('Erro ao salvar evento da agenda no Firestore:', err);
    }

    return newEvt;
  }

  // HIRINGS
  static getHirings(companyId: string = 'emp-001', origem?: OrigemProcesso): UnifiedHiring[] {
    return hiringsCache.filter(h => {
      const matchesCompany = !companyId || h.empresaId === companyId || companyId === 'emp-001';
      const matchesOrigem = !origem || h.origemProcesso === origem;
      return matchesCompany && matchesOrigem;
    });
  }

  static async createHiring(hiring: UnifiedHiring): Promise<UnifiedHiring> {
    const id = hiring.id || `hir-${Date.now()}`;
    const newHir: UnifiedHiring = {
      ...hiring,
      id,
      empresaId: hiring.empresaId || 'emp-001',
      status: hiring.status || 'Concluído'
    };

    hiringsCache = [newHir, ...hiringsCache.filter(h => h.id !== id)];

    try {
      await setDoc(doc(db, COLLECTIONS.HIRINGS, id), sanitizeFirestoreData(newHir), { merge: true });
    } catch (err) {
      console.error('Erro ao salvar contratação no Firestore:', err);
    }

    return newHir;
  }
}

export const recruitmentService = {
  getJobs: (origem?: OrigemProcesso, companyId = 'emp-001') => RecruitmentService.getJobs(companyId, origem),
  saveJob: (job: UnifiedJob) => RecruitmentService.createJob(job),
  createJob: (job: UnifiedJob) => RecruitmentService.createJob(job),
  updateJob: (job: UnifiedJob) => RecruitmentService.updateJob(job),
  deleteJob: (id: string) => RecruitmentService.deleteJob(id),

  getCandidates: (origem?: OrigemProcesso, companyId = 'emp-001') => RecruitmentService.getCandidates(companyId, origem),
  saveCandidate: (cand: UnifiedCandidate) => RecruitmentService.createCandidate(cand),
  createCandidate: (cand: UnifiedCandidate) => RecruitmentService.createCandidate(cand),
  updateCandidate: (cand: UnifiedCandidate) => RecruitmentService.updateCandidate(cand),
  deleteCandidate: (id: string) => RecruitmentService.deleteCandidate(id),
  linkCandidateToJob: (candId: string, jobId: string, origem?: OrigemProcesso) => RecruitmentService.linkCandidateToJob(candId, jobId, origem),
  moveCandidateStage: (candId: string, stage: ProcessStage) => RecruitmentService.moveCandidateStage(candId, stage),

  getInterviews: (origem?: OrigemProcesso, companyId = 'emp-001') => RecruitmentService.getInterviews(companyId, origem),
  saveInterview: (int: UnifiedInterview) => RecruitmentService.createInterview(int),
  createInterview: (int: UnifiedInterview) => RecruitmentService.createInterview(int),
  updateInterview: (int: UnifiedInterview) => RecruitmentService.updateInterview(int),
  deleteInterview: (id: string) => RecruitmentService.deleteInterview(id),

  getAgendaEvents: (origem?: OrigemProcesso, companyId = 'emp-001') => RecruitmentService.getAgendaEvents(companyId, origem),
  saveAgendaEvent: (evt: UnifiedAgendaEvent) => RecruitmentService.createAgendaEvent(evt),
  createAgendaEvent: (evt: UnifiedAgendaEvent) => RecruitmentService.createAgendaEvent(evt),

  getHirings: (origem?: OrigemProcesso, companyId = 'emp-001') => RecruitmentService.getHirings(companyId, origem),
  saveHiring: (hir: UnifiedHiring) => RecruitmentService.createHiring(hir),
  createHiring: (hir: UnifiedHiring) => RecruitmentService.createHiring(hir),
};


