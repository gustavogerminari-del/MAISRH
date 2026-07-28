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

// Initial mock fallback data if collections are empty
export const DEFAULT_ESCALAS: EscalaTrabalhoDoc[] = [
  {
    id: 'esc-01',
    empresaId: 'emp-001',
    nome: 'Comercial Administrativo (8h às 17h)',
    tipo: 'Administrativo',
    horarioEntrada: '08:00',
    horarioSaida: '17:00',
    intervalo: '01:00',
    diasTrabalho: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    toleranciaMinutos: 10
  },
  {
    id: 'esc-02',
    empresaId: 'emp-001',
    nome: 'Plantão Hospitalar / Operacional (12x36)',
    tipo: '12x36',
    horarioEntrada: '07:00',
    horarioSaida: '19:00',
    intervalo: '01:00',
    diasTrabalho: ['Escala Alternada'],
    toleranciaMinutos: 15
  },
  {
    id: 'esc-03',
    empresaId: 'emp-001',
    nome: 'Varejo & Serviços (6x1)',
    tipo: '6x1',
    horarioEntrada: '09:00',
    horarioSaida: '18:00',
    intervalo: '01:00',
    diasTrabalho: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    toleranciaMinutos: 10
  }
];

export const DEFAULT_FUNCIONARIOS: FuncionarioPontoInfo[] = [
  {
    id: 'func-01',
    empresaId: 'emp-001',
    nome: 'Carlos Eduardo Silva',
    cpf: '123.456.789-00',
    cargo: 'Analista de RH Sênior',
    setor: 'Gente & Gestão',
    email: 'carlos.gestor@maisrh.com.br',
    telefone: '(11) 98765-4321',
    escalaId: 'esc-01',
    escalaNome: 'Comercial Administrativo (8h às 17h)',
    gestorId: 'usr-admin-01',
    gestorNome: 'Luciana Mello',
    status: 'Ativo',
    statusLivePonto: 'Trabalhando'
  },
  {
    id: 'func-02',
    empresaId: 'emp-001',
    nome: 'Mariana Costa',
    cpf: '234.567.890-11',
    cargo: 'Tech Recruiter Lead',
    setor: 'Atração de Talentos',
    email: 'mariana.recrutadora@maisrh.com.br',
    telefone: '(11) 97654-3210',
    escalaId: 'esc-01',
    escalaNome: 'Comercial Administrativo (8h às 17h)',
    gestorId: 'usr-admin-01',
    gestorNome: 'Luciana Mello',
    status: 'Ativo',
    statusLivePonto: 'Intervalo'
  },
  {
    id: 'func-03',
    empresaId: 'emp-001',
    nome: 'Roberto Andrade',
    cpf: '345.678.901-22',
    cargo: 'Assistente de DP',
    setor: 'Departamento Pessoal',
    email: 'roberto.analista@maisrh.com.br',
    telefone: '(11) 96543-2109',
    escalaId: 'esc-03',
    escalaNome: 'Varejo & Serviços (6x1)',
    gestorId: 'func-01',
    gestorNome: 'Carlos Eduardo Silva',
    status: 'Ativo',
    statusLivePonto: 'Ausente'
  }
];

export const DEFAULT_CONFIG: ConfiguracoesPonto = {
  empresaId: 'emp-001',
  geofencingAtivo: true,
  latitudeCentro: -23.55052,
  longitudeCentro: -46.633308,
  raioPermitidoMetros: 500,
  exigirFoto: true,
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
    await setDoc(docRef, registro, { merge: true });
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
  return saved ? JSON.parse(saved) : DEFAULT_ESCALAS;
}

export async function salvarEscalaPonto(escala: EscalaTrabalhoDoc): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.ESCALAS, escala.id);
    await setDoc(docRef, escala, { merge: true });
  } catch (err) {
    handleFirestoreError(err, 'write', COLLECTIONS.ESCALAS);
  }

  const saved = localStorage.getItem(STORAGE_KEYS.ESCALAS);
  const list: EscalaTrabalhoDoc[] = saved ? JSON.parse(saved) : DEFAULT_ESCALAS;
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
    await setDoc(docRef, ajuste, { merge: true });
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
  return saved ? JSON.parse(saved) : [
    {
      id: 'bh-01',
      funcionarioId: 'func-01',
      funcionarioNome: 'Carlos Eduardo Silva',
      empresaId: 'emp-001',
      creditoMinutos: 480, // +8h
      debitoMinutos: 60,   // -1h
      saldoMinutos: 420,   // +7h
      ultimaAtualizacao: new Date().toISOString().split('T')[0]
    },
    {
      id: 'bh-02',
      funcionarioId: 'func-02',
      funcionarioNome: 'Mariana Costa',
      empresaId: 'emp-001',
      creditoMinutos: 240, // +4h
      debitoMinutos: 180,  // -3h
      saldoMinutos: 60,    // +1h
      ultimaAtualizacao: new Date().toISOString().split('T')[0]
    },
    {
      id: 'bh-03',
      funcionarioId: 'func-03',
      funcionarioNome: 'Roberto Andrade',
      empresaId: 'emp-001',
      creditoMinutos: 120, // +2h
      debitoMinutos: 300,  // -5h
      saldoMinutos: -180,  // -3h
      ultimaAtualizacao: new Date().toISOString().split('T')[0]
    }
  ];
}

export async function salvarBancoHoras(banco: BancoHorasDoc): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.BANCO, banco.id);
    await setDoc(docRef, banco, { merge: true });
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
  return saved ? JSON.parse(saved) : DEFAULT_FUNCIONARIOS;
}

export async function salvarFuncionarioPonto(func: FuncionarioPontoInfo): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.FUNCIONARIOS, func.id);
    await setDoc(docRef, func, { merge: true });
  } catch (err) {
    handleFirestoreError(err, 'write', COLLECTIONS.FUNCIONARIOS);
  }

  const saved = localStorage.getItem(STORAGE_KEYS.FUNCIONARIOS);
  const list: FuncionarioPontoInfo[] = saved ? JSON.parse(saved) : DEFAULT_FUNCIONARIOS;
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
  return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
}

export async function salvarConfiguracoesPonto(config: ConfiguracoesPonto): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.CONFIG, config.empresaId);
    await setDoc(docRef, config, { merge: true });
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
