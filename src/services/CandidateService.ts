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
import { sanitizeFirestoreData, resolveEmpresaId } from '../lib/firestoreUtils';
import { Candidate } from '../types/rh';
import { AuditService } from './AuditService';

const COLLECTION_NAME = 'candidates';
const APPLICATIONS_COLLECTION = 'applications';

export interface ApplicationDoc {
  id: string;
  empresaId: string;
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
  static async create(candidateData: Partial<Candidate> & { empresaId?: string; companyId?: string }): Promise<Candidate> {
    const id = candidateData.id || `cand-${Date.now()}`;
    const user = auth.currentUser;
    const now = new Date().toISOString().split('T')[0];
    const resolvedEmpresaId = resolveEmpresaId(candidateData.empresaId || candidateData.companyId);

    const candidate: Candidate & { empresaId: string; companyId: string; createdBy: string; createdAt: string; updatedAt: string } = {
      id,
      name: candidateData.name || 'Novo Candidato',
      email: candidateData.email || 'candidato@email.com',
      phone: candidateData.phone || '(11) 99999-9999',
      role: candidateData.role || 'Desenvolvedor',
      location: candidateData.location || 'São Paulo - SP',
      experienceYears: candidateData.experienceYears || 3,
      skills: candidateData.skills || ['React', 'TypeScript'],
      status: candidateData.status || 'Em Processo',
      currentJobId: candidateData.currentJobId || '',
      currentStageId: candidateData.currentStageId || 'triagem',
      rating: candidateData.rating || 4,
      notes: candidateData.notes || 'Candidato cadastrado',
      avatar: candidateData.avatar || '',
      appliedDate: candidateData.appliedDate || now,
      source: candidateData.source || 'Site Institucional',
      salaryExpectation: candidateData.salaryExpectation || 'A combinar',
      empresaId: resolvedEmpresaId,
      companyId: resolvedEmpresaId,
      createdBy: user?.uid || 'system',
      createdAt: now,
      updatedAt: new Date().toISOString()
    };

    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, sanitizeFirestoreData(candidate), { merge: true });

    await AuditService.log({
      action: 'CREATE',
      description: `Candidato ${candidate.name} cadastrado no Banco de Talentos`,
      moduleName: 'Banco de Talentos',
      targetEntity: 'Candidato',
      empresaId: resolvedEmpresaId,
      companyId: resolvedEmpresaId
    }).catch(err => console.warn('Falha no audit log:', err));

    return candidate;
  }

  static async update(id: string, data: Partial<Candidate>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, sanitizeFirestoreData({
      ...data,
      updatedAt: new Date().toISOString()
    }), { merge: true });

    await AuditService.log({
      action: 'UPDATE',
      description: `Candidato ${id} atualizado`,
      moduleName: 'Banco de Talentos',
      targetEntity: 'Candidato'
    }).catch(err => console.warn('Falha no audit log:', err));
  }

  static async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    await AuditService.log({
      action: 'DELETE',
      description: `Candidato ${id} excluído do Banco de Talentos`,
      moduleName: 'Banco de Talentos',
      targetEntity: 'Candidato'
    }).catch(err => console.warn('Falha no audit log:', err));
  }

  static async getById(id: string): Promise<Candidate | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION_NAME, id));
      if (snap.exists()) {
        return snap.data() as Candidate;
      }
    } catch (err) {
      console.error('Erro em CandidateService.getById:', err);
    }
    return null;
  }

  static async get(id: string): Promise<Candidate | null> {
    return this.getById(id);
  }

  static async list(empresaId?: string): Promise<Candidate[]> {
    try {
      if (empresaId) {
        const resolvedId = resolveEmpresaId(empresaId);
        const q = query(collection(db, COLLECTION_NAME), where('empresaId', '==', resolvedId));
        const snap = await getDocs(q);
        const list: Candidate[] = [];
        snap.forEach(d => list.push(d.data() as Candidate));
        return list;
      } else {
        const snap = await getDocs(collection(db, COLLECTION_NAME));
        const list: Candidate[] = [];
        snap.forEach(d => list.push(d.data() as Candidate));
        return list;
      }
    } catch (err) {
      console.error('Erro em CandidateService.list:', err);
      return [];
    }
  }

  static async search(term: string, empresaId?: string): Promise<Candidate[]> {
    const all = await this.list(empresaId);
    const lower = term.toLowerCase();
    return all.filter(c => 
      c.name.toLowerCase().includes(lower) || 
      c.email.toLowerCase().includes(lower) ||
      (c.role && c.role.toLowerCase().includes(lower)) ||
      c.skills.some(s => s.toLowerCase().includes(lower))
    );
  }

  static async count(empresaId?: string): Promise<number> {
    const all = await this.list(empresaId);
    return all.length;
  }

  static async paginate(page: number, pageSize: number, empresaId?: string): Promise<{ items: Candidate[]; total: number }> {
    const all = await this.list(empresaId);
    const start = (page - 1) * pageSize;
    return {
      items: all.slice(start, start + pageSize),
      total: all.length
    };
  }

  // CANDIDATURAS
  static async createApplication(app: Partial<ApplicationDoc> & { empresaId?: string; companyId?: string }): Promise<ApplicationDoc> {
    const id = app.id || `app-${Date.now()}`;
    const user = auth.currentUser;
    const now = new Date().toISOString();
    const resolvedEmpresaId = resolveEmpresaId(app.empresaId || app.companyId);

    const applicationDoc: ApplicationDoc = {
      id,
      empresaId: resolvedEmpresaId,
      companyId: resolvedEmpresaId,
      jobId: app.jobId || '',
      candidateId: app.candidateId || '',
      stage: app.stage || 'triagem',
      rating: app.rating || 3,
      notes: app.notes || '',
      createdBy: user?.uid || 'candidate',
      createdAt: now,
      updatedAt: now,
      status: 'Em Análise'
    };

    const docRef = doc(db, APPLICATIONS_COLLECTION, id);
    await setDoc(docRef, sanitizeFirestoreData(applicationDoc), { merge: true });

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
      console.error('Erro ao buscar candidaturas no Firestore:', err);
      return [];
    }
  }
}
