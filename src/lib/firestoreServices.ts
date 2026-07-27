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
import { db } from './firebase';
import { ClientTenant, PlatformModule, TenantModulePermissions } from '../master-admin/types/master';
import { MOCK_TENANTS, MOCK_PLATFORM_MODULES } from '../master-admin/data/mockMasterData';

export const COLLECTIONS = {
  EMPRESAS: 'empresas',
  MODULOS: 'modulos',
  EMPRESA_MODULOS: 'empresa_modulos',
  USUARIOS: 'usuarios',
  VAGAS: 'vagas',
  CANDIDATOS: 'candidatos',
  CANDIDATURAS: 'candidaturas',
} as const;

export interface EmpresaFirestoreDoc {
  empresaId: string;
  nomeEmpresa: string;
  CNPJ: string;
  email: string;
  plano: string;
  status: string;
  dataCriacao: string;
  rawTenantData?: ClientTenant;
}

export interface ModuloFirestoreDoc {
  moduloId: string;
  nome: string;
  codigo: string;
  descricao: string;
  ativo: boolean;
  rawModuleData?: PlatformModule;
}

export interface EmpresaModuloDoc {
  id: string;
  empresaId: string;
  moduloId: string;
  ativo: boolean;
  dataLiberacao: string;
}

export interface UsuarioFirestoreDoc {
  uid: string;
  nome: string;
  email: string;
  tipoUsuario: 'MASTER' | 'EMPRESA' | 'CANDIDATO' | 'FUNCIONARIO';
  empresaId: string;
  status?: string;
  dataCriacao?: string;
}

/**
 * Utility to seed initial Firestore collections if empty.
 */
export async function seedFirestoreIfEmpty(): Promise<void> {
  try {
    const empresasSnap = await getDocs(collection(db, COLLECTIONS.EMPRESAS));
    if (empresasSnap.empty) {
      console.log('Coleção empresas vazia no Firestore. Semeando com dados de exemplo...');
      for (const tenant of MOCK_TENANTS) {
        await saveEmpresaFirestore(tenant);
      }
    }

    const modulosSnap = await getDocs(collection(db, COLLECTIONS.MODULOS));
    if (modulosSnap.empty) {
      console.log('Coleção modulos vazia no Firestore. Semeando com módulos da plataforma...');
      for (const mod of MOCK_PLATFORM_MODULES) {
        await saveModuloFirestore(mod);
      }
    }
  } catch (err) {
    console.warn('Semeação de dados iniciais no Firestore falhou (sem conexão ou permissão local):', err);
  }
}

