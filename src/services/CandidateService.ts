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

const PRIMARY_COLLECTION = 'candidates';
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
  static async getByEmail(email: string, companyId?: string): Promise<Candidate | null> {
    if (!email) return null;
    try {
      const normEmail = email.toLowerCase().trim();
      const candidatesRef = collection(db, PRIMARY_COLLECTION);
      const q = companyId 
        ? query(candidatesRef, where('email', '==', normEmail), where('companyId', '==', companyId))
        : query(candidatesRef, where('email', '==', normEmail));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        return { ...(d.data() as Candidate), id: d.id };
      }
    } catch (err: any) {
      console.error("FLOW ERROR in CandidateService.getByEmail:", {
        email,
        companyId,
        code: err?.code,
        message: err?.message
      });
    }
    return null;
  }

  static async create(candidateData: Partial<Candidate> & { companyId?: string }): Promise<Candidate> {
    const user = auth.currentUser;
    const now = new Date().toISOString().split('T')[0];
    const companyId = candidateData.companyId || (candidateData as any).empresaId || 'emp-001';

    // Reuse existing candidate if email exists to avoid duplication
    let id = candidateData.id;
    if (candidateData.email) {
      const existing = await this.getByEmail(candidateData.email, companyId);
      if (existing) {
        id = existing.id;
      }
    }
    if (!id) {
      id = `cand-${Date.now()}`;
    }

    const candidate = {
      id,
      name: candidateData.name || (candidateData as any).nome || 'Novo Candidato',
      nome: candidateData.name || (candidateData as any).nome || 'Novo Candidato',
      email: candidateData.email || 'candidato@email.com',
      phone: candidateData.phone || (candidateData as any).telefone || '(11) 99999-9999',
      telefone: candidateData.phone || (candidateData as any).telefone || '(11) 99999-9999',
      role: candidateData.role || (candidateData as any).cargoAtual || 'Desenvolvedor',
      cargoAtual: candidateData.role || (candidateData as any).cargoAtual || 'Desenvolvedor',
      location: candidateData.location || (candidateData as any).cidade || 'São Paulo - SP',
      cidade: candidateData.location || (candidateData as any).cidade || 'São Paulo - SP',
      experienceYears: candidateData.experienceYears || 3,
      experienciaAnos: candidateData.experienceYears || 3,
      skills: candidateData.skills || ['React', 'TypeScript'],
      status: candidateData.status || 'Em Processo',
      currentJobId: candidateData.currentJobId || 'vaga-1',
      vagaId: candidateData.currentJobId || 'vaga-1',
      currentStageId: candidateData.currentStageId || 'triagem',
      rating: candidateData.rating || 4,
      notes: candidateData.notes || 'Candidato promissor',
      avatar: candidateData.avatar || '',
      appliedDate: candidateData.appliedDate || now,
      source: candidateData.source || 'LinkedIn',
      salaryExpectation: candidateData.salaryExpectation || 'A combinar',
      resumeUrl: candidateData.resumeUrl || (candidateData as any).curriculoUrl || '',
      curriculoUrl: candidateData.resumeUrl || (candidateData as any).curriculoUrl || '',
      companyId,
      empresaId: companyId,
      createdBy: user?.uid || 'system',
      createdAt: now,
      updatedAt: new Date().toISOString()
    };

    try {
      const sanitized = sanitizeFirestoreData(candidate);
      await setDoc(doc(db, PRIMARY_COLLECTION, id), sanitized, { merge: true });

      await AuditService.log({
        action: 'CREATE',
        description: `Candidato ${candidate.name} cadastrado no Banco de Talentos`,
        moduleName: 'Banco de Talentos',
        targetEntity: 'Candidato',
        companyId
      });
    } catch (err: any) {
      console.error('FLOW ERROR in CandidateService.create:', {
        candidateId: id,
        companyId,
        code: err?.code,
        message: err?.message
      });
      throw err;
    }

    return candidate as any;
  }

  static async update(id: string, data: Partial<Candidate>): Promise<void> {
    try {
      const cId = (data as any).companyId || (data as any).empresaId || 'emp-001';
      const updateData = sanitizeFirestoreData({
        ...data,
        companyId: cId,
        empresaId: cId,
        updatedAt: new Date().toISOString()
      });

      await setDoc(doc(db, PRIMARY_COLLECTION, id), updateData, { merge: true });

      await AuditService.log({
        action: 'UPDATE',
        description: `Candidato ${id} atualizado`,
        moduleName: 'Banco de Talentos',
        targetEntity: 'Candidato'
      });
    } catch (err: any) {
      console.error('FLOW ERROR in CandidateService.update:', {
        candidateId: id,
        code: err?.code,
        message: err?.message
      });
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, PRIMARY_COLLECTION, id));
      await AuditService.log({
        action: 'DELETE',
        description: `Candidato ${id} excluído do Banco de Talentos`,
        moduleName: 'Banco de Talentos',
        targetEntity: 'Candidato'
      });
    } catch (err: any) {
      console.error('FLOW ERROR in CandidateService.delete:', {
        candidateId: id,
        code: err?.code,
        message: err?.message
      });
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
    return null;
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
