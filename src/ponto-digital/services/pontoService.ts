import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { sanitizeFirestoreData } from '../../lib/firestoreUtils';
import { 
  RegistroPontoDoc, 
  EscalaTrabalhoDoc, 
  AjustePontoDoc, 
  BancoHorasDoc, 
  FuncionarioPontoInfo, 
  ConfiguracoesPonto,
  StatusPonto
} from '../types/ponto';

const COLLECTIONS = {
  REGISTROS: 'registros_ponto',
  ESCALAS: 'escalas',
  AJUSTES: 'ajustes_ponto',
  BANCO: 'banco_horas',
  FUNCIONARIOS: 'funcionarios',
  CONFIG: 'configuracoes_ponto'
} as const;

// Helper to wrap firestore errors gracefully
function handleFirestoreError(error: unknown, op: string, path: string) {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.includes('offline') || msg.includes('unavailable') || msg.includes('permission-denied')) {
    console.warn(`[Firestore Ponto - ${op} - ${path}]: Client is offline or unreachable. Using local storage fallback.`);
  } else {
    console.warn(`[Firestore Ponto - ${op} - ${path}]:`, error);
  }
}

// Default configuration template
export const DEFAULT_CONFIG: ConfiguracoesPonto = {
  empresaId: '',
  geofencingAtivo: false,
  latitudeCentro: -23.55052,
  longitudeCentro: -46.633308,
  raioPermitidoMetros: 500,
  exigirFoto: false,
  toleranciaAtrasoMinutos: 10,
  inicioAdicionalNoturno: '22:00',
  fimAdicionalNoturno: '05:00',
  sincronizarComFolha: true
};

// Local storage key constants
const STORAGE_KEYS = {
  REGISTROS: 'mrh_ponto_registros',
  ESCALAS: 'mrh_ponto_escalas',
  AJUSTES: 'mrh_ponto_ajustes',
  BANCO: 'mrh_ponto_banco',
  FUNCIONARIOS: 'mrh_ponto_funcionarios',
  CONFIG: 'mrh_ponto_config'
};

// ----------------------------------------------------------------------------
// REGISTROS DE PONTO
// ----------------------------------------------------------------------------
export async function fetchRegistrosPonto(empresaId: string, dataFiltro?: string): Promise<RegistroPontoDoc[]> {
  try {
    const q = dataFiltro 
      ? query(collection(db, COLLECTIONS.REGISTROS), where('empresaId', '==', empresaId), where('data', '==', dataFiltro))
      : query(collection(db, COLLECTIONS.REGISTROS), where('empresaId', '==', empresaId));
      
    const snap = await getDocs(q);
    if (!snap.empty) {
      const list: RegistroPontoDoc[] = [];
      snap.forEach(d => list.push(d.data() as RegistroPontoDoc));
      return list;
    }
  } catch (err) {
    handleFirestoreError(err, 'get', COLLECTIONS.REGISTROS);
  }

  // Local fallback
  const saved = localStorage.getItem(STORAGE_KEYS.REGISTROS);
  let list: RegistroPontoDoc[] = saved ? JSON.parse(saved) : [];
  if (dataFiltro) {
    list = list.filter(r => r.data === dataFiltro);
  }
  return list;
}

export async function salvarRegistroPonto(registro: RegistroPontoDoc): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.REGISTROS, registro.id);
    await setDoc(docRef, sanitizeFirestoreData(registro), { merge: true });
  } catch (err) {
    handleFirestoreError(err, 'write', COLLECTIONS.REGISTROS);
  }

  // Update localStorage
  const saved = localStorage.getItem(STORAGE_KEYS.REGISTROS);
  const list: RegistroPontoDoc[] = saved ? JSON.parse(saved) : [];
  const idx = list.findIndex(r => r.id === registro.id);
  if (idx >= 0) {
    list[idx] = registro;
  } else {
    list.unshift(registro);
  }
  localStorage.setItem(STORAGE_KEYS.REGISTROS, JSON.stringify(list));
}

// ----------------------------------------------------------------------------
// ESCALAS DE TRABALHO
// ----------------------------------------------------------------------------
export async function fetchEscalasPonto(empresaId: string): Promise<EscalaTrabalhoDoc[]> {
  try {
    const q = query(collection(db, COLLECTIONS.ESCALAS), where('empresaId', '==', empresaId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const list: EscalaTrabalhoDoc[] = [];
      snap.forEach(d => list.push(d.data() as EscalaTrabalhoDoc));
      return list;
    }
  } catch (err) {
    handleFirestoreError(err, 'get', COLLECTIONS.ESCALAS);
  }

  const saved = localStorage.getItem(STORAGE_KEYS.ESCALAS);
  return saved ? JSON.parse(saved) : [];
}

export async function salvarEscalaPonto(escala: EscalaTrabalhoDoc): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.ESCALAS, escala.id);
    await setDoc(docRef, sanitizeFirestoreData(escala), { merge: true });
  } catch (err) {
    handleFirestoreError(err, 'write', COLLECTIONS.ESCALAS);
  }

  const saved = localStorage.getItem(STORAGE_KEYS.ESCALAS);
  const list: EscalaTrabalhoDoc[] = saved ? JSON.parse(saved) : [];
  const idx = list.findIndex(e => e.id === escala.id);
  if (idx >= 0) {
    list[idx] = escala;
  } else {
    list.push(escala);
  }
  localStorage.setItem(STORAGE_KEYS.ESCALAS, JSON.stringify(list));
}