// ----------------------------------------------------------------------------
// EMPRESAS
// ----------------------------------------------------------------------------
export async function fetchEmpresasFirestore(): Promise<ClientTenant[]> {
  try {
    await seedFirestoreIfEmpty();
    const snap = await getDocs(collection(db, COLLECTIONS.EMPRESAS));
    if (!snap.empty) {
      const list: ClientTenant[] = [];
      snap.forEach(docSnap => {
        const data = docSnap.data() as EmpresaFirestoreDoc;
        if (data.rawTenantData) {
          list.push({
            ...data.rawTenantData,
            id: data.empresaId || docSnap.id,
            companyName: data.nomeEmpresa || data.rawTenantData.companyName,
            cnpj: data.CNPJ || data.rawTenantData.cnpj,
            ownerEmail: data.email || data.rawTenantData.ownerEmail
          });
        } else {
          const defaultModules: TenantModulePermissions = {
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
          };

          list.push({
            id: data.empresaId || docSnap.id,
            code: (data.nomeEmpresa || 'EMP').substring(0, 5).toUpperCase(),
            companyName: data.nomeEmpresa || 'Empresa Cadastrada',
            tradeName: data.nomeEmpresa || 'Empresa Cadastrada',
            cnpj: data.CNPJ || '00.000.000/0001-00',
            ownerName: 'Administrador',
            ownerEmail: data.email || 'admin@empresa.com.br',
            ownerPhone: '(11) 99999-8888',
            status: (data.status as any) || 'Ativo',
            maxUsers: 10,
            maxActiveJobs: 20,
            modules: defaultModules,
            branding: {
              primaryColor: '#2563EB',
              companyDisplayName: data.nomeEmpresa
            },
            metrics: {
              activeUsersCount: 1,
              totalJobsCreated: 0,
              totalTalentsStored: 0,
              totalDocumentsSigned: 0,
              storageUsedMB: 10,
              lastLoginAt: 'Hoje'
            },
            contract: {
              id: `ctr-${docSnap.id}`,
              contractNumber: `CTR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              planName: (data.plano as any) || 'Básico',
              monthlyFee: 1200,
              billingCycle: 'Mensal',
              startDate: data.dataCriacao || '2026-01-01',
              expirationDate: '2027-01-01',
              paymentMethod: 'Pix',
              autoRenew: true
            },
            createdAt: data.dataCriacao
          });
        }
      });
      return list;
    }
  } catch (err) {
    console.error('Erro ao buscar empresas do Firestore:', err);
  }

  // Fallback local storage or mocks
  const saved = localStorage.getItem('mais_rh_master_tenants');
  return saved ? JSON.parse(saved) : MOCK_TENANTS;
}

export async function saveEmpresaFirestore(tenantData: Partial<ClientTenant>): Promise<void> {
  const empresaId = tenantData.id || `emp-${Date.now()}`;
  const empresaDocRef = doc(db, COLLECTIONS.EMPRESAS, empresaId);

  const docData: EmpresaFirestoreDoc = {
    empresaId,
    nomeEmpresa: tenantData.companyName || tenantData.tradeName || 'Empresa Nova',
    CNPJ: tenantData.cnpj || '00.000.000/0001-00',
    email: tenantData.ownerEmail || 'contato@empresa.com.br',
    plano: tenantData.contract?.planName || 'Básico',
    status: tenantData.status || 'Ativo',
    dataCriacao: tenantData.createdAt || new Date().toISOString().split('T')[0],
    rawTenantData: {
      ...tenantData,
      id: empresaId
    } as ClientTenant
  };

  try {
    await setDoc(empresaDocRef, docData, { merge: true });
    
    // Storing module mappings in `empresa_modulos`
    if (tenantData.modules) {
      for (const [moduleCode, isEnabled] of Object.entries(tenantData.modules)) {
        await saveEmpresaModuloFirestore(empresaId, moduleCode, !!isEnabled);
      }
    }
  } catch (err) {
    console.error('Erro ao salvar empresa no Firestore:', err);
  }
}

export async function deleteEmpresaFirestore(empresaId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.EMPRESAS, empresaId));
  } catch (err) {
    console.error('Erro ao excluir empresa do Firestore:', err);
  }
}

// ----------------------------------------------------------------------------
// MÓDULOS
// ----------------------------------------------------------------------------
export async function fetchModulosFirestore(): Promise<PlatformModule[]> {
  try {
    await seedFirestoreIfEmpty();
    const snap = await getDocs(collection(db, COLLECTIONS.MODULOS));
    if (!snap.empty) {
      const list: PlatformModule[] = [];
      snap.forEach(docSnap => {
        const data = docSnap.data() as ModuloFirestoreDoc;
        if (data.rawModuleData) {
          list.push({
            ...data.rawModuleData,
            id: data.moduloId || docSnap.id,
            name: data.nome || data.rawModuleData.name,
            key: data.codigo || data.rawModuleData.key,
            description: data.descricao || data.rawModuleData.description,
            status: data.ativo ? 'Ativo' : 'Inativo'
          });
        } else {
          list.push({
            id: data.moduloId || docSnap.id,
            key: data.codigo,
            name: data.nome,
            category: 'Recrutamento',
            description: data.descricao,
            status: data.ativo ? 'Ativo' : 'Inativo',
            isCore: false,
            activeTenantsCount: 1,
            iconName: 'Sliders'
          });
        }
      });
      return list;
    }
  } catch (err) {
    console.error('Erro ao buscar módulos do Firestore:', err);
  }

  const saved = localStorage.getItem('mais_rh_platform_modules');
  return saved ? JSON.parse(saved) : MOCK_PLATFORM_MODULES;
}

export async function saveModuloFirestore(moduleData: PlatformModule): Promise<void> {
  const moduloId = moduleData.id || `mod-${Date.now()}`;
  const docRef = doc(db, COLLECTIONS.MODULOS, moduloId);

  const docData: ModuloFirestoreDoc = {
    moduloId,
    nome: moduleData.name,
    codigo: moduleData.key,
    descricao: moduleData.description,
    ativo: moduleData.status === 'Ativo',
    rawModuleData: {
      ...moduleData,
      id: moduloId
    }
  };

  try {
    await setDoc(docRef, docData, { merge: true });
  } catch (err) {
    console.error('Erro ao salvar módulo no Firestore:', err);
  }
}

// ----------------------------------------------------------------------------
// RELAÇÃO EMPRESA X MÓDULO (empresa_modulos)
// ----------------------------------------------------------------------------
export async function saveEmpresaModuloFirestore(
  empresaId: string, 
  moduloId: string, 
  ativo: boolean
): Promise<void> {
  const docId = `${empresaId}_${moduloId}`;
  const docRef = doc(db, COLLECTIONS.EMPRESA_MODULOS, docId);

  const data: EmpresaModuloDoc = {
    id: docId,
    empresaId,
    moduloId,
    ativo,
    dataLiberacao: new Date().toISOString()
  };

  try {
    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    console.error('Erro ao salvar permissão de módulo no Firestore:', err);
  }
}

export async function fetchEmpresaModulosFirestore(empresaId: string): Promise<Record<string, boolean>> {
  const result: Record<string, boolean> = {};
  try {
    const q = query(
      collection(db, COLLECTIONS.EMPRESA_MODULOS), 
      where('empresaId', '==', empresaId)
    );
    const snap = await getDocs(q);
    snap.forEach(docSnap => {
      const data = docSnap.data() as EmpresaModuloDoc;
      result[data.moduloId] = data.ativo;
    });
    
    // If empty result, check rawTenantData in EMPRESAS
    if (Object.keys(result).length === 0) {
      const empresaRef = doc(db, COLLECTIONS.EMPRESAS, empresaId);
      const empSnap = await getDoc(empresaRef);
      if (empSnap.exists()) {
        const empData = empSnap.data() as EmpresaFirestoreDoc;
        return (empData.rawTenantData?.modules as unknown as Record<string, boolean>) || {};
      }
    }
  } catch (err) {
    console.error('Erro ao buscar empresa_modulos no Firestore:', err);
  }

  return result;
}

// ----------------------------------------------------------------------------
// USUÁRIOS
// ----------------------------------------------------------------------------
export async function saveUsuarioFirestore(userDoc: UsuarioFirestoreDoc): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.USUARIOS, userDoc.uid);
    await setDoc(docRef, userDoc, { merge: true });
  } catch (err) {
    console.error('Erro ao salvar usuário no Firestore:', err);
  }
}

export async function fetchUsuarioFirestore(uid: string): Promise<UsuarioFirestoreDoc | null> {
  try {
    const docRef = doc(db, COLLECTIONS.USUARIOS, uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UsuarioFirestoreDoc;
    }
  } catch (err) {
    console.error('Erro ao buscar usuário no Firestore:', err);
  }
  return null;
}
