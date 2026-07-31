import { PlatformModule, PlatformModuleAuditLog } from './types/master';
import { MOCK_PLATFORM_MODULES } from './data/mockMasterData';
import { fetchModulosFirestore, saveModuloFirestore } from '../lib/firestoreServices';

const STORAGE_KEY = 'mais_rh_platform_modules';
const AUDIT_LOGS_KEY = 'mais_rh_platform_module_audit_logs';

/**
 * Auto-detect and merge implemented platform modules into storage
 */
export function getPlatformModules(): PlatformModule[] {
  let existing: PlatformModule[] = [];

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        existing = parsed;
      }
    }
  } catch (err) {
    console.error('Erro ao carregar módulos do localStorage:', err);
  }

  return existing;
}

export async function syncPlatformModulesFromFirestore(): Promise<PlatformModule[]> {
  try {
    const remoteModules = await fetchModulosFirestore();
    if (remoteModules && remoteModules.length > 0) {
      // Merge remote with local implemented defaults
      const local = getPlatformModules();
      const mergedMap = new Map<string, PlatformModule>();
      
      local.forEach(m => mergedMap.set(m.id, m));
      remoteModules.forEach(m => {
        const existing = mergedMap.get(m.id);
        mergedMap.set(m.id, {
          ...(existing || {}),
          ...m,
          route: m.route || existing?.route || 'vagas',
          slug: m.slug || existing?.slug || m.key
        } as PlatformModule);
      });

      const mergedList = Array.from(mergedMap.values());
      savePlatformModulesToStorage(mergedList);
      return mergedList;
    }
  } catch (err) {
    console.warn('Erro ao sincronizar módulos do Firestore:', err);
  }
  return getPlatformModules();
}

export function savePlatformModulesToStorage(modules: PlatformModule[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(modules));
  } catch (err) {
    console.error('Erro ao salvar módulos no localStorage:', err);
  }
}

export function savePlatformModule(moduleData: PlatformModule, currentUser = 'Master Admin'): PlatformModule[] {
  const current = getPlatformModules();
  const exists = current.find(m => m.id === moduleData.id || m.key === moduleData.key);
  let updated: PlatformModule[];

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const updatedModule = {
    ...moduleData,
    updatedAt: now,
  };

  if (exists) {
    updated = current.map(m => (m.id === moduleData.id || m.key === moduleData.key) ? updatedModule : m);
    logModuleAuditAction(moduleData.id, 'EDIÇÃO', currentUser, `Módulo '${moduleData.name}' atualizado.`);
  } else {
    updated = [updatedModule, ...current];
    logModuleAuditAction(moduleData.id, 'CRIAÇÃO', currentUser, `Módulo '${moduleData.name}' criado com sucesso.`);
  }

  savePlatformModulesToStorage(updated);

  // Firestore sync
  saveModuloFirestore(updatedModule).catch(err => {
    console.error('Erro ao salvar módulo no Firestore:', err);
  });

  return updated;
}

export function togglePlatformModuleStatus(moduleId: string, currentUser = 'Master Admin'): PlatformModule[] {
  const current = getPlatformModules();
  const updated = current.map(m => {
    if (m.id === moduleId) {
      if (m.isCore) {
        console.warn('Módulos CORE não podem ser desativados.');
        return m;
      }
      const newStatus = m.status === 'Ativo' ? 'Desativado' : 'Ativo';
      logModuleAuditAction(
        m.id, 
        newStatus === 'Ativo' ? 'ATIVAÇÃO' : 'DESATIVAÇÃO', 
        currentUser, 
        `Módulo '${m.name}' alterado para status ${newStatus}.`
      );
      return {
        ...m,
        status: newStatus as any,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
    }
    return m;
  });

  savePlatformModulesToStorage(updated);
  
  const target = updated.find(m => m.id === moduleId);
  if (target) {
    saveModuloFirestore(target).catch(console.error);
  }

  return updated;
}

export function getModuleAuditLogs(): PlatformModuleAuditLog[] {
  try {
    const saved = localStorage.getItem(AUDIT_LOGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Erro ao ler logs de auditoria:', e);
  }
  return [];
}

export function logModuleAuditAction(
  moduleId: string, 
  action: string, 
  changedBy: string, 
  details: string
): void {
  const logs = getModuleAuditLogs();
  const newLog: PlatformModuleAuditLog = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    moduleId,
    action,
    changedBy,
    details,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    ipAddress: '187.108.22.14'
  };
  const updated = [newLog, ...logs].slice(0, 100);
  try {
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Erro ao salvar log de auditoria de módulo:', err);
  }
}