// ----------------------------------------------------------------------------
// AJUSTES DE PONTO
// ----------------------------------------------------------------------------
export async function fetchAjustesPonto(empresaId: string): Promise<AjustePontoDoc[]> {
  try {
    const q = query(collection(db, COLLECTIONS.AJUSTES), where('empresaId', '==', empresaId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const list: AjustePontoDoc[] = [];
      snap.forEach(d => list.push(d.data() as AjustePontoDoc));
      return list;
    }
  } catch (err) {
    handleFirestoreError(err, 'get', COLLECTIONS.AJUSTES);
  }

  const saved = localStorage.getItem(STORAGE_KEYS.AJUSTES);
  return saved ? JSON.parse(saved) : [];
}

export async function salvarAjustePonto(ajuste: AjustePontoDoc): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.AJUSTES, ajuste.id);
    await setDoc(docRef, sanitizeFirestoreData(ajuste), { merge: true });
  } catch (err) {
    handleFirestoreError(err, 'write', COLLECTIONS.AJUSTES);
  }

  const saved = localStorage.getItem(STORAGE_KEYS.AJUSTES);
  const list: AjustePontoDoc[] = saved ? JSON.parse(saved) : [];
  const idx = list.findIndex(a => a.id === ajuste.id);
  if (idx >= 0) {
    list[idx] = ajuste;
  } else {
    list.unshift(ajuste);
  }
  localStorage.setItem(STORAGE_KEYS.AJUSTES, JSON.stringify(list));
}

// ----------------------------------------------------------------------------
// BANCO DE HORAS
// ----------------------------------------------------------------------------
export async function fetchBancoHoras(empresaId: string): Promise<BancoHorasDoc[]> {
  try {
    const q = query(collection(db, COLLECTIONS.BANCO), where('empresaId', '==', empresaId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const list: BancoHorasDoc[] = [];
      snap.forEach(d => list.push(d.data() as BancoHorasDoc));
      return list;
    }
  } catch (err) {
    handleFirestoreError(err, 'get', COLLECTIONS.BANCO);
  }

  const saved = localStorage.getItem(STORAGE_KEYS.BANCO);
  return saved ? JSON.parse(saved) : [];
}

export async function salvarBancoHoras(banco: BancoHorasDoc): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.BANCO, banco.id);
    await setDoc(docRef, sanitizeFirestoreData(banco), { merge: true });
  } catch (err) {
    handleFirestoreError(err, 'write', COLLECTIONS.BANCO);
  }

  const saved = localStorage.getItem(STORAGE_KEYS.BANCO);
  const list: BancoHorasDoc[] = saved ? JSON.parse(saved) : [];
  const idx = list.findIndex(b => b.id === banco.id);
  if (idx >= 0) {
    list[idx] = banco;
  } else {
    list.push(banco);
  }
  localStorage.setItem(STORAGE_KEYS.BANCO, JSON.stringify(list));
}

// ----------------------------------------------------------------------------
// FUNCIONÁRIOS PONTO
// ----------------------------------------------------------------------------
export async function fetchFuncionariosPonto(empresaId: string): Promise<FuncionarioPontoInfo[]> {
  try {
    const q = query(collection(db, COLLECTIONS.FUNCIONARIOS), where('empresaId', '==', empresaId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const list: FuncionarioPontoInfo[] = [];
      snap.forEach(d => list.push(d.data() as FuncionarioPontoInfo));
      return list;
    }
  } catch (err) {
    handleFirestoreError(err, 'get', COLLECTIONS.FUNCIONARIOS);
  }

  const saved = localStorage.getItem(STORAGE_KEYS.FUNCIONARIOS);
  return saved ? JSON.parse(saved) : [];
}

export async function salvarFuncionarioPonto(func: FuncionarioPontoInfo): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.FUNCIONARIOS, func.id);
    await setDoc(docRef, sanitizeFirestoreData(func), { merge: true });
  } catch (err) {
    handleFirestoreError(err, 'write', COLLECTIONS.FUNCIONARIOS);
  }

  const saved = localStorage.getItem(STORAGE_KEYS.FUNCIONARIOS);
  const list: FuncionarioPontoInfo[] = saved ? JSON.parse(saved) : [];
  const idx = list.findIndex(f => f.id === func.id);
  if (idx >= 0) {
    list[idx] = func;
  } else {
    list.push(func);
  }
  localStorage.setItem(STORAGE_KEYS.FUNCIONARIOS, JSON.stringify(list));
}

// ----------------------------------------------------------------------------
// CONFIGURAÇÕES PONTO
// ----------------------------------------------------------------------------
export async function fetchConfiguracoesPonto(empresaId: string): Promise<ConfiguracoesPonto> {
  try {
    const docRef = doc(db, COLLECTIONS.CONFIG, empresaId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as ConfiguracoesPonto;
    }
  } catch (err) {
    handleFirestoreError(err, 'get', COLLECTIONS.CONFIG);
  }

  const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
  return saved ? JSON.parse(saved) : { ...DEFAULT_CONFIG, empresaId };
}

export async function salvarConfiguracoesPonto(config: ConfiguracoesPonto): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.CONFIG, config.empresaId);
    await setDoc(docRef, sanitizeFirestoreData(config), { merge: true });
  } catch (err) {
    handleFirestoreError(err, 'write', COLLECTIONS.CONFIG);
  }

  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
}

// ----------------------------------------------------------------------------
// UTILS & CÁLCULOS AUTOMÁTICOS
// ----------------------------------------------------------------------------
export function calcularDistanciaMetros(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in metres
}

export function formatarMinutosEmHoras(minutos: number): string {
  const absMin = Math.abs(minutos);
  const h = Math.floor(absMin / 60);
  const m = absMin % 60;
  const signal = minutos < 0 ? '-' : '';
  return `${signal}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}h`;
}
