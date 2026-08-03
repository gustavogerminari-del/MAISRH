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
import { normalizeJobData, normalizeJobStatus } from '../jobs/utils/jobUtils';
import { 
  getCompanyCapabilitiesFromFirestore, 
  resolveJobOriginWithCompany,
  normalizeJobOrigin 
} from '../utils/companyModules';
import { PermissionService } from './PermissionService';

const COLLECTION_NAME = 'jobs';

export class JobService {
  static async create(jobData: Record<string, any>): Promise<Job> {
    const id = jobData.id || `vaga-${Date.now()}`;
    const user = auth.currentUser;
    const now = new Date().toISOString().split('T')[0];

    const resolvedCompanyId = jobData.companyId || jobData.empresaId || 'emp-001';
    const capabilities = await getCompanyCapabilitiesFromFirestore(resolvedCompanyId);
    
    let resolvedOrigin = resolveJobOriginWithCompany(jobData, capabilities);
    if (resolvedOrigin === 'REQUIRES_CHOICE' && jobData.origemProcesso) {
      resolvedOrigin = normalizeJobOrigin(jobData) || 'RH_INTERNO';
    }

    const isHeadhunter = resolvedOrigin === 'HEADHUNTER';
    const origProc = isHeadhunter ? 'HEADHUNTER' : 'RH_INTERNO';
    const destContr = isHeadhunter ? 'FINANCEIRO_HEADHUNTER' : 'DP';

    const jobToSave: Record<string, any> = {
      ...jobData,
      id,
      companyId: resolvedCompanyId,
      empresaId: resolvedCompanyId,
      origemProcesso: origProc,
      moduloOrigem: isHeadhunter ? 'headhunter' : 'RH',
      origem: origProc,
      isHeadhunter: isHeadhunter,
      destinoContratacao: destContr,
      destino: destContr,
      companyName: jobData.companyName || jobData.nomeEmpresa || 'RL CONNECT',
      nomeEmpresa: jobData.nomeEmpresa || jobData.companyName || 'RL CONNECT',
      title: jobData.title || jobData.titulo || 'Nova Vaga',
      titulo: jobData.titulo || jobData.title || 'Nova Vaga',
      description: jobData.description || jobData.descricao || '',
      descricao: jobData.descricao || jobData.description || '',
      department: jobData.department || 'Geral',
      location: jobData.location || 'São Paulo - SP',
      locationType: jobData.locationType || jobData.modalidade || 'Híbrido',
      type: jobData.type || jobData.tipoContrato || 'CLT',
      status: jobData.status || 'Aberta',
      publicada: jobData.publicada ?? true,
      salaryRange: jobData.salaryRange || 'A combinar',
      openings: jobData.openings || 1,
      applicantsCount: jobData.applicantsCount || 0,
      createdAt: jobData.createdAt || jobData.dataCriacao || now,
      dataCriacao: jobData.dataCriacao || jobData.createdAt || now,
      deadline: jobData.deadline || '2026-12-31',
      requirements: jobData.requirements || [],
      benefits: jobData.benefits || [],
      recruiterName: jobData.recruiterName || user?.displayName || 'Recrutador RH',
      createdBy: user?.uid || 'system',
      updatedAt: new Date().toISOString()
    };

    try {
      const targetModule = isHeadhunter ? 'headhunter' : 'vagas';
      await PermissionService.validateFirestoreWrite(targetModule, resolvedCompanyId);

      const docRef = doc(db, COLLECTION_NAME, id);
      await setDoc(docRef, sanitizeFirestoreData(jobToSave), { merge: true });

      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        throw new Error(`Documento da vaga ${id} não foi encontrado no Firestore após gravação.`);
      }

      await AuditService.log({
        action: 'CREATE',
        description: `Vaga "${jobToSave.title}" criada com sucesso.`,
        moduleName: 'Vagas',
        targetEntity: 'Vaga',
        companyId: resolvedCompanyId
      });
    } catch (err: any) {
      console.error('Erro ao salvar vaga no Firestore:', err);
      throw new Error(`Falha ao publicar vaga no Firestore: ${err.message || String(err)}`);
    }

    return jobToSave as Job;
  }

  static async update(id: string, data: Record<string, any>): Promise<void> {
    try {
      await PermissionService.validateFirestoreWrite('vagas', data.companyId || data.empresaId);
      const docRef = doc(db, COLLECTION_NAME, id);
      const updatePayload = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      await setDoc(docRef, sanitizeFirestoreData(updatePayload), { merge: true });

      await AuditService.log({
        action: 'UPDATE',
        description: `Vaga ${id} atualizada`,
        moduleName: 'Vagas',
        targetEntity: 'Vaga'
      });
    } catch (err: any) {
      console.error('Erro ao atualizar vaga no Firestore:', err);
      throw new Error(`Falha ao atualizar vaga no Firestore: ${err.message || String(err)}`);
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
        return normalizeJobData({ ...snap.data(), id: snap.id });
      }
    } catch (err) {
      console.warn('Erro em JobService.getById:', err);
    }
    return null;
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
        snap1.forEach(d => listMap.set(d.id, normalizeJobData({ ...d.data(), id: d.id })));

        const q2 = query(collection(db, COLLECTION_NAME), where('empresaId', '==', companyId));
        const snap2 = await getDocs(q2);
        snap2.forEach(d => listMap.set(d.id, normalizeJobData({ ...d.data(), id: d.id })));

        return Array.from(listMap.values());
      } else {
        const snap = await getDocs(collection(db, COLLECTION_NAME));
        const list: Job[] = [];
        snap.forEach(d => list.push(normalizeJobData({ ...d.data(), id: d.id })));
        return list;
      }
    } catch (err) {
      console.warn('Erro em JobService.list:', err);
    }
    return [];
  }

  static async listPublicJobs(): Promise<Job[]> {
    try {
      const listMap = new Map<string, Job>();

      // Query published jobs
      try {
        const q1 = query(collection(db, COLLECTION_NAME), where('publicada', '==', true));
        const snap1 = await getDocs(q1);
        snap1.forEach(d => listMap.set(d.id, { ...d.data(), id: d.id } as Job));
      } catch (e) {
        console.warn('Busca por publicada==true falhou, tentando busca geral:', e);
      }

      if (listMap.size === 0) {
        const snap = await getDocs(collection(db, COLLECTION_NAME));
        snap.forEach(d => {
          const data = d.data() as Job;
          if (data.publicada !== false && (data.status === 'Aberta' || data.status === 'ativa' || !data.status)) {
            listMap.set(d.id, { ...data, id: d.id });
          }
        });
      }

      return Array.from(listMap.values());
    } catch (err) {
      console.warn('Erro em JobService.listPublicJobs:', err);
      return [];
    }
  }

  static async listByCompany(companyId?: string): Promise<Job[]> {
    return this.list(companyId);
  }

  static async search(term: string, companyId?: string): Promise<Job[]> {
    const all = await this.list(companyId);
    const lower = term.toLowerCase();
    return all.filter(j => 
      (j.title || j.titulo || '').toLowerCase().includes(lower) || 
      (j.department || '').toLowerCase().includes(lower) ||
      (j.description || j.descricao || '').toLowerCase().includes(lower)
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
