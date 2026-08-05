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
import { AuditService } from './AuditService';
import { normalizeJobData } from '../jobs/utils/jobUtils';
import { PermissionService } from './PermissionService';

const PRIMARY_COLLECTION = 'jobs';
const SECONDARY_COLLECTION = 'vagas';

export class JobService {
  static async create(jobData: Record<string, any>): Promise<Job> {
    const id = jobData.id || `vaga-${Date.now()}`;
    const user = auth.currentUser;
    const nowIsoDate = new Date().toISOString().split('T')[0];

    const resolvedCompanyId = jobData.companyId || jobData.empresaId || 'emp-001';
    const rawOrigem = (jobData.origemProcesso || jobData.origem || '').toString().toLowerCase();

    let resolvedOrigem: 'vaga_interna' | 'recrutamento_cliente' | 'headhunter' = 'vaga_interna';
    if (rawOrigem.includes('headhunter') || jobData.isHeadhunter || jobData.projetoHeadhunter) {
      resolvedOrigem = 'headhunter';
    } else if (rawOrigem.includes('cliente') || jobData.clienteNome) {
      resolvedOrigem = 'recrutamento_cliente';
    }

    const isHeadhunter = resolvedOrigem === 'headhunter';
    const isClient = resolvedOrigem === 'recrutamento_cliente';

    const jobToSave: Record<string, any> = {
      ...jobData,
      id,
      companyId: resolvedCompanyId,
      empresaId: resolvedCompanyId,
      origem: resolvedOrigem,
      origemProcesso: resolvedOrigem,
      tipoProcesso: isHeadhunter ? 'busca_ativa' : isClient ? 'cliente' : 'interno',
      projetoHeadhunter: isHeadhunter,
      isHeadhunter: isHeadhunter,
      criadaPorModulo: jobData.criadaPorModulo || (isHeadhunter ? 'headhunter' : 'recrutamento'),
      moduloOrigem: isHeadhunter ? 'headhunter' : 'RH',

      companyName: jobData.companyName || jobData.nomeEmpresa || 'MAIS RH Brasil',
      nomeEmpresa: jobData.nomeEmpresa || jobData.companyName || 'MAIS RH Brasil',
      title: jobData.title || jobData.titulo || 'Nova Vaga',
      titulo: jobData.titulo || jobData.title || 'Nova Vaga',
      description: jobData.description || jobData.descricao || '',
      descricao: jobData.descricao || jobData.description || '',
      department: jobData.department || 'Geral',
      location: jobData.location || 'São Paulo - SP',
      locationType: jobData.locationType || jobData.modalidade || 'Híbrido',
      type: jobData.type || jobData.tipoContrato || 'CLT',
      status: jobData.status || 'Aberta',
      publicada: jobData.publicada !== false,
      publicado: jobData.publicado !== false && jobData.publicada !== false,
      ativo: jobData.ativo !== false,
      salaryRange: jobData.salaryRange || jobData.salario || 'A combinar',
      salario: jobData.salario || jobData.salaryRange || 'A combinar',
      openings: Number(jobData.openings || jobData.quantidadeVagas || 1),
      quantidadeVagas: Number(jobData.openings || jobData.quantidadeVagas || 1),
      applicantsCount: Number(jobData.applicantsCount || jobData.candidatosCount || 0),
      createdAt: jobData.createdAt || jobData.dataCriacao || nowIsoDate,
      dataCriacao: jobData.dataCriacao || jobData.createdAt || nowIsoDate,
      deadline: jobData.deadline || jobData.prazoSla || '2026-12-31',
      requirements: jobData.requirements || jobData.requisitos || [],
      requisitos: jobData.requisitos || jobData.requirements || [],
      benefits: jobData.benefits || jobData.beneficios || [],
      recruiterName: jobData.recruiterName || jobData.recrutadorResponsavel || user?.displayName || 'Recrutador RH',
      createdBy: user?.uid || 'system',
      updatedAt: new Date().toISOString()
    };

    try {
      console.log("JOB PAYLOAD", jobToSave);
      console.log("AUTH USER", {
        uid: auth.currentUser?.uid,
        email: auth.currentUser?.email
      });

      PermissionService.validateFirestoreWrite('vagas', { companyId: resolvedCompanyId });

      const sanitizedData = sanitizeFirestoreData(jobToSave);

      // Dual Save to ensure complete sync across 'jobs' and 'vagas' collections
      const primaryDoc = doc(db, PRIMARY_COLLECTION, id);
      const secondaryDoc = doc(db, SECONDARY_COLLECTION, id);

      await Promise.all([
        setDoc(primaryDoc, sanitizedData, { merge: true }),
        setDoc(secondaryDoc, sanitizedData, { merge: true })
      ]);

      await AuditService.log({
        action: 'CREATE',
        description: `Vaga "${jobToSave.title}" criada com sucesso.`,
        moduleName: 'Vagas',
        targetEntity: 'Vaga',
        companyId: resolvedCompanyId
      });
    } catch (err: any) {
      console.error("FIRESTORE JOB CREATE ERROR", {
        code: err?.code,
        message: err?.message,
        stack: err?.stack
      });
      console.error('Erro ao salvar vaga no Firestore:', err);
      throw err;
    }

    return jobToSave as Job;
  }

