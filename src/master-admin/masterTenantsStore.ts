import { ClientTenant, TenantModulePermissions } from './types/master';
import { MOCK_TENANTS } from './data/mockMasterData';
import { 
  fetchEmpresasFirestore, 
  saveEmpresaFirestore, 
  deleteEmpresaFirestore,
  saveEmpresaModuloFirestore 
} from '../lib/firestoreServices';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const STORAGE_KEY = 'mais_rh_master_tenants';

/**
 * Retrieves all tenants from localStorage or returns initial mock tenants.
 */
export function getTenants(): ClientTenant[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Erro ao carregar empresas do localStorage:', err);
  }

  return [];
}

/**
 * Async fetch from Firestore and update localStorage.
 */
export async function syncTenantsFromFirestore(): Promise<ClientTenant[]> {
  try {
    const firestoreTenants = await fetchEmpresasFirestore();
    if (firestoreTenants && firestoreTenants.length > 0) {
      saveTenantsToStorage(firestoreTenants);
      return firestoreTenants;
    }
  } catch (err) {
    console.warn('Erro na sincronização de empresas do Firestore:', err);
  }
  return getTenants();
}

/**
 * Saves full tenant list to localStorage.
 */
export function saveTenantsToStorage(tenants: ClientTenant[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tenants));
  } catch (err) {
    console.error('Erro ao salvar empresas no localStorage:', err);
  }
}

/**
 * Adds or updates a single tenant asynchronously and persists to Firestore and localStorage.
 */
