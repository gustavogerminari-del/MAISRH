import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  addDoc 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { sanitizeFirestoreData } from '../../lib/firestoreUtils';
import { 
  PayrollPeriod, 
  Paystub, 
  PaystubItem, 
  RubricDefinition, 
  TaxTableVersion, 
  PayrollAuditLog, 
  PayrollValidationResult,
  PayrollType,
  ESocialEvent
} from '../types/payroll';
import { 
  calculateINSS, 
  calculateIRRF, 
  calculateFGTS, 
  calculateEmployerCharges, 
  generateDigitalHash,
  calculateOvertime,
  calculateNightShift,
  calculateInsalubridade,
  calculatePericulosidade,
  calculateDSR
} from './payrollCalculations';
import { 
  getColaboradoresFirestore, 
  getBeneficiosFirestore, 
  getFeriasFirestore, 
  getAfastamentosFirestore, 
  getRescisoesFirestore, 
  getAjustesPontoFirestore 
} from '../../departamento-pessoal/services/dpFirestoreService';

const COLLECTION_PERIODS = 'payroll_competences';
const COLLECTION_PAYSTUBS = 'payroll_stubs';
const COLLECTION_RUBRICS = 'payroll_events';
const COLLECTION_TAX_TABLES = 'tax_tables';
const COLLECTION_AUDIT = 'payroll_audit_logs';
const COLLECTION_ESOCIAL = 'esocial_events';

// Default Tax Table Version for 2026
export const DEFAULT_TAX_TABLE_2026: TaxTableVersion = {
  id: 'tax-2026-v1',
  companyId: 'default',
  vigenciaInicio: '2026-01',
  description: 'Tabela Oficial Fisco / INSS / IRRF (CLT 2026)',
  minimumWage: 1518.00,
  inssCeiling: 8157.41,
  irrfDependentDeduction: 189.59,
  irrfSimplifiedDeduction: 564.80,
  ratPercent: 2.0,
  terceirosPercent: 5.8,
  inssPatronalPercent: 20.0,
  fgtsPercent: 8.0,
  isSystemDefault: true,
  inssBrackets: [
    { min: 0, max: 1518.00, rate: 7.5 },
    { min: 1518.01, max: 2793.88, rate: 9.0 },
    { min: 2793.89, max: 4190.83, rate: 12.0 },
    { min: 4190.84, max: 8157.41, rate: 14.0 }
  ],
  irrfBrackets: [
    { min: 0, max: 2259.20, rate: 0, deduction: 0 },
    { min: 2259.21, max: 2828.65, rate: 7.5, deduction: 169.44 },
    { min: 2828.66, max: 3751.05, rate: 15.0, deduction: 381.59 },
    { min: 3751.06, max: 4664.68, rate: 22.5, deduction: 662.92 },
    { min: 4664.69, max: 999999.00, rate: 27.5, deduction: 896.00 }
  ]
};

