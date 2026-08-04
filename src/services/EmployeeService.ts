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
import { InternalTeamMember } from '../internal-team/types/team';
import { AuditService } from './AuditService';

const COLLECTION_NAME = 'employees';

export class EmployeeService {
  static async create(empData: Partial<InternalTeamMember> & { empresaId?: string; companyId?: string }): Promise<InternalTeamMember> {
    const id = empData.id || `emp-${Date.now()}`;
    const user = auth.currentUser;
    const now = new Date().toISOString();
    const resolvedEmpresaId = resolveEmpresaId(empData.empresaId || empData.companyId);

    const employee: InternalTeamMember & { empresaId: string; companyId: string; createdBy: string; createdAt: string; updatedAt: string } = {
      id,
      name: empData.name || 'Novo Colaborador',
      email: empData.email || 'colaborador@empresa.com.br',
      phone: empData.phone || '(11) 98888-7777',
      roleProfile: empData.roleProfile || 'Gestor de Seleção',
      roleType: empData.roleType || 'Recrutador',
      jobTitle: empData.jobTitle || 'Analista de RH',
      seniority: empData.seniority || 'Pleno',
      departmentId: empData.departmentId || 'dep-1',
      departmentName: empData.departmentName || 'Recursos Humanos',
      specialty: empData.specialty || 'Geral',
      avatar: empData.avatar || '',
      status: empData.status || 'Ativo',
      hireDate: empData.hireDate || new Date().toISOString().split('T')[0],
      processControl: empData.processControl || { maxJobCapacity: 10, activeJobsCount: 0, assignedProcesses: [] },
      metrics: empData.metrics || {
        avgTimeToHireDays: 20,
        slaTargetDays: 25,
        slaComplianceRate: 95,
        interviewsConductedMonth: 12,
        screenedCandidatesMonth: 45,
        hiredCandidatesYear: 8,
        managerNpsScore: 4.8,
        offerAcceptanceRate: 90
      },
      permissions: empData.permissions || {
        canCreateJobs: true,
        canEditJobs: true,
        canCloseJobs: false,
        canViewSalaries: false,
        canApproveHires: true,
        canDeleteCandidates: false,
        canScheduleInterviews: true,
        canExportReports: true,
        canManageTeam: false
      },
      empresaId: resolvedEmpresaId,
      companyId: resolvedEmpresaId,
      createdBy: user?.uid || 'system',
      createdAt: now,
      updatedAt: now
    };

    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, sanitizeFirestoreData(employee), { merge: true });
    
    await AuditService.log({
      action: 'CREATE',
      description: `Colaborador ${employee.name} admitido no departamento ${employee.departmentName}`,
      moduleName: 'Equipe Interna',
      targetEntity: 'Funcionário',
      empresaId: resolvedEmpresaId,
      companyId: resolvedEmpresaId
    }).catch(err => console.warn('Falha no log de auditoria:', err));

    return employee;
  }

  static async update(id: string, data: Partial<InternalTeamMember>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, sanitizeFirestoreData({
      ...data,
      updatedAt: new Date().toISOString()
    }), { merge: true });

    await AuditService.log({
      action: 'UPDATE',
      description: `Cadastro do colaborador ${id} atualizado`,
      moduleName: 'Equipe Interna',
      targetEntity: 'Funcionário'
    }).catch(err => console.warn('Falha no log de auditoria:', err));
  }

  static async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    await AuditService.log({
      action: 'DELETE',
      description: `Colaborador ${id} desativado / removido`,
      moduleName: 'Equipe Interna',
      targetEntity: 'Funcionário'
    }).catch(err => console.warn('Falha no log de auditoria:', err));
  }

  static async getById(id: string): Promise<InternalTeamMember | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION_NAME, id));
      if (snap.exists()) {
        return snap.data() as InternalTeamMember;
      }
    } catch (err) {
      console.error('Erro em EmployeeService.getById:', err);
    }
    return null;
  }

  static async get(id: string): Promise<InternalTeamMember | null> {
    return this.getById(id);
  }

  static async list(empresaId?: string): Promise<InternalTeamMember[]> {
    try {
      if (empresaId) {
        const resolvedId = resolveEmpresaId(empresaId);
        const q = query(collection(db, COLLECTION_NAME), where('empresaId', '==', resolvedId));
        const snap = await getDocs(q);
        const list: InternalTeamMember[] = [];
        snap.forEach(d => list.push(d.data() as InternalTeamMember));
        return list;
      } else {
        const snap = await getDocs(collection(db, COLLECTION_NAME));
        const list: InternalTeamMember[] = [];
        snap.forEach(d => list.push(d.data() as InternalTeamMember));
        return list;
      }
    } catch (err) {
      console.error('Erro em EmployeeService.list:', err);
      return [];
    }
  }

  static async search(term: string, empresaId?: string): Promise<InternalTeamMember[]> {
    const all = await this.list(empresaId);
    const lower = term.toLowerCase();
    return all.filter(e => 
      e.name.toLowerCase().includes(lower) || 
      e.email.toLowerCase().includes(lower) ||
      e.departmentName.toLowerCase().includes(lower) ||
      e.jobTitle.toLowerCase().includes(lower)
    );
  }

  static async count(empresaId?: string): Promise<number> {
    const all = await this.list(empresaId);
    return all.length;
  }

  static async paginate(page: number, pageSize: number, empresaId?: string): Promise<{ items: InternalTeamMember[]; total: number }> {
    const all = await this.list(empresaId);
    const start = (page - 1) * pageSize;
    return {
      items: all.slice(start, start + pageSize),
      total: all.length
    };
  }
}
