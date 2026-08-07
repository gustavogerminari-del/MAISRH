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
import { 
  sanitizeFirestoreData, 
  safeFirestoreRead, 
  safeFirestoreWrite, 
  OperationType 
} from '../../lib/firestoreUtils';
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
  JOBS_PRIMARY: 'vagas',
  JOBS_SECONDARY: 'jobs',
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
    const jobMap = new Map<string, UnifiedJob>();

    // Load from 'vagas'
    const vagasRead = await safeFirestoreRead(
      async () => {
        const snap = await getDocs(collection(db, COLLECTIONS.JOBS_PRIMARY));
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as UnifiedJob));
      },
      OperationType.LIST,
      COLLECTIONS.JOBS_PRIMARY,
      []
    );
    vagasRead.data.forEach(j => jobMap.set(j.id, j));

    // Load from 'jobs'
    const jobsRead = await safeFirestoreRead(
      async () => {
        const snap = await getDocs(collection(db, COLLECTIONS.JOBS_SECONDARY));
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as UnifiedJob));
      },
      OperationType.LIST,
      COLLECTIONS.JOBS_SECONDARY,
      []
    );
    jobsRead.data.forEach(j => {
      if (!jobMap.has(j.id)) jobMap.set(j.id, j);
    });

    if (jobMap.size > 0) {
      jobsCache = Array.from(jobMap.values());
    }

    const candsRead = await safeFirestoreRead(
      async () => {
        const snap = await getDocs(collection(db, COLLECTIONS.CANDIDATES));
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as UnifiedCandidate));
      },
      OperationType.LIST,
      COLLECTIONS.CANDIDATES,
      []
    );
    if (candsRead.data.length > 0) candidatesCache = candsRead.data;

    const intsRead = await safeFirestoreRead(
      async () => {
        const snap = await getDocs(collection(db, COLLECTIONS.INTERVIEWS));
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as UnifiedInterview));
      },
      OperationType.LIST,
      COLLECTIONS.INTERVIEWS,
      []
    );
    if (intsRead.data.length > 0) interviewsCache = intsRead.data;

    const ageRead = await safeFirestoreRead(
      async () => {
        const snap = await getDocs(collection(db, COLLECTIONS.AGENDA));
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as UnifiedAgendaEvent));
      },
      OperationType.LIST,
      COLLECTIONS.AGENDA,
      []
    );
    if (ageRead.data.length > 0) agendaCache = ageRead.data;

    const hirRead = await safeFirestoreRead(
      async () => {
        const snap = await getDocs(collection(db, COLLECTIONS.HIRINGS));
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as UnifiedHiring));
      },
      OperationType.LIST,
      COLLECTIONS.HIRINGS,
      []
    );
    if (hirRead.data.length > 0) hiringsCache = hirRead.data;

    const procRead = await safeFirestoreRead(
      async () => {
        const snap = await getDocs(collection(db, COLLECTIONS.PROCESSES));
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as UnifiedCandidateProcess));
      },
      OperationType.LIST,
      COLLECTIONS.PROCESSES,
      []
    );
    if (procRead.data.length > 0) processesCache = procRead.data;

    isInitialized = true;
  } catch (err) {
    console.warn('Firestore sync note:', err);
  }
}

// Trigger initial sync on module load
syncRecruitmentWithFirestore();

export class RecruitmentService {
  // JOBS
  static getJobs(companyId?: string, origem?: OrigemProcesso): UnifiedJob[] {
    return jobsCache.filter(j => {
      const cId = j.empresaId || j.companyId || (j as any).tenantId;
      const matchesCompany = !companyId || companyId === 'headhunter' || companyId === 'recrutamento' || !cId || cId === companyId || cId === 'emp-001';
      const matchesOrigem = !origem || j.origemProcesso === origem;
      return matchesCompany && matchesOrigem;
    });
  }

  static async createJob(job: UnifiedJob): Promise<UnifiedJob> {
    const id = job.id || `vaga-${Date.now()}`;
    const rawOrigem = (job.origemProcesso || job.origem || '').toString().toLowerCase();

    let resolvedOrigem: 'vaga_interna' | 'recrutamento_cliente' | 'headhunter' = 'vaga_interna';
    if (rawOrigem.includes('headhunter') || job.isHeadhunter || job.projetoHeadhunter) {
      resolvedOrigem = 'headhunter';
    } else if (rawOrigem.includes('cliente') || job.clienteNome) {
      resolvedOrigem = 'recrutamento_cliente';
    }

    const isHeadhunter = resolvedOrigem === 'headhunter';
    const isClient = resolvedOrigem === 'recrutamento_cliente';

    const newJob: UnifiedJob = {
      ...job,
      id,
      empresaId: job.empresaId || job.companyId || 'emp-001',
      companyId: job.companyId || job.empresaId || 'emp-001',
      origem: resolvedOrigem,
      origemProcesso: resolvedOrigem as any,
      tipoProcesso: isHeadhunter ? 'busca_ativa' : isClient ? 'cliente' : 'interno',
      projetoHeadhunter: isHeadhunter,
      isHeadhunter: isHeadhunter,
      dataCriacao: job.dataCriacao || job.createdAt || new Date().toISOString().split('T')[0],
      status: job.status || 'Aberta'
    };

    // Update Cache
    jobsCache = [newJob, ...jobsCache.filter(j => j.id !== id)];

    // Persist to both Firestore collections
    const sanitized = sanitizeFirestoreData(newJob);
    await safeFirestoreWrite(
      async () => {
        await Promise.all([
          setDoc(doc(db, COLLECTIONS.JOBS_PRIMARY, id), sanitized, { merge: true }),
          setDoc(doc(db, COLLECTIONS.JOBS_SECONDARY, id), sanitized, { merge: true })
        ]);
      },
      OperationType.WRITE,
      `${COLLECTIONS.JOBS_PRIMARY}/${id}`
    );

    return newJob;
  }

