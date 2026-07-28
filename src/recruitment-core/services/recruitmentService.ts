import { 
  UnifiedJob, 
  UnifiedCandidate, 
  UnifiedCandidateProcess, 
  UnifiedInterview, 
  UnifiedAgendaEvent, 
  UnifiedHiring, 
  OrigemProcesso 
} from '../types/recruitment';

const STORAGE_KEYS = {
  JOBS: 'mais_rh_unified_jobs_v2',
  CANDIDATES: 'mais_rh_unified_candidates_v2',
  PROCESSES: 'mais_rh_unified_processes_v2',
  INTERVIEWS: 'mais_rh_unified_interviews_v2',
  AGENDA: 'mais_rh_unified_agenda_v2',
  HIRINGS: 'mais_rh_unified_hirings_v2'
};

export class RecruitmentService {
  // JOBS
  static getJobs(companyId: string, origem?: OrigemProcesso): UnifiedJob[] {
    const raw = localStorage.getItem(STORAGE_KEYS.JOBS);
    if (!raw) return [];
    try {
      const all: UnifiedJob[] = JSON.parse(raw);
      return all.filter(j => {
        const matchesCompany = !companyId || j.empresaId === companyId || companyId === 'emp-001';
        const matchesOrigem = !origem || j.origemProcesso === origem;
        return matchesCompany && matchesOrigem;
      });
    } catch {
      return [];
    }
  }

  static saveJob(job: UnifiedJob): UnifiedJob {
    const raw = localStorage.getItem(STORAGE_KEYS.JOBS);
    let all: UnifiedJob[] = raw ? JSON.parse(raw) : [];
    const index = all.findIndex(j => j.id === job.id);
    if (index >= 0) {
      all[index] = { ...all[index], ...job, atualizadoEm: new Date().toISOString() };
    } else {
      all.unshift(job);
    }
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(all));
    return job;
  }

  // CANDIDATES
  static getCandidates(companyId: string): UnifiedCandidate[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
    if (!raw) return [];
    try {
      const all: UnifiedCandidate[] = JSON.parse(raw);
      return all.filter(c => !companyId || c.empresaId === companyId || companyId === 'emp-001');
    } catch {
      return [];
    }
  }

  static saveCandidate(candidate: UnifiedCandidate): UnifiedCandidate {
    const raw = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
    let all: UnifiedCandidate[] = raw ? JSON.parse(raw) : [];
    const index = all.findIndex(c => c.id === candidate.id);
    if (index >= 0) {
      all[index] = { ...all[index], ...candidate };
    } else {
      all.unshift(candidate);
    }
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(all));
    return candidate;
  }

  // INTERVIEWS
  static getInterviews(companyId: string, origem?: OrigemProcesso): UnifiedInterview[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INTERVIEWS);
    if (!raw) return [];
    try {
      const all: UnifiedInterview[] = JSON.parse(raw);
      return all.filter(i => {
        const matchesCompany = !companyId || i.empresaId === companyId || companyId === 'emp-001';
        const matchesOrigem = !origem || i.origemProcesso === origem;
        return matchesCompany && matchesOrigem;
      });
    } catch {
      return [];
    }
  }

  static saveInterview(interview: UnifiedInterview): UnifiedInterview {
    const raw = localStorage.getItem(STORAGE_KEYS.INTERVIEWS);
    let all: UnifiedInterview[] = raw ? JSON.parse(raw) : [];
    const index = all.findIndex(i => i.id === interview.id);
    if (index >= 0) {
      all[index] = { ...all[index], ...interview };
    } else {
      all.unshift(interview);
    }
    localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(all));
    return interview;
  }

  // AGENDA
  static getAgendaEvents(companyId: string, origem?: OrigemProcesso): UnifiedAgendaEvent[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AGENDA);
    if (!raw) return [];
    try {
      const all: UnifiedAgendaEvent[] = JSON.parse(raw);
      return all.filter(e => {
        const matchesCompany = !companyId || e.empresaId === companyId || companyId === 'emp-001';
        const matchesOrigem = !origem || e.origemProcesso === origem;
        return matchesCompany && matchesOrigem;
      });
    } catch {
      return [];
    }
  }

  static saveAgendaEvent(event: UnifiedAgendaEvent): UnifiedAgendaEvent {
    const raw = localStorage.getItem(STORAGE_KEYS.AGENDA);
    let all: UnifiedAgendaEvent[] = raw ? JSON.parse(raw) : [];
    const index = all.findIndex(e => e.id === event.id);
    if (index >= 0) {
      all[index] = { ...all[index], ...event };
    } else {
      all.unshift(event);
    }
    localStorage.setItem(STORAGE_KEYS.AGENDA, JSON.stringify(all));
    return event;
  }

  // HIRINGS
  static getHirings(companyId: string, origem?: OrigemProcesso): UnifiedHiring[] {
    const raw = localStorage.getItem(STORAGE_KEYS.HIRINGS);
    if (!raw) return [];
    try {
      const all: UnifiedHiring[] = JSON.parse(raw);
      return all.filter(h => {
        const matchesCompany = !companyId || h.empresaId === companyId || companyId === 'emp-001';
        const matchesOrigem = !origem || h.origemProcesso === origem;
        return matchesCompany && matchesOrigem;
      });
    } catch {
      return [];
    }
  }

  static saveHiring(hiring: UnifiedHiring): UnifiedHiring {
    const raw = localStorage.getItem(STORAGE_KEYS.HIRINGS);
    let all: UnifiedHiring[] = raw ? JSON.parse(raw) : [];
    const index = all.findIndex(h => h.id === hiring.id);
    if (index >= 0) {
      all[index] = { ...all[index], ...hiring };
    } else {
      all.unshift(hiring);
    }
    localStorage.setItem(STORAGE_KEYS.HIRINGS, JSON.stringify(all));
    return hiring;
  }
}

export const recruitmentService = {
  getJobs: (origem?: OrigemProcesso, companyId = 'emp-001') => RecruitmentService.getJobs(companyId, origem),
  saveJob: (job: UnifiedJob) => RecruitmentService.saveJob(job),
  getCandidates: (origem?: OrigemProcesso, companyId = 'emp-001') => RecruitmentService.getCandidates(companyId),
  saveCandidate: (cand: UnifiedCandidate) => RecruitmentService.saveCandidate(cand),
  getInterviews: (origem?: OrigemProcesso, companyId = 'emp-001') => RecruitmentService.getInterviews(companyId, origem),
  saveInterview: (int: UnifiedInterview) => RecruitmentService.saveInterview(int),
  getAgendaEvents: (origem?: OrigemProcesso, companyId = 'emp-001') => RecruitmentService.getAgendaEvents(companyId, origem),
  saveAgendaEvent: (evt: UnifiedAgendaEvent) => RecruitmentService.saveAgendaEvent(evt),
  getHirings: (origem?: OrigemProcesso, companyId = 'emp-001') => RecruitmentService.getHirings(companyId, origem),
  saveHiring: (hir: UnifiedHiring) => RecruitmentService.saveHiring(hir),
};

