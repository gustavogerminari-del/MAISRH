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
import { AuditService } from './AuditService';

const COLLECTION_NAME = 'users';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  companyId: string;
  tipoUsuario?: 'MASTER' | 'EMPRESA' | 'CANDIDATO' | 'FUNCIONARIO';
  status: string;
  permissions?: string[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export class UserService {
  static async create(userData: Partial<UserProfile>): Promise<UserProfile> {
    const uid = userData.uid || `usr-${Date.now()}`;
    const user = auth.currentUser;
    const now = new Date().toISOString();

    const profile: UserProfile = {
      uid,
      email: userData.email || 'usuario@empresa.com.br',
      displayName: userData.displayName || 'Novo Usuário',
      role: userData.role || 'Colaborador',
      companyId: userData.companyId || 'emp-001',
      tipoUsuario: userData.tipoUsuario || 'EMPRESA',
      status: userData.status || 'Ativo',
      permissions: userData.permissions || [],
      createdBy: user?.uid || 'system',
      createdAt: userData.createdAt || now,
      updatedAt: now
    };

    try {
      await setDoc(doc(db, COLLECTION_NAME, uid), sanitizeFirestoreData(profile), { merge: true });
      await AuditService.log({
        action: 'CREATE',
        description: `Usuário ${profile.displayName} (${profile.email}) criado`,
        moduleName: 'Configurações',
        targetEntity: 'Usuário',
        companyId: profile.companyId
      });
    } catch (err) {
      console.warn('Erro ao criar usuário no Firestore:', err);
    }

    return profile;
  }

  static async update(uid: string, data: Partial<UserProfile>): Promise<void> {
    try {
      await setDoc(doc(db, COLLECTION_NAME, uid), sanitizeFirestoreData({
        ...data,
        updatedAt: new Date().toISOString()
      }), { merge: true });

      await AuditService.log({
        action: 'UPDATE',
        description: `Perfil do usuário ${uid} atualizado`,
        moduleName: 'Configurações',
        targetEntity: 'Usuário',
        companyId: data.companyId || 'emp-001'
      });
    } catch (err) {
      console.warn('Erro ao atualizar usuário no Firestore:', err);
    }
  }

  static async delete(uid: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, uid));
      await AuditService.log({
        action: 'DELETE',
        description: `Usuário ${uid} excluído`,
        moduleName: 'Configurações',
        targetEntity: 'Usuário'
      });
    } catch (err) {
      console.warn('Erro ao excluir usuário no Firestore:', err);
    }
  }

  static async getById(uid: string): Promise<UserProfile | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION_NAME, uid));
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
    } catch (err) {
      console.warn('Erro em UserService.getById:', err);
    }
    return null;
  }

  static async get(uid: string): Promise<UserProfile | null> {
    return this.getById(uid);
  }

  static async list(companyId?: string): Promise<UserProfile[]> {
    try {
      const q = companyId 
        ? query(collection(db, COLLECTION_NAME), where('companyId', '==', companyId))
        : collection(db, COLLECTION_NAME);
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list: UserProfile[] = [];
        snap.forEach(d => list.push(d.data() as UserProfile));
        return list;
      }
    } catch (err) {
      console.warn('Erro em UserService.list:', err);
    }
    return [];
  }

  static async search(term: string, companyId?: string): Promise<UserProfile[]> {
    const all = await this.list(companyId);
    const lower = term.toLowerCase();
    return all.filter(u => 
      u.displayName.toLowerCase().includes(lower) || 
      u.email.toLowerCase().includes(lower) ||
      u.role.toLowerCase().includes(lower)
    );
  }

  static async count(companyId?: string): Promise<number> {
    const all = await this.list(companyId);
    return all.length;
  }

  static async paginate(page: number, pageSize: number, companyId?: string): Promise<{ items: UserProfile[]; total: number }> {
    const all = await this.list(companyId);
    const start = (page - 1) * pageSize;
    return {
      items: all.slice(start, start + pageSize),
      total: all.length
    };
  }
}