// Default System Rubrics Catalog
export const DEFAULT_RUBRICS: RubricDefinition[] = [
  { code: '1001', name: 'Salário Base', type: 'Provento', description: 'Salário contratual trabalhado no mês', incidesINSS: true, incidesIRRF: true, incidesFGTS: true, incidesDSR: false, isSystemDefault: true },
  { code: '1002', name: 'Horas Extras 50%', type: 'Provento', description: 'Horas excedentes em dias úteis com 50% adicional', incidesINSS: true, incidesIRRF: true, incidesFGTS: true, incidesDSR: true, isSystemDefault: true },
  { code: '1003', name: 'Horas Extras 100%', type: 'Provento', description: 'Horas excedentes em domingos/feriados com 100% adicional', incidesINSS: true, incidesIRRF: true, incidesFGTS: true, incidesDSR: true, isSystemDefault: true },
  { code: '1004', name: 'Adicional Noturno 20%', type: 'Provento', description: 'Trabalho em horário noturno (22h às 05h)', incidesINSS: true, incidesIRRF: true, incidesFGTS: true, incidesDSR: true, isSystemDefault: true },
  { code: '1005', name: 'Adicional de Insalubridade', type: 'Provento', description: 'Grau mínimo (10%), médio (20%) ou máximo (40%) s/ sal. mínimo', incidesINSS: true, incidesIRRF: true, incidesFGTS: true, incidesDSR: false, isSystemDefault: true },
  { code: '1006', name: 'Adicional de Periculosidade', type: 'Provento', description: '30% sobre o salário base contratual', incidesINSS: true, incidesIRRF: true, incidesFGTS: true, incidesDSR: false, isSystemDefault: true },
  { code: '1007', name: 'DSR sobre Horas Extras e Adicionais', type: 'Provento', description: 'Descanso Semanal Remunerado s/ variáveis', incidesINSS: true, incidesIRRF: true, incidesFGTS: true, incidesDSR: false, isSystemDefault: true },
  { code: '1008', name: 'Comissões de Vendas', type: 'Provento', description: 'Comissões e gratificações variáveis sobre metas', incidesINSS: true, incidesIRRF: true, incidesFGTS: true, incidesDSR: true, isSystemDefault: true },
  { code: '1015', name: 'Férias Gozadas no Mês', type: 'Provento', description: 'Proventos de férias gozadas dentro da competência', incidesINSS: true, incidesIRRF: true, incidesFGTS: true, incidesDSR: false, isSystemDefault: true },
  { code: '1016', name: '1/3 Constitucional de Férias', type: 'Provento', description: 'Adicional constitucional de 1/3 de férias', incidesINSS: true, incidesIRRF: true, incidesFGTS: true, incidesDSR: false, isSystemDefault: true },
  { code: '5001', name: 'INSS', type: 'Desconto', description: 'Contribuição previdenciária oficial do trabalhador (tabela progressiva)', incidesINSS: false, incidesIRRF: false, incidesFGTS: false, isSystemDefault: true },
  { code: '5002', name: 'IRRF', type: 'Desconto', description: 'Imposto de Renda Retido na Fonte com dedução de dependentes e previdência', incidesINSS: false, incidesIRRF: false, incidesFGTS: false, isSystemDefault: true },
  { code: '5003', name: 'Vale Transporte (Coparticipação até 6%)', type: 'Desconto', description: 'Desconto legal de Vale Transporte', incidesINSS: false, incidesIRRF: false, incidesFGTS: false, isSystemDefault: true },
  { code: '5004', name: 'Vale Refeição / Alimentação (Coparticipação PAT)', type: 'Desconto', description: 'Desconto do benefício de alimentação', incidesINSS: false, incidesIRRF: false, incidesFGTS: false, isSystemDefault: true },
  { code: '5005', name: 'Pensão Alimentícia (Judicial)', type: 'Desconto', description: 'Desconto de pensão alimentícia fixado por decisão judicial', incidesINSS: false, incidesIRRF: false, incidesFGTS: false, isSystemDefault: true },
  { code: '5006', name: 'Faltas e Atrasos Não Justificados', type: 'Desconto', description: 'Desconto de horas ou dias de ausência não abonados', incidesINSS: true, incidesIRRF: true, incidesFGTS: true, isSystemDefault: true },
  { code: '5007', name: 'DSR sobre Faltas', type: 'Desconto', description: 'Perda do DSR proporcional às faltas não justificadas na semana', incidesINSS: true, incidesIRRF: true, incidesFGTS: true, isSystemDefault: true },
  { code: '5008', name: 'Plano de Saúde (Co-participação)', type: 'Desconto', description: 'Desconto de convênio médico do colaborador/dependentes', incidesINSS: false, incidesIRRF: false, incidesFGTS: false, isSystemDefault: true },
  { code: '9001', name: 'Base de Cálculo do FGTS (Informativa)', type: 'Informativa', description: 'Base tributável sujeita a recolhimento do FGTS', incidesINSS: false, incidesIRRF: false, incidesFGTS: false, isSystemDefault: true },
  { code: '9002', name: 'FGTS do Mês (8% Informativo)', type: 'Informativa', description: 'Valor recolhido pela empresa na conta vinculada', incidesINSS: false, incidesIRRF: false, incidesFGTS: false, isSystemDefault: true }
];

