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
import { sanitizeFirestoreData, resolveEmpresaId } from '../../lib/firestoreUtils';
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
  CONFIG: 'configuracoes_ponto',
  COMPROVANTES: 'comprovantes_ponto',
  LOGS_AUDITORIA: 'logs_ponto',
  HORAS_EXTRAS: 'solicitacoes_horas_extras',
  CERCAS_VIRTUAIS: 'cercas_virtuais',
  TROCAS_ESCALA: 'trocas_escala',
  FERIADOS: 'feriados_ponto',
  FECHAMENTOS: 'fechamentos_ponto'
} as const;

// Helper to wrap firestore errors gracefully and rethrow
function handleFirestoreError(error: unknown, op: string, path: string): never {
  const msg = error instanceof Error ? error.message : String(error);
  console.error(`[Firestore Ponto - ${op} - ${path}]:`, error);
  throw new Error(`[Firestore Ponto - ${op} - ${path}]: ${msg}`);
}

// Default configuration template
export const DEFAULT_CONFIG: ConfiguracoesPonto = {
  empresaId: '',
  modoLocalizacao: 'perimetro',
  geofencingAtivo: false,
  latitudeCentro: -23.55052,
  longitudeCentro: -46.633308,
  raioPermitidoMetros: 500,
  exigirFoto: false,
  toleranciaAtrasoMinutos: 10,
  inicioAdicionalNoturno: '22:00',
  fimAdicionalNoturno: '05:00',
  sincronizarComFolha: true,
  dispositivosPermitidosTipo: 'qualquer',
  bancoHorasAtivo: true,
  validadeBancoHorasMeses: 6
};

// ----------------------------------------------------------------------------
// REGISTROS DE PONTO
// ----------------------------------------------------------------------------
export async function fetchRegistrosPonto(empresaId: string, dataFiltro?: string): Promise<RegistroPontoDoc[]> {
  const resolvedId = resolveEmpresaId(empresaId);
  try {
    const q = dataFiltro 
      ? query(collection(db, COLLECTIONS.REGISTROS), where('empresaId', '==', resolvedId), where('data', '==', dataFiltro))
      : query(collection(db, COLLECTIONS.REGISTROS), where('empresaId', '==', resolvedId));
      
    const snap = await getDocs(q);
    const list: RegistroPontoDoc[] = [];
    snap.forEach(d => list.push(d.data() as RegistroPontoDoc));
    return list;
  } catch (err) {
    console.error('Erro ao buscar registros de ponto do Firestore:', err);
    throw err;
  }
}

export async function salvarRegistroPonto(registro: RegistroPontoDoc): Promise<void> {
  const resolvedId = resolveEmpresaId(registro.empresaId);
  const dataToSave = {
    ...registro,
    empresaId: resolvedId,
    companyId: resolvedId,
    updatedAt: new Date().toISOString()
  };

  const docRef = doc(db, COLLECTIONS.REGISTROS, registro.id);
  await setDoc(docRef, sanitizeFirestoreData(dataToSave), { merge: true });
}

// ----------------------------------------------------------------------------
// ESCALAS DE TRABALHO
// ----------------------------------------------------------------------------
export async function fetchEscalasPonto(empresaId: string): Promise<EscalaTrabalhoDoc[]> {
  const resolvedId = resolveEmpresaId(empresaId);
  try {
    const q = query(collection(db, COLLECTIONS.ESCALAS), where('empresaId', '==', resolvedId));
    const snap = await getDocs(q);
    const list: EscalaTrabalhoDoc[] = [];
    snap.forEach(d => list.push(d.data() as EscalaTrabalhoDoc));
    return list;
  } catch (err) {
    console.error('Erro ao buscar escalas no Firestore:', err);
    throw err;
  }
}

export async function salvarEscalaPonto(escala: EscalaTrabalhoDoc): Promise<void> {
  const resolvedId = resolveEmpresaId(escala.empresaId);
  const dataToSave = {
    ...escala,
    empresaId: resolvedId,
    companyId: resolvedId,
    updatedAt: new Date().toISOString()
  };

  const docRef = doc(db, COLLECTIONS.ESCALAS, escala.id);
  await setDoc(docRef, sanitizeFirestoreData(dataToSave), { merge: true });
}

