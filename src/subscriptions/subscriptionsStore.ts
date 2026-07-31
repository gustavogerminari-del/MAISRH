import { ClientSubscription } from './types';
import { MOCK_SUBSCRIPTIONS } from './mockData';

const STORAGE_KEY = 'mais_rh_subscriptions';

export function getSubscriptions(): ClientSubscription[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Erro ao carregar assinaturas do localStorage:', err);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch (err) {
    console.error('Erro ao inicializar assinaturas no localStorage:', err);
  }
  return [];
}

export function saveSubscriptionsToStorage(subs: ClientSubscription[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subs));
  } catch (err) {
    console.error('Erro ao salvar assinaturas no localStorage:', err);
  }
}

export function addSubscription(sub: ClientSubscription): ClientSubscription[] {
  const current = getSubscriptions();
  const updated = [sub, ...current];
  saveSubscriptionsToStorage(updated);
  return updated;
}

export function updateSubscription(sub: ClientSubscription): ClientSubscription[] {
  const current = getSubscriptions();
  const updated = current.map(s => s.id === sub.id ? sub : s);
  saveSubscriptionsToStorage(updated);
  return updated;
}
