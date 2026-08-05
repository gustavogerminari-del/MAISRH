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
    const normEmail = email.toLowerCase().trim();
    try {
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
        email: normEmail,
        companyId,
        code: err?.code,
        message: err?.message
      });
      throw err;
    }
    return null;
  }

  static async createOrGetByEmail(data: Partial<Candidate> & { companyId: string }): Promise<Candidate> {
    if (!data.email || !data.name) {
      throw new Error('Nome e e-mail do candidato são obrigatórios.');
    }
    if (!data.companyId) {
      throw new Error('Não foi possível identificar a empresa do candidato.');
    }
    const normEmail = data.email.toLowerCase().trim();
    const existing = await this.getByEmail(normEmail, data.companyId);

    if (existing) {
      return existing;
    }

    return this.create({
      ...data,
      email: normEmail
    });
  }

  static async create(candidateData: Partial<Candidate> & { companyId?: string }): Promise<Candidate> {
    const user = auth.currentUser;
    const now = new Date().toISOString().split('T')[0];
    const companyId = candidateData.companyId || (candidateData as any).empresaId;

    if (!companyId) {
      throw new Error('Não foi possível identificar a empresa do candidato.');
    }

    const name = candidateData.name || (candidateData as any).nome;
    const email = candidateData.email ? candidateData.email.toLowerCase().trim() : '';

    if (!name || !email) {
      throw new Error('Nome e e-mail do candidato são obrigatórios.');
    }

    // Reuse existing candidate if email exists to avoid duplication
    let id = candidateData.id;
    if (email) {
      const existing = await this.getByEmail(email, companyId);
      if (existing) {
        id = existing.id;
      }
    }
    if (!id) {
      id = `cand-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    }

    const candidate: Record<string, any> = {
      id,
      name,
      nome: name,
      email,
      phone: candidateData.phone || (candidateData as any).telefone || '',
      telefone: candidateData.phone || (candidateData as any).telefone || '',
      role: candidateData.role || (candidateData as any).cargoAtual || '',
      cargoAtual: candidateData.role || (candidateData as any).cargoAtual || '',
      location: candidateData.location || (candidateData as any).cidade || '',
      cidade: candidateData.location || (candidateData as any).cidade || '',
      experienceYears: Number(candidateData.experienceYears) || 0,
      experienciaAnos: Number(candidateData.experienceYears) || 0,
      skills: candidateData.skills || [],
      status: candidateData.status || 'Em Processo',
      currentJobId: candidateData.currentJobId || (candidateData as any).vagaId || '',
      vagaId: candidateData.currentJobId || (candidateData as any).vagaId || '',
      currentStageId: candidateData.currentStageId || 'triagem',
      rating: candidateData.rating || 0,
      notes: candidateData.notes || '',
      avatar: candidateData.avatar || '',
      appliedDate: candidateData.appliedDate || now,
      source: (candidateData.source && ['LinkedIn', 'Indicação', 'Site Institucional', 'Gupy', 'Outro'].includes(candidateData.source) ? candidateData.source : 'Site Institucional') as any,
      salaryExpectation: candidateData.salaryExpectation || '',
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

    return candidate as unknown as Candidate;
  }

  static async update(id: string, data: Partial<Candidate>): Promise<void> {
    let cId = (data as any).companyId || (data as any).empresaId;
    if (!cId) {
      try {
        const snap = await getDoc(doc(db, PRIMARY_COLLECTION, id));
        if (snap.exists()) {
          const docData = snap.data();
          cId = docData.companyId || docData.empresaId;
        }
      } catch (e) {
        console.warn('Aviso ao consultar candidato no Banco de Talentos para obter empresaId:', e);
      }
    }
    cId = cId || 'emp-001';

    try {
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
      throw err;
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
      throw err;
    }
  }

  static async getById(id: string): Promise<Candidate | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION_NAME, id));
      if (snap.exists()) {
        return { ...(snap.data() as Candidate), id: snap.id };
      }
    } catch (err: any) {
      console.error('FLOW ERROR in CandidateService.getById:', { candidateId: id, code: err?.code, message: err?.message });
      throw err;
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
      const list: Candidate[] = [];
      snap.forEach(d => list.push({ ...(d.data() as Candidate), id: d.id }));
      return list;
    } catch (err: any) {
      console.error('CANDIDATE LIST ERROR in CandidateService.list:', {
        companyId,
        code: err?.code,
        message: err?.message
      });
      throw err;
    }
  }

  static async search(term: string, companyId?: string): Promise<Candidate[]> {
    const all = await this.list(companyId);
    const lower = term.toLowerCase();
    return all.filter(c => 
      c.name.toLowerCase().includes(lower) || 
      c.email.toLowerCase().includes(lower) ||
      (c.role && c.role.toLowerCase().includes(lower)) ||
      (c.skills && c.skills.some(s => s.toLowerCase().includes(lower)))
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
    if (!app.companyId || !app.jobId || !app.candidateId) {
      throw new Error('companyId, jobId e candidateId são obrigatórios para registrar a candidatura.');
    }
    const id = app.id || `app-${Date.now()}`;
    const user = auth.currentUser;
    const now = new Date().toISOString();

    const applicationDoc: ApplicationDoc = {
      id,
      companyId: app.companyId,
      jobId: app.jobId,
      candidateId: app.candidateId,
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
    } catch (err: any) {
      console.error('FLOW ERROR em CandidateService.createApplication:', { id, code: err?.code, message: err?.message });
      throw err;
    }

    return applicationDoc;
  }

  static async getApplicationsForJob(jobId: string): Promise<ApplicationDoc[]> {
    try {
      const q = query(collection(db, APPLICATIONS_COLLECTION), where('jobId', '==', jobId));
      const snap = await getDocs(q);
      const list: ApplicationDoc[] = [];
      snap.forEach(d => list.push({ ...(d.data() as ApplicationDoc), id: d.id }));
      return list;
    } catch (err: any) {
      console.error('FLOW ERROR em CandidateService.getApplicationsForJob:', { jobId, code: err?.code, message: err?.message });
      throw err;
    }
  }
}