  static async update(id: string, data: Record<string, any>): Promise<void> {
    try {
      const companyId = data.companyId || data.empresaId || 'emp-001';
      PermissionService.validateFirestoreWrite('vagas', { companyId });
      const updatePayload = sanitizeFirestoreData({
        ...data,
        empresaId: companyId,
        companyId: companyId,
        updatedAt: new Date().toISOString()
      });

      const primaryDoc = doc(db, PRIMARY_COLLECTION, id);
      const secondaryDoc = doc(db, SECONDARY_COLLECTION, id);

      await Promise.all([
        setDoc(primaryDoc, updatePayload, { merge: true }),
        setDoc(secondaryDoc, updatePayload, { merge: true })
      ]);

      await AuditService.log({
        action: 'UPDATE',
        description: `Vaga ${id} atualizada`,
        moduleName: 'Vagas',
        targetEntity: 'Vaga'
      });
    } catch (err: any) {
      console.error('Erro ao atualizar vaga no Firestore:', err);
      throw err;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await Promise.all([
        deleteDoc(doc(db, PRIMARY_COLLECTION, id)),
        deleteDoc(doc(db, SECONDARY_COLLECTION, id))
      ]);
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
      const snap1 = await getDoc(doc(db, PRIMARY_COLLECTION, id));
      if (snap1.exists()) {
        return normalizeJobData({ ...snap1.data(), id: snap1.id });
      }
      const snap2 = await getDoc(doc(db, SECONDARY_COLLECTION, id));
      if (snap2.exists()) {
        return normalizeJobData({ ...snap2.data(), id: snap2.id });
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
      const listMap = new Map<string, Job>();

      // Primary source: collection(db, "jobs")
      const snap = await getDocs(collection(db, PRIMARY_COLLECTION));
      
      console.log("JOBS LOADED", {
        total: snap.size,
        ids: snap.docs.map(doc => doc.id)
      });

      snap.forEach(d => {
        const rawData: any = { ...d.data(), id: d.id };
        const normalized = normalizeJobData(rawData);

        console.log("JOB NORMALIZED", {
          id: d.id,
          originalStatus: rawData.status,
          normalizedStatus: normalized.status,
          originalOrigin: rawData.origem || rawData.origemProcesso || rawData.tipoProcesso,
          normalizedOrigin: normalized.origem,
          publicada: rawData.publicada ?? rawData.publicado,
          ativo: rawData.ativo,
          empresaId: rawData.empresaId || rawData.companyId
        });

        const cId = rawData.empresaId || rawData.companyId;
        if (!companyId || cId === companyId) {
          listMap.set(d.id, normalized);
        }
      });

      return Array.from(listMap.values());
    } catch (err) {
      console.warn('Erro em JobService.list:', err);
    }
    return [];
  }

  static async listPublicJobs(): Promise<Job[]> {
    try {
      const snap = await getDocs(collection(db, PRIMARY_COLLECTION));
      const publicJobs: Job[] = [];

      snap.forEach(d => {
        const rawData: any = { ...d.data(), id: d.id };
        const isPublic = (rawData.publicada === true || rawData.publicado === true) && rawData.ativo !== false;
        
        if (isPublic) {
          const normalized = normalizeJobData(rawData);
          if ((normalized.status as string) === 'aberta') {
            publicJobs.push(normalized);
          }
        }
      });

      return publicJobs;
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
}