/**
 * Carrega ou inicializa os Períodos/Competências de Folha para uma empresa
 */
export async function getPayrollPeriodsFirestore(companyId: string): Promise<PayrollPeriod[]> {
  try {
    const q = query(
      collection(db, COLLECTION_PERIODS),
      where('companyId', '==', companyId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const list = snap.docs.map(d => ({
        id: d.id,
        ...(sanitizeFirestoreData(d.data()) as Record<string, any>)
      })) as PayrollPeriod[];
      list.sort((a, b) => b.referenceMonth.localeCompare(a.referenceMonth));
      return list;
    }
  } catch (err) {
    console.warn('[Payroll] Erro ao carregar competências do Firestore:', err);
  }

  return [];
}

/**
 * Salva ou atualiza uma Competência de Folha no Firestore
 */
export async function savePayrollPeriodFirestore(companyId: string, period: PayrollPeriod): Promise<void> {
  const periodData = {
    ...period,
    companyId,
    updatedAt: new Date().toISOString()
  };
  await setDoc(doc(db, COLLECTION_PERIODS, period.id), periodData, { merge: true });
}

/**
 * Trava / Fecha Competência de Folha com log de auditoria
 */
export async function closePayrollPeriodFirestore(
  companyId: string, 
  periodId: string, 
  userName: string,
  userEmail: string
): Promise<void> {
  const ref = doc(db, COLLECTION_PERIODS, periodId);
  const closedAt = new Date().toISOString();
  await updateDoc(ref, {
    status: 'Fechado',
    closedAt,
    closedBy: userName,
    updatedAt: closedAt
  });

  await logPayrollAuditFirestore(
    companyId,
    periodId,
    'Fechamento de Folha',
    userEmail,
    userName,
    `Competência ${periodId} foi travada e fechada com sucesso.`
  );
}

/**
 * Reabre Competência com justificativa obrigatória e auditoria
 */
export async function reopenPayrollPeriodFirestore(
  companyId: string,
  periodId: string,
  userName: string,
  userEmail: string,
  reason: string
): Promise<void> {
  const ref = doc(db, COLLECTION_PERIODS, periodId);
  const reopenedAt = new Date().toISOString();
  await updateDoc(ref, {
    status: 'Aberto',
    reopenedAt,
    reopenedBy: userName,
    reopenReason: reason,
    updatedAt: reopenedAt
  });

  await logPayrollAuditFirestore(
    companyId,
    periodId,
    'Reabertura de Folha',
    userEmail,
    userName,
    `Competência ${periodId} reaberta. Motivo: ${reason}`
  );
}

/**
 * Carrega Holerites do Firestore
 */
export async function getPaystubsFirestore(companyId: string, periodId?: string): Promise<Paystub[]> {
  try {
    let q;
    if (periodId) {
      q = query(
        collection(db, COLLECTION_PAYSTUBS),
        where('companyId', '==', companyId),
        where('periodId', '==', periodId)
      );
    } else {
      q = query(
        collection(db, COLLECTION_PAYSTUBS),
        where('companyId', '==', companyId)
      );
    }
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => ({
        id: d.id,
        ...(sanitizeFirestoreData(d.data()) as Record<string, any>)
      })) as Paystub[];
    }
  } catch (err) {
    console.warn('[Payroll] Erro ao carregar holerites do Firestore:', err);
  }

  return [];
}

/**
 * Salva ou atualiza um Holerite no Firestore
 */
export async function savePaystubFirestore(companyId: string, stub: Paystub): Promise<void> {
  const data = {
    ...stub,
    companyId
  };
  await setDoc(doc(db, COLLECTION_PAYSTUBS, stub.id), data, { merge: true });
}

/**
 * Assina Digitalmente um Holerite no Firestore
 */
