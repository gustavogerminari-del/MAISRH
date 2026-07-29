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
import { Candidate } from '../types/rh';
import { INITIAL_CANDIDATES } from '../data/initialData';
import { AuditService } from './AuditService';

const COLLECTION_NAME = 'candidates';
const APPLICATIONS_COLLECTION = 'applications';

export interface ApplicationDoc {
  id: string;
  companyId: string;
  jobId: string;
  candidateId: string;
  stage: string;
  rating?: number;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

export class CandidateService {
  static async create(candidateData: Partial<Candidate> & { companyId?: string }): Promise<Candidate> {
    const id = candidateData.id || `cand-${Date.now()}`;
    const user = auth.currentUser;
    const now = new Date().toISOString().split('T')[0];
    const companyId = candidateData.companyId || 'emp-001';

    const candidate: Candidate & { companyId: string; createdBy: string; createdAt: string; updatedAt: string } = {
      id,
      name: candidateData.name || 'Novo Candidato',
      email: candidateData.email || 'candidato@email.com',
      phone: candidateData.phone || '(11) 99999-9999',
      role: candidateData.role || 'Desenvolvedor',
      location: candidateData.location || 'São Paulo - SP',
      experienceYears: candidateData.experienceYears || 3,
      skills: candidateData.skills || ['React', 'TypeScript'],
      status: candidateData.status || 'Em Processo',
      currentJobId: candidateData.currentJobId || 'vaga-1',
      currentStageId: candidateData.currentStageId || 'triagem',
      rating: candidateData.rating || 4,
      notes: candidateData.notes || 'Candidato promissor',
      avatar: candidateData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      appliedDate: candidateData.appliedDate || now,
      source: candidateData.source || 'LinkedIn',
      salaryExpectation: candidateData.salaryExpectation || 'A combinar',
      companyId,
      createdBy: user?.uid || 'system',
      createdAt: now,
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, COLLECTION_NAME, id), sanitizeFirestoreData(candidate), { merge: true });
      await AuditService.log({
        action: 'CREATE',
        description: `Candidato ${candidate.name} cadastrado no Banco de Talentos`,
        moduleName: 'Banco de Talentos',
        targetEntity: 'Candidato',
        companyId
      });
    } catch (err) {
      console.warn('Erro ao salvar candidato no Firestore:', err);
    }

    return candidate;
  }

  static async update(id: string, data: Partial<Candidate>): Promise<void> {
    try {
      await setDoc(doc(db, COLLECTION_NAME, id), sanitizeFirestoreData({
        ...data,
        updatedAt: new Date().toISOString()
      }), { merge: true });

      await AuditService.log({
        action: 'UPDATE',
        description: `Candidato ${id} atualizado`,
        moduleName: 'Banco de Talentos',
        targetEntity: 'Candidato'
      });
    } catch (err) {
      console.warn('Erro ao atualizar candidato no Firestore:', err);
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      await AuditService.log({
        action: 'DELETE',
        description: `Candidato ${id} excluído do Banco de Talentos`,
        moduleName: 'Banco de Talentos',
        targetEntity: 'Candidato'
      });
    } catch (err) {
      console.warn('Erro ao excluir candidato no Firestore:', err);
    }
  }

  static async getById(id: string): Promise<Candidate | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION_NAME, id));
      if (snap.exists()) {
        return snap.data() as Candidate;
      }
    } catch (err) {
      console.warn('Erro em CandidateService.getById:', err);
    }
    return INITIAL_CANDIDATES.find(c => c.id === id) || null;
  }

  static async get(id: string): Promise<Candidate | null> {
    return this.getById(id);
  }

  static async list(companyId?: string): Promise<Candidate[]> {
    try {
      const q = companyId 
        ? query(collection(db, COLLECTION_NAME), where('companyId', '==', companyId))
        : collection(db, COLLECTION_NAME);
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list: Candidate[] = [];
        snap.forEach(d => list.push(d.data() as Candidate));
        return list;
      }
    } catch (err) {
      console.warn('Erro em CandidateService.list:', err);
    }
    return INITIAL_CANDIDATES;
  }

  static async search(term: string, companyId?: string): Promise<Candidate[]> {
    const all = await this.list(companyId);
    const lower = term.toLowerCase();
    return all.filter(c => 
      c.name.toLowerCase().includes(lower) || 
      c.email.toLowerCase().includes(lower) ||
      (c.role && c.role.toLowerCase().includes(lower)) ||
      c.skills.some(s => s.toLowerCase().includes(lower))
    );
  }

  static async count(companyId?: string): Promise<number> {
    const all = await this.list(companyId);
    return all.length;
  }

  static async paginate(page: number, pageSize: number, companyId?: string): Promise<{ items: Candidate[]; total: number }> {
    const all = await this.list(companyId);
    const start = (page - 1) * pageSize;
    return {
      items: all.slice(start, start + pageSize),
      total: all.length
    };
  }

  // CANDIDATURAS
  static async createApplication(app: Partial<ApplicationDoc>): Promise<ApplicationDoc> {
    const id = app.id || `app-${Date.now()}`;
    const user = auth.currentUser;
    const now = new Date().toISOString();

    const applicationDoc: ApplicationDoc = {
      id,
      companyId: app.companyId || 'emp-001',
      jobId: app.jobId || 'vaga-1',
      candidateId: app.candidateId || 'cand-1',
      stage: app.stage || 'triagem',
      rating: app.rating || 3,
      notes: app.notes || '',
      createdBy: user?.uid || 'candidate',
      createdAt: now,
      updatedAt: now,
      status: 'Em Análise'
    };

    try {
      await setDoc(doc(db, APPLICATIONS_COLLECTION, id), sanitizeFirestoreData(applicationDoc), { merge: true });
    } catch (err) {
      console.warn('Erro ao salvar candidatura no Firestore:', err);
    }

    return applicationDoc;
  }

  static async getApplicationsForJob(jobId: string): Promise<ApplicationDoc[]> {
    try {
      const q = query(collection(db, APPLICATIONS_COLLECTION), where('jobId', '==', jobId));
      const snap = await getDocs(q);
      const list: ApplicationDoc[] = [];
      snap.forEach(d => list.push(d.data() as ApplicationDoc));
      return list;
    } catch (err) {
      console.warn('Erro ao buscar candidaturas no Firestore:', err);
      return [];
    }
  }
}
