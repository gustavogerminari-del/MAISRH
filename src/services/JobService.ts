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
import { normalizeJobData, normalizeJobStatus } from '../jobs/utils/jobUtils';
import { PermissionService } from './PermissionService';

const PRIMARY_COLLECTION = 'jobs';

export class JobService {
  static async create(jobData: Record<string, any>): Promise<Job> {
    const id = jobData.id || `vaga-${Date.now()}`;
    const user = auth.currentUser;
    const nowIsoDate = new Date().toISOString().split('T')[0];

    const resolvedCompanyId = jobData.companyId || jobData.empresaId || (user as any)?.empresaId || (user as any)?.companyId;
    if (!resolvedCompanyId) {
      throw new Error("Não foi possível identificar a empresa do usuário autenticado.");
    }

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

      PermissionService.validateFirestoreWrite('jobs', { companyId: resolvedCompanyId });

      const sanitizedData = sanitizeFirestoreData(jobToSave);

      const primaryDoc = doc(db, PRIMARY_COLLECTION, id);
      await setDoc(primaryDoc, sanitizedData, { merge: true });

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
      const user = auth.currentUser;
      const companyId = data.companyId || data.empresaId || (user as any)?.empresaId || (user as any)?.companyId;
      if (!companyId) {
        throw new Error("Não foi possível identificar a empresa do usuário autenticado.");
      }
      PermissionService.validateFirestoreWrite('jobs', { companyId });
      const updatePayload = sanitizeFirestoreData({
        ...data,
        empresaId: companyId,
        companyId: companyId,
        updatedAt: new Date().toISOString()
      });

      const primaryDoc = doc(db, PRIMARY_COLLECTION, id);
      await setDoc(primaryDoc, updatePayload, { merge: true });

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
      await deleteDoc(doc(db, PRIMARY_COLLECTION, id));
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
      const snap = await getDoc(doc(db, PRIMARY_COLLECTION, id));
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
      const jobsRef = collection(db, PRIMARY_COLLECTION);

      const jobsQuery = companyId
        ? query(jobsRef, where("empresaId", "==", companyId))
        : query(jobsRef);

      const snapshot = await getDocs(jobsQuery);

      console.log("JOBS LOADED", {
        total: snapshot.size,
        ids: snapshot.docs.map(doc => doc.id)
      });

      return snapshot.docs.map(document => {
        const rawData = document.data();
        const norm = normalizeJobData({
          ...rawData,
          id: document.id
        });

        console.log("JOB NORMALIZED", {
          id: document.id,
          originalStatus: rawData.status,
          normalizedStatus: norm.status,
          originalOrigin: rawData.origem || rawData.origemProcesso || rawData.tipoProcesso,
          normalizedOrigin: norm.origem,
          publicada: rawData.publicada ?? rawData.publicado,
          ativo: rawData.ativo,
          empresaId: rawData.empresaId || rawData.companyId
        });

        return norm;
      });
    } catch (error: any) {
      console.error("JOB LIST ERROR", {
        companyId,
        code: error?.code,
        message: error?.message
      });

      throw error;
    }
  }

  static async listPublicJobs(): Promise<Job[]> {
    try {
      const publicJobsQuery = query(
        collection(db, PRIMARY_COLLECTION),
        where("publicada", "==", true),
        where("ativo", "==", true)
      );

      const snapshot = await getDocs(publicJobsQuery);

      return snapshot.docs
        .map(document =>
          normalizeJobData({
            ...document.data(),
            id: document.id
          })
        )
        .filter(job => normalizeJobStatus(job.status) === "aberta");
    } catch (error: any) {
      console.error("PUBLIC JOB LIST ERROR", {
        code: error?.code,
        message: error?.message
      });

      throw error;
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