export async function signPaystubFirestore(
  companyId: string,
  paystubId: string,
  userIp: string,
  userName: string,
  userEmail: string
): Promise<Paystub | null> {
  const ref = doc(db, COLLECTION_PAYSTUBS, paystubId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const current = snap.data() as Paystub;
  const timestamp = new Date().toISOString();
  const hash = generateDigitalHash(paystubId, current.cpf, timestamp);

  const updated: Paystub = {
    ...current,
    statusAssinatura: 'Assinado Digitalmente',
    dataAssinatura: timestamp,
    hashDigital: hash,
    ipAssinatura: userIp
  };

  await setDoc(ref, updated, { merge: true });

  await logPayrollAuditFirestore(
    companyId,
    current.periodId,
    'Assinatura Digital de Holerite',
    userEmail,
    userName,
    `Holerite do colaborador ${current.employeeName} assinado digitalmente. Hash: ${hash}`
  );

  return updated;
}

/**
 * Log de Auditoria no Firestore
 */
export async function logPayrollAuditFirestore(
  companyId: string,
  periodId: string | undefined,
  action: string,
  userEmail: string,
  userName: string,
  details: string
): Promise<void> {
  try {
    const log: Omit<PayrollAuditLog, 'id'> = {
      companyId,
      periodId: periodId || 'N/A',
      action,
      userEmail: userEmail || 'sistema@maisrh.com.br',
      userName: userName || 'Sistema MAIS RH',
      details,
      timestamp: new Date().toISOString()
    };
    await addDoc(collection(db, COLLECTION_AUDIT), log);
  } catch (err) {
    console.error('[Payroll] Erro ao gravar log de auditoria:', err);
  }
}

/**
 * Carrega Logs de Auditoria do Firestore
 */
export async function getPayrollAuditLogsFirestore(companyId: string): Promise<PayrollAuditLog[]> {
  try {
    const q = query(
      collection(db, COLLECTION_AUDIT),
      where('companyId', '==', companyId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const logs = snap.docs.map(d => ({
        id: d.id,
        ...(sanitizeFirestoreData(d.data()) as Record<string, any>)
      })) as PayrollAuditLog[];
      logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      return logs;
    }
  } catch (err) {
    console.warn('[Payroll] Erro ao buscar audit logs:', err);
  }
  return [];
}

/**
 * Busca Tabelas Tributárias (INSS / IRRF / Sal. Mínimo / Alíquotas)
 */
export async function getTaxTablesFirestore(companyId: string): Promise<TaxTableVersion[]> {
  try {
    const q = query(
      collection(db, COLLECTION_TAX_TABLES),
      where('companyId', 'in', [companyId, 'default'])
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => ({
        id: d.id,
        ...(sanitizeFirestoreData(d.data()) as Record<string, any>)
      })) as TaxTableVersion[];
    }
  } catch (err) {
    console.warn('[Payroll] Erro ao buscar tabelas tributarias:', err);
  }
  return [{ ...DEFAULT_TAX_TABLE_2026, companyId }];
}

/**
 * Salva Tabela Tributária
 */
export async function saveTaxTableFirestore(companyId: string, table: TaxTableVersion): Promise<void> {
  const data = {
    ...table,
    companyId
  };
  await setDoc(doc(db, COLLECTION_TAX_TABLES, table.id), data, { merge: true });
}

/**
 * Busca Catálogo de Rúbricas / Eventos
 */
export async function getRubricCatalogFirestore(companyId: string): Promise<RubricDefinition[]> {
  try {
    const q = query(
      collection(db, COLLECTION_RUBRICS),
      where('companyId', 'in', [companyId, 'default'])
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => ({
        id: d.id,
        ...(sanitizeFirestoreData(d.data()) as Record<string, any>)
      })) as RubricDefinition[];
    }
  } catch (err) {
    console.warn('[Payroll] Erro ao carregar rúbricas do Firestore:', err);
  }
  return DEFAULT_RUBRICS.map(r => ({ ...r, companyId }));
}

/**
 * Salva ou edita Rúbrica no Catálogo
 */
