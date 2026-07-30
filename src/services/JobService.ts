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
import { Job } from '../types/rh';
import { INITIAL_JOBS } from '../data/initialData';
import { AuditService } from './AuditService';

const COLLECTION_NAME = 'jobs';

export class JobService {
  static async create(jobData: Partial<Job> & { companyId?: string }): Promise<Job> {
    const id = jobData.id || `vaga-${Date.now()}`;
    const user = auth.currentUser;
    const now = new Date().toISOString().split('T')[0];
    const companyId = jobData.companyId || 'emp-001';

    const job: Job & { companyId: string; createdBy: string; createdAt: string; updatedAt: string } = {
      id,
      title: jobData.title || 'Nova Vaga',
      department: jobData.department || 'Geral',
      location: jobData.location || 'São Paulo - SP',
      locationType: jobData.locationType || 'Híbrido',
      type: jobData.type || 'CLT',
      status: jobData.status || 'Aberta',
      salaryRange: jobData.salaryRange || 'A combinar',
      openings: jobData.openings || 1,
      applicantsCount: jobData.applicantsCount || 0,
      createdAt: jobData.createdAt || now,
      deadline: jobData.deadline || '2026-12-31',
      description: jobData.description || 'Descrição da vaga',
      requirements: jobData.requirements || [],
      recruiterName: jobData.recruiterName || user?.displayName || 'Recrutador RH',
      companyId,
      createdBy: user?.uid || 'system',
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, COLLECTION_NAME, id), sanitizeFirestoreData(job), { merge: true });
      await AuditService.log({
        action: 'CREATE',
        description: `Vaga "${job.title}" criada no departamento ${job.department}`,
        moduleName: 'Vagas',
        targetEntity: 'Vaga',
        companyId
      });
    } catch (err) {
      console.warn('Erro ao salvar vaga no Firestore:', err);
    }

    return job;
  }

  static async update(id: string, data: Partial<Job>): Promise<void> {
    try {
      await setDoc(doc(db, COLLECTION_NAME, id), sanitizeFirestoreData({
        ...data,
        updatedAt: new Date().toISOString()
      }), { merge: true });

      await AuditService.log({
        action: 'UPDATE',
        description: `Vaga ${id} atualizada`,
        moduleName: 'Vagas',
        targetEntity: 'Vaga'
      });
    } catch (err) {
      console.warn('Erro ao atualizar vaga no Firestore:', err);
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      await AuditService.log({
        action: 'DELETE',
        description: `Vaga ${id} excluída`,
        moduleName: 'Vagas',
        targetEntity: 'Vaga'
      });
    } catch (err) {
      console.warn('Erro ao excluir vaga no Firestore:', err);
    }
  }

  static async getById(id: string): Promise<Job | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION_NAME, id));
      if (snap.exists()) {
        return snap.data() as Job;
      }
    } catch (err) {
      console.warn('Erro em JobService.getById:', err);
    }
    return import.meta.env.DEV ? (INITIAL_JOBS.find(j => j.id === id) || null) : null;
  }

  static async get(id: string): Promise<Job | null> {
    return this.getById(id);
  }

  static async list(companyId?: string): Promise<Job[]> {
    try {
      if (companyId) {
        const listMap = new Map<string, Job>();

        const q1 = query(collection(db, COLLECTION_NAME), where('companyId', '==', companyId));
        const snap1 = await getDocs(q1);
        snap1.forEach(d => listMap.set(d.id, d.data() as Job));

        const q2 = query(collection(db, COLLECTION_NAME), where('empresaId', '==', companyId));
        const snap2 = await getDocs(q2);
        snap2.forEach(d => listMap.set(d.id, d.data() as Job));

        return Array.from(listMap.values());
      } else {
        const snap = await getDocs(collection(db, COLLECTION_NAME));
        const list: Job[] = [];
        snap.forEach(d => list.push(d.data() as Job));
        return list;
      }
    } catch (err) {
      console.warn('Erro em JobService.list:', err);
    }
    return import.meta.env.DEV ? INITIAL_JOBS : [];
  }

  static async listByCompany(companyId?: string): Promise<Job[]> {
    return this.list(companyId);
  }

  static async search(term: string, companyId?: string): Promise<Job[]> {
    const all = await this.list(companyId);
    const lower = term.toLowerCase();
    return all.filter(j => 
      j.title.toLowerCase().includes(lower) || 
      j.department.toLowerCase().includes(lower) ||
      j.description.toLowerCase().includes(lower)
    );
  }

  static async count(companyId?: string): Promise<number> {
    const all = await this.list(companyId);
    return all.length;
  }

  static async paginate(page: number, pageSize: number, companyId?: string): Promise<{ items: Job[]; total: number }> {
    const all = await this.list(companyId);
    const start = (page - 1) * pageSize;
    return {
      items: all.slice(start, start + pageSize),
      total: all.length
    };
  }
}
