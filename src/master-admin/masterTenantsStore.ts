import { ClientTenant } from './types/master';
import { MOCK_TENANTS } from './data/mockMasterData';

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
 * Adds or updates a single tenant and persists to localStorage.
 */
export function saveTenant(tenantData: Partial<ClientTenant>): ClientTenant[] {
  const current = getTenants();
  const exists = current.find(t => t.id === tenantData.id);
  let updated: ClientTenant[];

  if (exists) {
    updated = current.map(t => t.id === tenantData.id ? { ...t, ...tenantData } as ClientTenant : t);
  } else {
    updated = [tenantData as ClientTenant, ...current];
  }

  saveTenantsToStorage(updated);
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
  return updated;
}

/**
 * Removes a tenant by ID.
 */
export function deleteTenant(tenantId: string): ClientTenant[] {
  const current = getTenants();
  const updated = current.filter(t => t.id !== tenantId);
  saveTenantsToStorage(updated);
  return updated;
}