  static async updateJob(job: UnifiedJob): Promise<UnifiedJob> {
    return this.createJob(job);
  }

  static async saveJob(job: UnifiedJob): Promise<UnifiedJob> {
    return this.createJob(job);
  }

  static async deleteJob(jobId: string): Promise<void> {
    jobsCache = jobsCache.filter(j => j.id !== jobId);
    await safeFirestoreWrite(
      async () => {
        await Promise.all([
          deleteDoc(doc(db, COLLECTIONS.JOBS_PRIMARY, jobId)),
          deleteDoc(doc(db, COLLECTIONS.JOBS_SECONDARY, jobId))
        ]);
      },
      OperationType.DELETE,
      `${COLLECTIONS.JOBS_PRIMARY}/${jobId}`
    );
  }

  // CANDIDATES
  static getCandidates(companyId: string = 'emp-001', origem?: OrigemProcesso): UnifiedCandidate[] {
    return candidatesCache.filter(c => !companyId || c.empresaId === companyId || companyId === 'emp-001' || companyId === 'headhunter' || companyId === 'recrutamento');
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

    await safeFirestoreWrite(
      async () => {
        await setDoc(doc(db, COLLECTIONS.CANDIDATES, id), sanitizeFirestoreData(newCandidate), { merge: true });
      },
      OperationType.WRITE,
      `${COLLECTIONS.CANDIDATES}/${id}`
    );

    return newCandidate;
  }

  static async updateCandidate(candidate: UnifiedCandidate): Promise<UnifiedCandidate> {
    return this.createCandidate(candidate);
  }

  static async saveCandidate(candidate: UnifiedCandidate): Promise<UnifiedCandidate> {
    return this.createCandidate(candidate);
  }

  static async deleteCandidate(candidateId: string): Promise<void> {
    candidatesCache = candidatesCache.filter(c => c.id !== candidateId);
    await safeFirestoreWrite(
      async () => {
        await deleteDoc(doc(db, COLLECTIONS.CANDIDATES, candidateId));
      },
      OperationType.DELETE,
      `${COLLECTIONS.CANDIDATES}/${candidateId}`
    );
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
      const matchesCompany = !companyId || i.empresaId === companyId || companyId === 'emp-001' || companyId === 'headhunter' || companyId === 'recrutamento';
      const matchesOrigem = !origem || i.origemProcesso === origem;
      return matchesCompany && matchesOrigem;
    });
  }

  static async createInterview(interview: UnifiedInterview): Promise<UnifiedInterview> {
    const id = interview.id || `int-${Date.now()}`;
    const newInterview: UnifiedInterview = {
      ...interview,
      id,
      empresaId: interview.empresaId || 'emp-001'
    };

    interviewsCache = [newInterview, ...interviewsCache.filter(i => i.id !== id)];

    try {
      await setDoc(doc(db, COLLECTIONS.INTERVIEWS, id), sanitizeFirestoreData(newInterview), { merge: true });
    } catch (err) {
      console.error('Erro ao salvar entrevista no Firestore:', err);
    }

    return newInterview;
  }

  // HIRINGS
  static getHirings(companyId: string = 'emp-001', origem?: OrigemProcesso): UnifiedHiring[] {
    return hiringsCache.filter(h => !companyId || h.empresaId === companyId || companyId === 'emp-001' || companyId === 'headhunter' || companyId === 'recrutamento');
  }

  static async createHiring(hiring: UnifiedHiring): Promise<UnifiedHiring> {
    const id = hiring.id || `hir-${Date.now()}`;
    const newHiring: UnifiedHiring = {
      ...hiring,
      id,
      empresaId: hiring.empresaId || 'emp-001'
    };

    hiringsCache = [newHiring, ...hiringsCache.filter(h => h.id !== id)];

    try {
      await setDoc(doc(db, COLLECTIONS.HIRINGS, id), sanitizeFirestoreData(newHiring), { merge: true });
    } catch (err) {
      console.error('Erro ao salvar contratação no Firestore:', err);
    }

    return newHiring;
  }

  // AGENDA
  static getAgendaEvents(companyId: string = 'emp-001', origem?: OrigemProcesso): UnifiedAgendaEvent[] {
    return agendaCache.filter(a => !companyId || a.empresaId === companyId || companyId === 'emp-001' || companyId === 'headhunter' || companyId === 'recrutamento');
  }

  static async createAgendaEvent(event: UnifiedAgendaEvent): Promise<UnifiedAgendaEvent> {
    const id = event.id || `evt-${Date.now()}`;
    const newEvent: UnifiedAgendaEvent = {
      ...event,
      id,
      empresaId: event.empresaId || 'emp-001'
    };

    agendaCache = [newEvent, ...agendaCache.filter(a => a.id !== id)];

    try {
      await setDoc(doc(db, COLLECTIONS.AGENDA, id), sanitizeFirestoreData(newEvent), { merge: true });
    } catch (err) {
      console.error('Erro ao salvar evento da agenda no Firestore:', err);
    }

    return newEvent;
  }
}

export const recruitmentService = RecruitmentService;