// ----------------------------------------------------------------------------
// AJUSTES DE PONTO
// ----------------------------------------------------------------------------
export async function fetchAjustesPonto(empresaId: string): Promise<AjustePontoDoc[]> {
  const resolvedId = resolveEmpresaId(empresaId);
  try {
    const q = query(collection(db, COLLECTIONS.AJUSTES), where('empresaId', '==', resolvedId));
    const snap = await getDocs(q);
    const list: AjustePontoDoc[] = [];
    snap.forEach(d => list.push(d.data() as AjustePontoDoc));
    return list;
  } catch (err) {
    console.error('Erro ao buscar ajustes de ponto:', err);
    throw err;
  }
}

export async function salvarAjustePonto(ajuste: AjustePontoDoc): Promise<void> {
  const resolvedId = resolveEmpresaId(ajuste.empresaId);
  const dataToSave = {
    ...ajuste,
    empresaId: resolvedId,
    companyId: resolvedId,
    updatedAt: new Date().toISOString()
  };

  const docRef = doc(db, COLLECTIONS.AJUSTES, ajuste.id);
  await setDoc(docRef, sanitizeFirestoreData(dataToSave), { merge: true });
}

// ----------------------------------------------------------------------------
// BANCO DE HORAS
// ----------------------------------------------------------------------------
export async function fetchBancoHoras(empresaId: string): Promise<BancoHorasDoc[]> {
  const resolvedId = resolveEmpresaId(empresaId);
  try {
    const q = query(collection(db, COLLECTIONS.BANCO), where('empresaId', '==', resolvedId));
    const snap = await getDocs(q);
    const list: BancoHorasDoc[] = [];
    snap.forEach(d => list.push(d.data() as BancoHorasDoc));
    return list;
  } catch (err) {
    console.error('Erro ao buscar banco de horas:', err);
    throw err;
  }
}

export async function salvarBancoHoras(banco: BancoHorasDoc): Promise<void> {
  const resolvedId = resolveEmpresaId(banco.empresaId);
  const dataToSave = {
    ...banco,
    empresaId: resolvedId,
    companyId: resolvedId,
    updatedAt: new Date().toISOString()
  };

  const docRef = doc(db, COLLECTIONS.BANCO, banco.id);
  await setDoc(docRef, sanitizeFirestoreData(dataToSave), { merge: true });
}

// ----------------------------------------------------------------------------
// FUNCIONÁRIOS PONTO
// ----------------------------------------------------------------------------
export async function fetchFuncionariosPonto(empresaId: string): Promise<FuncionarioPontoInfo[]> {
  const resolvedId = resolveEmpresaId(empresaId);
  try {
    const q = query(collection(db, COLLECTIONS.FUNCIONARIOS), where('empresaId', '==', resolvedId));
    const snap = await getDocs(q);
    const list: FuncionarioPontoInfo[] = [];
    snap.forEach(d => list.push(d.data() as FuncionarioPontoInfo));
    return list;
  } catch (err) {
    console.error('Erro ao buscar funcionários ponto:', err);
    throw err;
  }
}

export async function salvarFuncionarioPonto(func: FuncionarioPontoInfo): Promise<void> {
  const resolvedId = resolveEmpresaId(func.empresaId);
  const dataToSave = {
    ...func,
    empresaId: resolvedId,
    companyId: resolvedId,
    updatedAt: new Date().toISOString()
  };

  const docRef = doc(db, COLLECTIONS.FUNCIONARIOS, func.id);
  await setDoc(docRef, sanitizeFirestoreData(dataToSave), { merge: true });
}

// ----------------------------------------------------------------------------
// CONFIGURAÇÕES PONTO
// ----------------------------------------------------------------------------
export async function fetchConfiguracoesPonto(empresaId: string): Promise<ConfiguracoesPonto> {
  const resolvedId = resolveEmpresaId(empresaId);
  try {
    const docRef = doc(db, COLLECTIONS.CONFIG, resolvedId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as ConfiguracoesPonto;
    }
  } catch (err) {
    console.error('Erro ao buscar configurações do ponto:', err);
  }

  return { ...DEFAULT_CONFIG, empresaId: resolvedId };
}

