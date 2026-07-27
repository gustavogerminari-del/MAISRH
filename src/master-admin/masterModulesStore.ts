import { PlatformModule } from './types/master';
import { MOCK_PLATFORM_MODULES } from './data/mockMasterData';
import { fetchModulosFirestore, saveModuloFirestore } from '../lib/firestoreServices';

const STORAGE_KEY = 'mais_rh_platform_modules';

export function getPlatformModules(): PlatformModule[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Erro ao carregar módulos do localStorage:', err);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PLATFORM_MODULES));
  } catch (err) {
    console.error('Erro ao inicializar módulos no localStorage:', err);
  }
  return MOCK_PLATFORM_MODULES;
}

export async function syncPlatformModulesFromFirestore(): Promise<PlatformModule[]> {
  try {
    const remoteModules = await fetchModulosFirestore();
    if (remoteModules && remoteModules.length > 0) {
      savePlatformModulesToStorage(remoteModules);
      return remoteModules;
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

export function savePlatformModule(moduleData: PlatformModule): PlatformModule[] {
  const current = getPlatformModules();
  const exists = current.find(m => m.id === moduleData.id);
  let updated: PlatformModule[];

  if (exists) {
    updated = current.map(m => m.id === moduleData.id ? moduleData : m);
  } else {
    updated = [moduleData, ...current];
  }

  savePlatformModulesToStorage(updated);

  // Firestore sync
  saveModuloFirestore(moduleData).catch(err => {
    console.error('Erro ao salvar módulo no Firestore:', err);
  });

  return updated;
}
