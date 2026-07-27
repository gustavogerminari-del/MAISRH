import { ClientTenant, TenantModulePermissions } from './types/master';
import { MOCK_TENANTS } from './data/mockMasterData';
import { 
  fetchEmpresasFirestore, 
  saveEmpresaFirestore, 
  deleteEmpresaFirestore,
  saveEmpresaModuloFirestore 
} from '../lib/firestoreServices';

const STORAGE_KEY = 'mais_rh_master_tenants';

/**
 * Retrieves all tenants from localStorage or returns initial mock tenants.
 */
export function getTenants(): ClientTenant[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Erro ao carregar empresas do localStorage:', err);
  }

  // Fallback and seed
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_TENANTS));
  } catch (err) {
    console.error('Erro ao inicializar empresas no localStorage:', err);
  }
  return MOCK_TENANTS;
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
 * Adds or updates a single tenant and persists to Firestore and localStorage.
 */
export function saveTenant(tenantData: Partial<ClientTenant>): ClientTenant[] {
  const current = getTenants();
  const tenantId = tenantData.id || `t-${Date.now()}`;
  const fullTenantData = {
    ...tenantData,
    id: tenantId
  };

  const exists = current.find(t => t.id === tenantId);
  let updated: ClientTenant[];

  if (exists) {
    updated = current.map(t => t.id === tenantId ? { ...t, ...fullTenantData } as ClientTenant : t);
  } else {
    updated = [fullTenantData as ClientTenant, ...current];
  }

  saveTenantsToStorage(updated);

  // Firestore Sync
  saveEmpresaFirestore(fullTenantData).catch(err => {
    console.error('Falha na persistência remota da empresa no Firestore:', err);
  });

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
 * Removes a tenant by ID.
 */
export function deleteTenant(tenantId: string): ClientTenant[] {
  const current = getTenants();
  const updated = current.filter(t => t.id !== tenantId);
  saveTenantsToStorage(updated);

  deleteEmpresaFirestore(tenantId).catch(console.error);

  return updated;
}