export async function salvarConfiguracoesPonto(config: ConfiguracoesPonto): Promise<void> {
  const resolvedId = resolveEmpresaId(config.empresaId);
  const dataToSave = {
    ...config,
    empresaId: resolvedId,
    companyId: resolvedId,
    updatedAt: new Date().toISOString()
  };

  const docRef = doc(db, COLLECTIONS.CONFIG, resolvedId);
  await setDoc(docRef, sanitizeFirestoreData(dataToSave), { merge: true });
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

// ----------------------------------------------------------------------------
// VALIDATION & SEQUÊNCIA DAS MARCAÇÕES
// ----------------------------------------------------------------------------
export function validarSequenciaMarcacao(
  tipoSolicitado: 'entrada' | 'inicio_intervalo' | 'fim_intervalo' | 'saida' | 'entrada_extra' | 'saida_extra',
  marcacoesAnteriores: { type: string; timestamp: string }[]
): { valido: boolean; mensagem?: string } {
  if (!marcacoesAnteriores || marcacoesAnteriores.length === 0) {
    if (tipoSolicitado !== 'entrada' && tipoSolicitado !== 'entrada_extra') {
      return { valido: false, mensagem: 'A primeira marcação do dia deve ser de ENTRADA.' };
    }
    return { valido: true };
  }

  const ultima = marcacoesAnteriores[marcacoesAnteriores.length - 1];
  const agora = new Date().getTime();
  const ultimaTime = new Date(ultima.timestamp).getTime();

  // Impedir marcações duplicadas em menos de 30 segundos
  if (Math.abs(agora - ultimaTime) < 30000) {
    return { valido: false, mensagem: 'Aguarde pelo menos 30 segundos entre registros de ponto.' };
  }

  // Sequência padrão: entrada -> inicio_intervalo -> fim_intervalo -> saida
  if (tipoSolicitado === 'entrada' && ultima.type === 'entrada') {
    return { valido: false, mensagem: 'Já existe um registro de ENTRADA ativo.' };
  }
  if (tipoSolicitado === 'saida' && ultima.type === 'saida') {
    return { valido: false, mensagem: 'A jornada já foi FINALIZADA.' };
  }
  if (tipoSolicitado === 'inicio_intervalo' && ultima.type !== 'entrada' && ultima.type !== 'fim_intervalo') {
    return { valido: false, mensagem: 'Não é possível iniciar o intervalo sem um registro de ENTRADA.' };
  }
  if (tipoSolicitado === 'fim_intervalo' && ultima.type !== 'inicio_intervalo') {
    return { valido: false, mensagem: 'Não é possível finalizar o intervalo sem antes ter INICIADO o intervalo.' };
  }
  if (tipoSolicitado === 'saida' && ultima.type === 'inicio_intervalo') {
    return { valido: false, mensagem: 'Finalize o intervalo antes de registrar a SAÍDA.' };
  }

  return { valido: true };
}

// ----------------------------------------------------------------------------
// COMPROVANTE E LOGS DE AUDITORIA
// ----------------------------------------------------------------------------
export async function gerarComprovantePonto(dados: {
  funcionarioNome: string;
  matricula: string;
  empresaNome: string;
  cnpjEmpresa?: string;
  data: string;
  horario: string;
  tipoMarcacao: any;
  origem: string;
  localizacaoStr?: string;
}): Promise<string> {
  const timestamp = new Date().toISOString();
  const hash = `COMP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const codigoAutenticacao = Math.random().toString(36).substring(2, 10).toUpperCase();

  const compDoc = {
    id: hash,
    hashComprovante: hash,
    codigoAutenticacao,
    ...dados,
    createdAt: timestamp
  };

  try {
    const docRef = doc(db, COLLECTIONS.COMPROVANTES, hash);
    await setDoc(docRef, sanitizeFirestoreData(compDoc));
  } catch (err) {
    handleFirestoreError(err, 'write', COLLECTIONS.COMPROVANTES);
  }

  return hash;
}

export async function registrarLogAuditoriaPonto(log: {
  companyId: string;
  empresaId: string;
  usuarioId: string;
  usuarioNome: string;
  acao: string;
  detalhes: string;
  ip?: string;
}): Promise<void> {
  const idLog = `log-${Date.now()}`;
  const fullLog = {
    id: idLog,
    ...log,
    createdAt: new Date().toISOString()
  };

  try {
    const docRef = doc(db, COLLECTIONS.LOGS_AUDITORIA, idLog);
    await setDoc(docRef, sanitizeFirestoreData(fullLog));
  } catch (err) {
    handleFirestoreError(err, 'write', COLLECTIONS.LOGS_AUDITORIA);
  }
}

// ----------------------------------------------------------------------------
// SERVIÇO CENTRAL DE APURAÇÃO AUTOMÁTICA
// ----------------------------------------------------------------------------
export function apurarJornadaDiaria(registro: RegistroPontoDoc, escala?: EscalaTrabalhoDoc) {
  const horaParaMinutos = (h?: string) => {
    if (!h || !h.includes(':')) return 0;
    const [hrs, mins] = h.split(':').map(Number);
    return hrs * 60 + mins;
  };

  const entrada = horaParaMinutos(registro.horaEntrada);
  const inicioInt = horaParaMinutos(registro.inicioIntervalo);
  const fimInt = horaParaMinutos(registro.retornoIntervalo);
  const saida = horaParaMinutos(registro.horaSaida);

  let minutosTrabalhados = 0;
  let minutosIntervalo = 0;

  if (entrada > 0 && saida > 0) {
    minutosTrabalhados = (saida - entrada);
    if (inicioInt > 0 && fimInt > 0 && fimInt > inicioInt) {
      minutosIntervalo = (fimInt - inicioInt);
      minutosTrabalhados -= minutosIntervalo;
    }
  }

  const cargaPrevista = escala?.cargaDiariaMinutos || 480; // 8h por padrão
  const tolerancia = escala?.toleranciaMinutos || 10;

  let atrasoMinutos = 0;
  let horasExtrasMinutos = 0;

  const diferenca = minutosTrabalhados - cargaPrevista;
  if (diferenca > tolerancia) {
    horasExtrasMinutos = diferenca;
  } else if (diferenca < -tolerancia) {
    atrasoMinutos = Math.abs(diferenca);
  }

  // Adicional noturno (entre 22:00 e 05:00 -> 1320 e 300 mins)
  let adicionalNoturnoMinutos = 0;
  if (saida >= 1320 || entrada <= 300) {
    adicionalNoturnoMinutos = 60; // Exemplo de cálculo parcial
  }

  return {
    horasTrabalhadasMinutos: Math.max(0, minutosTrabalhados),
    horasExtrasMinutos,
    atrasoMinutos,
    adicionalNoturnoMinutos
  };
}

// ----------------------------------------------------------------------------
// HORAS EXTRAS, SOLICITAÇÕES E FECHAMENTO
// ----------------------------------------------------------------------------
export async function salvarSolicitacaoHoraExtra(solicitacao: any): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.HORAS_EXTRAS, solicitacao.id);
    await setDoc(docRef, sanitizeFirestoreData(solicitacao), { merge: true });
  } catch (err) {
    handleFirestoreError(err, 'write', COLLECTIONS.HORAS_EXTRAS);
  }
}

export async function fetchFechamentosPonto(empresaId: string): Promise<any[]> {
  try {
    const q = query(collection(db, COLLECTIONS.FECHAMENTOS), where('empresaId', '==', empresaId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const list: any[] = [];
      snap.forEach(d => list.push(d.data()));
      return list;
    }
  } catch (err) {
    handleFirestoreError(err, 'get', COLLECTIONS.FECHAMENTOS);
  }
  return [];
}

export async function fecharPeriodoPontoService(fechamento: any): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.FECHAMENTOS, fechamento.id);
    await setDoc(docRef, sanitizeFirestoreData(fechamento), { merge: true });
  } catch (err) {
    handleFirestoreError(err, 'write', COLLECTIONS.FECHAMENTOS);
  }
}