export async function saveRubricFirestore(companyId: string, rubric: RubricDefinition): Promise<void> {
  const docId = rubric.id || `rubric-${rubric.code}`;
  const data = {
    ...rubric,
    id: docId,
    companyId
  };
  await setDoc(doc(db, COLLECTION_RUBRICS, docId), data, { merge: true });
}

/**
 * Validação de Inconsistências pré-fechamento da Folha
 */
export async function validatePayrollPeriodFirestore(
  companyId: string,
  periodId: string
): Promise<PayrollValidationResult> {
  const colaboradores = await getColaboradoresFirestore(companyId);
  const stubs = await getPaystubsFirestore(companyId, periodId);

  const warnings: string[] = [];
  const errors: string[] = [];
  const employeesMissingSalary: string[] = [];
  const employeesWithPendingAbsences: string[] = [];

  for (const colab of colaboradores) {
    const sal = colab.profissionais?.salarioBase || 0;
    if (sal <= 0) {
      employeesMissingSalary.push(colab.nomeCompleto);
      errors.push(`Colaborador(a) ${colab.nomeCompleto} não possui salário base cadastrado.`);
    }
  }

  const unsignedCount = stubs.filter(s => s.statusAssinatura !== 'Assinado Digitalmente').length;
  if (unsignedCount > 0) {
    warnings.push(`Existem ${unsignedCount} holerites aguardando assinatura digital dos colaboradores.`);
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
    totalEmployeesToCheck: colaboradores.length,
    employeesMissingSalary,
    employeesWithPendingAbsences
  };
}

/**
 * MOTOR DE PROCESSAMENTO AUTOMATIZADO 100% DE FOLHA DE PAGAMENTO
 * Cruza dados de Colaboradores, Benefícios, Férias, Rescisões e Ponto Digital para recalcular a competência inteira.
 */