export async function saveTenantAsync(tenantData: Partial<ClientTenant>): Promise<ClientTenant[]> {
  const current = getTenants();
  const tenantId = tenantData.id || `t-${Date.now()}`;
  const fullTenantData: ClientTenant = {
    id: tenantId,
    code: tenantData.code || (tenantData.companyName || 'EMP').substring(0, 5).toUpperCase(),
    companyName: tenantData.companyName || 'Empresa Cadastrada',
    tradeName: tenantData.tradeName || tenantData.companyName || 'Empresa Cadastrada',
    cnpj: tenantData.cnpj || '00.000.000/0001-00',
    ownerName: tenantData.ownerName || 'Administrador',
    ownerEmail: tenantData.ownerEmail || 'admin@empresa.com.br',
    ownerPhone: tenantData.ownerPhone || '(11) 99999-8888',
    status: tenantData.status || 'Ativo',
    maxUsers: tenantData.maxUsers || 10,
    maxActiveJobs: tenantData.maxActiveJobs || 20,
    modules: tenantData.modules || {
      vagas: true,
      headhunter: true,
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
      companyDisplayName: tenantData.companyName || 'Empresa Cadastrada'
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
      id: `ctr-${tenantId}`,
      contractNumber: `CTR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      planName: 'Básico',
      monthlyFee: 1200,
      billingCycle: 'Mensal',
      startDate: new Date().toISOString().split('T')[0],
      expirationDate: '2027-01-01',
      paymentMethod: 'Pix',
      autoRenew: true
    },
    address: tenantData.address,
    adminCredentials: tenantData.adminCredentials,
    createdAt: tenantData.createdAt || new Date().toISOString().split('T')[0]
  };

  const exists = current.find(t => t.id === tenantId);
  let updated: ClientTenant[];

  if (exists) {
    updated = current.map(t => t.id === tenantId ? { ...t, ...fullTenantData } : t);
  } else {
    updated = [fullTenantData, ...current];
  }

  saveTenantsToStorage(updated);

  // 1. Save company and modules to Firestore
  try {
    await saveEmpresaFirestore(fullTenantData);
  } catch (err) {
    console.error('Falha na persistência remota da empresa no Firestore:', err);
  }

  // 2. Create/Sync admin user in Auth & Firestore
  const adminEmail = fullTenantData.adminCredentials?.adminEmail || fullTenantData.ownerEmail;
  if (adminEmail) {
    try {
      const res = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail,
          password: fullTenantData.adminCredentials?.initialPassword || 'Gugato94@',
          nome: fullTenantData.ownerName || fullTenantData.companyName || 'Administrador',
          role: 'ADMIN_EMPRESA',
          empresaId: tenantId,
          ativo: fullTenantData.status === 'Ativo'
        })
      });

      const resData = await res.json();
      const uid = resData?.uid;

      if (uid) {
        // Guarantee write to `usuarios` and `users` Firestore collections with full profile
        const userProfile = {
          uid,
          email: adminEmail,
          nome: fullTenantData.ownerName || fullTenantData.companyName || 'Administrador',
          role: 'ADMIN_EMPRESA',
          tipoUsuario: 'EMPRESA',
          empresaId: tenantId,
          companyId: tenantId,
          companyName: fullTenantData.companyName || 'Empresa Nova',
          ativo: fullTenantData.status === 'Ativo',
          status: fullTenantData.status || 'Ativo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await setDoc(doc(db, 'usuarios', uid), userProfile, { merge: true });
        await setDoc(doc(db, 'users', uid), userProfile, { merge: true });

        // Save initial company config doc
        await setDoc(doc(db, 'configuracoes_gerais', tenantId), {
          empresaId: tenantId,
          companyName: fullTenantData.companyName,
          cnpj: fullTenantData.cnpj,
          email: fullTenantData.ownerEmail,
          phone: fullTenantData.ownerPhone,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (err) {
      console.warn('Aviso ao sincronizar usuário admin da empresa:', err);
    }
  }

  return updated;
}

/**
 * Adds or updates a single tenant and persists to Firestore and localStorage.
 */
export function saveTenant(tenantData: Partial<ClientTenant>): ClientTenant[] {
  saveTenantAsync(tenantData).catch(err => {
    console.error('Erro em saveTenantAsync:', err);
  });

  const current = getTenants();
  const tenantId = tenantData.id || `t-${Date.now()}`;
  const fullTenantData = { ...tenantData, id: tenantId };
  const exists = current.find(t => t.id === tenantId);
  const updated = exists
    ? current.map(t => t.id === tenantId ? { ...t, ...fullTenantData } as ClientTenant : t)
    : [fullTenantData as ClientTenant, ...current];
  saveTenantsToStorage(updated);
  return updated;
}

/**
 * Updates a specific module activation for a given tenant.
 */
export function updateTenantModule(tenantId: string, moduleKey: string, active: boolean): ClientTenant[] {
  const current = getTenants();
  const updated: ClientTenant[] = current.map(t => {
    if (t.id === tenantId) {
      const updatedModules = {
        ...(t.modules || {}),
        [moduleKey]: active
      } as TenantModulePermissions;
      return {
        ...t,
        modules: updatedModules
      };
    }
    return t;
  });

  saveTenantsToStorage(updated);

  // Sync with Firestore `empresa_modulos` and `empresas`
  saveEmpresaModuloFirestore(tenantId, moduleKey, active).catch(err => {
    console.error('Erro ao salvar permissão no Firestore empresa_modulos:', err);
  });

  return updated;
}

/**
 * Toggles status for a given tenant.
 */
export function toggleTenantStatus(tenantId: string, currentStatus: string): ClientTenant[] {
  const current = getTenants();
  const nextStatus = currentStatus === 'Ativo' ? 'Suspenso' : 'Ativo';
  const updated = current.map(t => t.id === tenantId ? { ...t, status: nextStatus as any } : t);
  saveTenantsToStorage(updated);

  const target = updated.find(t => t.id === tenantId);
  if (target) {
    saveEmpresaFirestore(target).catch(console.error);
  }

  return updated;
}

/**
 * Removes a tenant by ID and syncs with Firestore.
 */
export async function deleteTenant(tenantId: string): Promise<ClientTenant[]> {
  const current = getTenants();
  const updated = current.filter(t => t.id !== tenantId);
  saveTenantsToStorage(updated);

  try {
    await deleteEmpresaFirestore(tenantId);
  } catch (err) {
    console.error('Erro ao excluir empresa do Firestore:', err);
  }

  return updated;
}
