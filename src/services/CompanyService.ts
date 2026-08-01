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
import { ClientTenant } from '../master-admin/types/master';
import { AuditService } from './AuditService';

const COLLECTION_NAME = 'companies';

export class CompanyService {
  static async create(tenantData: Partial<ClientTenant>): Promise<ClientTenant> {
    const id = tenantData.id || `emp-${Date.now()}`;
    const user = auth.currentUser;
    const now = new Date().toISOString().split('T')[0];

    const companyDoc: ClientTenant & { companyId: string; createdBy: string; createdAt: string; updatedAt: string; status: string } = {
      id,
      companyId: id,
      code: tenantData.code || (tenantData.companyName || 'EMP').substring(0, 5).toUpperCase(),
      companyName: tenantData.companyName || tenantData.tradeName || 'Nova Empresa',
      tradeName: tenantData.tradeName || tenantData.companyName || 'Nova Empresa',
      cnpj: tenantData.cnpj || '00.000.000/0001-00',
      ownerName: tenantData.ownerName || 'Administrador',
      ownerEmail: tenantData.ownerEmail || 'admin@empresa.com.br',
      ownerPhone: tenantData.ownerPhone || '(11) 99999-8888',
      address: tenantData.address,
      adminCredentials: tenantData.adminCredentials,
      status: (tenantData.status as any) || 'Ativo',
      maxUsers: tenantData.maxUsers || 10,
      maxActiveJobs: tenantData.maxActiveJobs || 20,
      modules: tenantData.modules || {
        vagas: true,
        bancoTalentos: true,
        entrevistas: true,
        equipeInterna: true,
        consultorRH: false,
        feriasBeneficios: true,
        documentosAssinatura: true,
        auditoriaLogs: false,
        relatoriosAvancados: true,
        siteVagasPersonalizado: true
      },
      branding: tenantData.branding || {
        primaryColor: '#2563EB',
        companyDisplayName: tenantData.companyName || 'Nova Empresa'
      },
      metrics: tenantData.metrics || {
        activeUsersCount: 1,
        totalJobsCreated: 0,
        totalTalentsStored: 0,
        totalDocumentsSigned: 0,
        storageUsedMB: 10,
        lastLoginAt: 'Hoje'
      },
      contract: tenantData.contract || {
        id: `ctr-${id}`,
        contractNumber: `CTR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        planName: 'Básico',
        monthlyFee: 1200,
        billingCycle: 'Mensal',
        startDate: now,
        expirationDate: '2027-01-01',
        paymentMethod: 'Pix',
        autoRenew: true
      },
      notes: tenantData.notes,
      createdBy: user?.uid || 'system',
      createdAt: tenantData.createdAt || now,
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, COLLECTION_NAME, id), sanitizeFirestoreData(companyDoc), { merge: true });
      await AuditService.log({
        action: 'CREATE',
        description: `Empresa ${companyDoc.companyName} (${companyDoc.cnpj}) cadastrada`,
        moduleName: 'Configurações',
        targetEntity: 'Empresa',
        companyId: id
      });
    } catch (err) {
      console.warn('Erro ao salvar empresa no Firestore:', err);
    }

    return companyDoc;
  }

  static async update(id: string, data: Partial<ClientTenant>): Promise<void> {
    try {
      await setDoc(doc(db, COLLECTION_NAME, id), sanitizeFirestoreData({
        ...data,
        updatedAt: new Date().toISOString()
      }), { merge: true });

      await AuditService.log({
        action: 'UPDATE',
        description: `Dados da empresa ${data.companyName || id} atualizados`,
        moduleName: 'Configurações',
        targetEntity: 'Empresa',
        companyId: id
      });
    } catch (err) {
      console.warn('Erro ao atualizar empresa no Firestore:', err);
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      await AuditService.log({
        action: 'DELETE',
        description: `Empresa ${id} excluída do sistema`,
        moduleName: 'Configurações',
        targetEntity: 'Empresa',
        companyId: id
      });
    } catch (err) {
      console.warn('Erro ao excluir empresa no Firestore:', err);
    }
  }

  static async getById(id: string): Promise<ClientTenant | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION_NAME, id));
      if (snap.exists()) {
        return snap.data() as ClientTenant;
      }
    } catch (err) {
      console.warn('Erro em CompanyService.getById:', err);
    }
    return null;
  }

  static async get(id: string): Promise<ClientTenant | null> {
    return this.getById(id);
  }

  static async list(): Promise<ClientTenant[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      if (!snap.empty) {
        const list: ClientTenant[] = [];
        snap.forEach(d => list.push(d.data() as ClientTenant));
        return list;
      }
    } catch (err) {
      console.warn('Erro em CompanyService.list:', err);
    }
    return [];
  }

  static async search(term: string): Promise<ClientTenant[]> {
    const all = await this.list();
    const lower = term.toLowerCase();
    return all.filter(t => 
      t.companyName.toLowerCase().includes(lower) || 
      t.cnpj.includes(lower) || 
      t.ownerEmail.toLowerCase().includes(lower)
    );
  }

  static async count(): Promise<number> {
    const all = await this.list();
    return all.length;
  }

  static async paginate(page: number, pageSize: number): Promise<{ items: ClientTenant[]; total: number }> {
    const all = await this.list();
    const start = (page - 1) * pageSize;
    return {
      items: all.slice(start, start + pageSize),
      total: all.length
    };
  }
}