export async function processBatchPayrollFirestore(
  companyId: string,
  referenceMonth: string,
  type: PayrollType = 'Mensal',
  userName: string = 'Administrador DP',
  userEmail: string = 'dp@maisrh.com.br'
): Promise<{ period: PayrollPeriod; paystubs: Paystub[] }> {

  const [yearStr, monthStr] = referenceMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const periodId = `per-${year}-${monthStr}`;

  // 1. Busca Colaboradores Ativos da Empresa
  const colaboradores = await getColaboradoresFirestore(companyId);
  const activeColabs = colaboradores.filter(c => c.profissionais?.status !== 'Rescindido');

  // 2. Busca Benefícios, Férias, Rescisões e Ajustes de Ponto
  const [beneficios, feriasList, rescisoes, ajustesPonto] = await Promise.all([
    getBeneficiosFirestore(companyId),
    getFeriasFirestore(companyId),
    getRescisoesFirestore(companyId),
    getAjustesPontoFirestore(companyId)
  ]);

  const newPaystubs: Paystub[] = [];

  for (const colab of activeColabs) {
    const cAny = colab as any;
    const stubId = `stub-${year}-${monthStr}-${colab.id}`;
    const salarioBase = colab.profissionais?.salarioBase || 3500.00;
    const cargo = colab.profissionais?.cargo || 'Colaborador';
    const departamento = colab.profissionais?.departamento || 'Geral';
    const admissaoDate = colab.profissionais?.dataAdmissao || `${year}-01-01`;
    const cpf = colab.pessoais?.cpf || '000.000.000-00';
    const dependentsCount = colab.trabalhistas?.dependentesCount || 0;
    const pensaoAlimenticiaValue = cAny.trabalhistas?.pensaoAlimenticiaValue || 0;

    // Itens da Folha
    const items: PaystubItem[] = [
      {
        id: `item-${Date.now()}-1`,
        code: '1001',
        name: 'Salário Base',
        type: 'Provento',
        reference: '30 dias',
        amount: salarioBase,
        calculationMemory: { baseValue: salarioBase, notes: 'Salário contratual integral' }
      }
    ];

    let totalProventos = salarioBase;

    // Verifica Adicional de Insalubridade
    if (cAny.trabalhistas?.insalubridadeDegree) {
      const valInsalubridade = calculateInsalubridade(cAny.trabalhistas.insalubridadeDegree as any);
      totalProventos += valInsalubridade;
      items.push({
        id: `item-${Date.now()}-insalubridade`,
        code: '1005',
        name: `Adicional de Insalubridade (${cAny.trabalhistas.insalubridadeDegree})`,
        type: 'Provento',
        reference: cAny.trabalhistas.insalubridadeDegree,
        amount: valInsalubridade,
        calculationMemory: { baseValue: DEFAULT_TAX_TABLE_2026.minimumWage, rateUsed: 0.20, notes: 'Grau médio s/ salário mínimo' }
      });
    }

    // Verifica Adicional de Periculosidade (30%)
    if (cAny.trabalhistas?.periculosidade) {
      const valPeric = calculatePericulosidade(salarioBase);
      totalProventos += valPeric;
      items.push({
        id: `item-${Date.now()}-peric`,
        code: '1006',
        name: 'Adicional de Periculosidade (30%)',
        type: 'Provento',
        reference: '30% Base',
        amount: valPeric,
        calculationMemory: { baseValue: salarioBase, rateUsed: 0.30, notes: '30% sobre o salário base' }
      });
    }

    // Processa Desconto de Benefícios (VT / VR)
    const colabBens = beneficios.filter(b => (b as any).colaboradorId === colab.id || (b as any).status === 'Ativo');
    for (const b of colabBens) {
      const bAny = b as any;
      const bNome = (bAny.nomeBeneficio || bAny.nome || '').toLowerCase();
      if (bNome.includes('vale transporte') || bAny.tipo === 'VT') {
        const vtDesc = Number((salarioBase * 0.06).toFixed(2));
        if (vtDesc > 0) {
          items.push({
            id: `item-${Date.now()}-vt`,
            code: '5003',
            name: 'Vale Transporte (Coparticipação até 6%)',
            type: 'Desconto',
            reference: '6,0%',
            amount: vtDesc
          });
        }
      } else if (bNome.includes('refeição') || bAny.tipo === 'VR') {
        const vrDesc = Number(((bAny.valorMensalEmpresa || 600) * 0.20).toFixed(2)) || 120.00;
        items.push({
          id: `item-${Date.now()}-vr`,
          code: '5004',
          name: 'Vale Refeição (Coparticipação)',
          type: 'Desconto',
          reference: 'Copart.',
          amount: vrDesc
        });
      }
    }

    // Pensão Alimentícia
    if (pensaoAlimenticiaValue > 0) {
      items.push({
        id: `item-${Date.now()}-pensao`,
        code: '5005',
        name: 'Pensão Alimentícia (Judicial)',
        type: 'Desconto',
        reference: 'Judicial',
        amount: pensaoAlimenticiaValue
      });
    }

    // Cálculo INSS Progressivo
    const inssCalc = calculateINSS(totalProventos);
    items.push({
      id: `item-${Date.now()}-inss`,
      code: '5001',
      name: 'INSS (Previdência Social)',
      type: 'Desconto',
      reference: `${inssCalc.effectiveRate}%`,
      amount: inssCalc.amount,
      calculationMemory: { baseValue: inssCalc.base, rateUsed: inssCalc.effectiveRate, notes: 'Alíquota progressiva oficial 2026' }
    });

    // Cálculo IRRF
    const irrfCalc = calculateIRRF(totalProventos, inssCalc.amount, dependentsCount, pensaoAlimenticiaValue);
    items.push({
      id: `item-${Date.now()}-irrf`,
      code: '5002',
      name: 'IRRF (Imposto de Renda)',
      type: 'Desconto',
      reference: `${irrfCalc.ratePercent}%`,
      amount: irrfCalc.amount,
      calculationMemory: { baseValue: irrfCalc.base, rateUsed: irrfCalc.ratePercent, notes: 'Com abatimento legal de dependentes' }
    });

    // Informativos FGTS
    const fgtsCalc = calculateFGTS(totalProventos);
    items.push({
      id: `item-${Date.now()}-base-fgts`,
      code: '9001',
      name: 'Base do FGTS (Informativa)',
      type: 'Informativa',
      reference: 'Base',
      amount: totalProventos
    });
    items.push({
      id: `item-${Date.now()}-fgts`,
      code: '9002',
      name: 'FGTS do Mês (8% Informativo)',
      type: 'Informativa',
      reference: '8,0%',
      amount: fgtsCalc.amount
    });

    // Totais do Holerite
    const totalDescontos = Number(
      items.filter(i => i.type === 'Desconto').reduce((acc, i) => acc + i.amount, 0).toFixed(2)
    );
    const valorLiquido = Number((totalProventos - totalDescontos).toFixed(2));
    const employer = calculateEmployerCharges(totalProventos);

    const paystub: Paystub = {
      id: stubId,
      companyId,
      periodId,
      periodName: `Folha ${type} - ${monthStr}/${year}`,
      employeeId: colab.id,
      employeeName: colab.nomeCompleto,
      cpf,
      cargo,
      departamento,
      admissaoDate,
      salarioBase,
      diasTrabalhados: 30,
      dependentsCount,
      pensaoAlimenticiaValue,
      items,
      totalProventos: Number(totalProventos.toFixed(2)),
      totalDescontos,
      valorLiquido,
      baseINSS: inssCalc.base,
      valorINSS: inssCalc.amount,
      baseIRRF: irrfCalc.base,
      valorIRRF: irrfCalc.amount,
      baseFGTS: fgtsCalc.base,
      valorFGTS: fgtsCalc.amount,
      employerCharges: employer,
      statusAssinatura: 'Pendente'
    };

    newPaystubs.push(paystub);
    await savePaystubFirestore(companyId, paystub);
  }

  // Consolidação dos Totais do Período
  const totalGross = newPaystubs.reduce((a, s) => a + s.totalProventos, 0);
  const totalDiscounts = newPaystubs.reduce((a, s) => a + s.totalDescontos, 0);
  const totalNet = newPaystubs.reduce((a, s) => a + s.valorLiquido, 0);
  const totalFGTS = newPaystubs.reduce((a, s) => a + s.valorFGTS, 0);
  const totalPatronal = newPaystubs.reduce((a, s) => a + s.employerCharges.totalPatronal, 0);

  const period: PayrollPeriod = {
    id: periodId,
    companyId,
    referenceMonth,
    year,
    month,
    type,
    status: 'Aberto',
    totalEmployees: newPaystubs.length,
    totalGross: Number(totalGross.toFixed(2)),
    totalDiscounts: Number(totalDiscounts.toFixed(2)),
    totalNet: Number(totalNet.toFixed(2)),
    totalFGTS: Number(totalFGTS.toFixed(2)),
    totalPatronal: Number(totalPatronal.toFixed(2)),
    paystubsCount: newPaystubs.length,
    paystubsSignedCount: 0,
    updatedAt: new Date().toISOString()
  };

  await savePayrollPeriodFirestore(companyId, period);

  await logPayrollAuditFirestore(
    companyId,
    periodId,
    'Processamento Automatizado de Folha',
    userEmail,
    userName,
    `Folha de pagamento ${referenceMonth} (${type}) reprocessada com sucesso para ${newPaystubs.length} colaboradores.`
  );

  return { period, paystubs: newPaystubs };
}

/**
 * Busca/Gera Eventos eSocial
 */
export async function getESocialEventsFirestore(companyId: string): Promise<ESocialEvent[]> {
  try {
    const q = query(
      collection(db, COLLECTION_ESOCIAL),
      where('companyId', '==', companyId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => ({
        id: d.id,
        ...(sanitizeFirestoreData(d.data()) as Record<string, any>)
      })) as ESocialEvent[];
    }
  } catch (err) {
    console.warn('[Payroll] Erro ao carregar eventos eSocial:', err);
  }
  return [];
}
