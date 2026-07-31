import { IaAnalise } from './types';

const STORAGE_KEY = 'mais_rh_ia_analises';

const INITIAL_ANALYSES: IaAnalise[] = [];

export function getIaAnalises(): IaAnalise[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ANALYSES));
      return INITIAL_ANALYSES;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading ia_analises from localStorage:', err);
    return INITIAL_ANALYSES;
  }
}

export function saveIaAnalise(analiseData: Omit<IaAnalise, 'id' | 'dataCriacao'>): IaAnalise {
  const currentList = getIaAnalises();
  
  // Check if analysis already exists for this vaga + candidato
  const existingIndex = currentList.findIndex(
    item => item.vagaId === analiseData.vagaId && item.candidatoId === analiseData.candidatoId
  );

  const newAnalise: IaAnalise = {
    ...analiseData,
    id: existingIndex >= 0 ? currentList[existingIndex].id : `ana-${Date.now()}`,
    dataCriacao: new Date().toISOString()
  };

  let updated: IaAnalise[];
  if (existingIndex >= 0) {
    updated = [...currentList];
    updated[existingIndex] = newAnalise;
  } else {
    updated = [newAnalise, ...currentList];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving ia_analise to localStorage:', err);
  }

  return newAnalise;
}

export function getAnaliseByCandidatoEVaga(candidatoId: string, vagaId?: string): IaAnalise | undefined {
  const list = getIaAnalises();
  if (vagaId) {
    return list.find(item => item.candidatoId === candidatoId && item.vagaId === vagaId);
  }
  return list.find(item => item.candidatoId === candidatoId);
}

export function getAnalisesByVaga(vagaId: string): IaAnalise[] {
  const list = getIaAnalises();
  return list.filter(item => item.vagaId === vagaId);
}
