import { PayrollPeriod, Paystub, ESocialEvent, PaystubItem, PayrollType } from '../types/payroll';
import { INITIAL_PAYROLL_PERIODS, INITIAL_PAYSTUBS, INITIAL_ESOCIAL_EVENTS } from '../data/mockPayrollData';
import { 
  calculateINSS, 
  calculateIRRF, 
  calculateFGTS, 
  calculateEmployerCharges, 
  generateDigitalHash 
} from './payrollCalculations';

const STORAGE_KEY_PERIODS = 'mais_rh_payroll_periods';
const STORAGE_KEY_PAYSTUBS = 'mais_rh_payroll_stubs';
const STORAGE_KEY_ESOCIAL = 'mais_rh_payroll_esocial';

/**
 * Periodos da Folha
 */
export function getPayrollPeriods(): PayrollPeriod[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PERIODS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Erro ao carregar períodos de folha:', err);
  }
  savePayrollPeriods(INITIAL_PAYROLL_PERIODS);
  return INITIAL_PAYROLL_PERIODS;
}

export function savePayrollPeriods(periods: PayrollPeriod[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PERIODS, JSON.stringify(periods));
  } catch (err) {
    console.error('Erro ao salvar períodos de folha:', err);
  }
}

/**
 * Holerites
 */
export function getPaystubs(): Paystub[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PAYSTUBS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Erro ao carregar holerites:', err);
  }
  savePaystubs(INITIAL_PAYSTUBS);
  return INITIAL_PAYSTUBS;
}

export function savePaystubs(stubs: Paystub[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PAYSTUBS, JSON.stringify(stubs));
  } catch (err) {
    console.error('Erro ao salvar holerites:', err);
  }
}

/**
 * Eventos eSocial
 */
export function getESocialEvents(): ESocialEvent[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ESOCIAL);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Erro ao carregar eventos eSocial:', err);
  }
  saveESocialEvents(INITIAL_ESOCIAL_EVENTS);
  return INITIAL_ESOCIAL_EVENTS;
}

export function saveESocialEvents(events: ESocialEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ESOCIAL, JSON.stringify(events));
  } catch (err) {
    console.error('Erro ao salvar eventos eSocial:', err);
  }
}

/**
 * Recalcula totais de um holerite após adicionar/remover/modificar lançamentos
 */
export function recalculatePaystub(stub: Paystub): Paystub {
  const proventos = stub.items
    .filter(i => i.type === 'Provento')
    .reduce((acc, i) => acc + i.amount, 0);

  const inssBase = proventos;
  const inssCalc = calculateINSS(inssBase);

  // Pensao
  const pensaoItem = stub.items.find(i => i.code === '5005');
  const pensaoVal = pensaoItem ? pensaoItem.amount : stub.pensaoAlimenticiaValue || 0;

  const irrfCalc = calculateIRRF(proventos, inssCalc.amount, stub.dependentsCount || 0, pensaoVal);

  // Atualiza ou insere itens automaticos de INSS e IRRF se existirem na lista
  const nextItems = stub.items.map(item => {
    if (item.code === '5001') {
      return { ...item, reference: `${inssCalc.effectiveRate}%`, amount: inssCalc.amount };
    }
    if (item.code === '5002') {
      return { ...item, reference: `${irrfCalc.ratePercent}%`, amount: irrfCalc.amount };
    }
    if (item.code === '9001') {
      return { ...item, amount: proventos };
    }
    if (item.code === '9002') {
      return { ...item, amount: Number((proventos * 0.08).toFixed(2)) };
    }
    return item;
  });

  const descontos = nextItems
    .filter(i => i.type === 'Desconto')
    .reduce((acc, i) => acc + i.amount, 0);

  const valorLiquido = Number((proventos - descontos).toFixed(2));
  const fgtsCalc = calculateFGTS(proventos);
  const employerCharges = calculateEmployerCharges(proventos);

  return {
    ...stub,
    items: nextItems,
    totalProventos: Number(proventos.toFixed(2)),
    totalDescontos: Number(descontos.toFixed(2)),
    valorLiquido,
    baseINSS: inssCalc.base,
    valorINSS: inssCalc.amount,
    baseIRRF: irrfCalc.base,
    valorIRRF: irrfCalc.amount,
    baseFGTS: fgtsCalc.base,
    valorFGTS: fgtsCalc.amount,
    employerCharges
  };
}

/**
 * Assina digitalmente o holerite
 */
export function signPaystubDigitally(paystubId: string, userIp: string = '127.0.0.1'): Paystub[] {
  const current = getPaystubs();
  const updated = current.map(stub => {
    if (stub.id === paystubId) {
      const timestamp = new Date().toISOString();
      const hash = generateDigitalHash(stub.id, stub.cpf, timestamp);
      return {
        ...stub,
        statusAssinatura: 'Assinado Digitalmente' as const,
        dataAssinatura: timestamp,
        hashDigital: hash,
        ipAssinatura: userIp
      };
    }
    return stub;
  });

  savePaystubs(updated);

  // Atualiza contador de assinaturas do período
  const targetStub = updated.find(s => s.id === paystubId);
  if (targetStub) {
    updatePeriodCounters(targetStub.periodId);
  }

  return updated;
}

/**
 * Trava / Fecha o Período de Folha (Segurança)
 */
export function closePayrollPeriod(periodId: string, userName: string): PayrollPeriod[] {
  const periods = getPayrollPeriods();
  const updated = periods.map(p => {
    if (p.id === periodId) {
      return {
        ...p,
        status: 'Fechado' as const,
        closedAt: new Date().toISOString(),
        closedBy: userName
      };
    }
    return p;
  });

  savePayrollPeriods(updated);
  return updated;
}

/**
 * Reabre o Período de Folha (Permissão Especial + Justificativa)
 */
export function reopenPayrollPeriod(periodId: string, userName: string, reason: string): PayrollPeriod[] {
  const periods = getPayrollPeriods();
  const updated = periods.map(p => {
    if (p.id === periodId) {
      return {
        ...p,
        status: 'Aberto' as const,
        reopenedAt: new Date().toISOString(),
        reopenedBy: userName,
        reopenReason: reason
      };
    }
    return p;
  });

  savePayrollPeriods(updated);
  return updated;
}

/**
 * Adiciona rúbrica avulsa em um holerite
 */
export function addItemToPaystub(paystubId: string, newItem: Omit<PaystubItem, 'id'>): Paystub[] {
  const current = getPaystubs();
  const updated = current.map(stub => {
    if (stub.id === paystubId) {
      const itemWithId: PaystubItem = {
        ...newItem,
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        isManual: true
      };
      const stubWithNewItem = {
        ...stub,
        items: [...stub.items, itemWithId]
      };
      return recalculatePaystub(stubWithNewItem);
    }
    return stub;
  });

  savePaystubs(updated);
  return updated;
}

/**
 * Remove rúbrica de um holerite
 */
export function removeItemFromPaystub(paystubId: string, itemId: string): Paystub[] {
  const current = getPaystubs();
  const updated = current.map(stub => {
    if (stub.id === paystubId) {
      const stubWithLessItem = {
        ...stub,
        items: stub.items.filter(i => i.id !== itemId)
      };
      return recalculatePaystub(stubWithLessItem);
    }
    return stub;
  });

  savePaystubs(updated);
  return updated;
}

/**
 * Processa a folha para um novo mês/período
 */
export function createNewPayrollPeriod(referenceMonth: string, type: PayrollType = 'Mensal'): PayrollPeriod[] {
  const [yearStr, monthStr] = referenceMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const periodId = `per-${year}-${monthStr}`;

  const currentPeriods = getPayrollPeriods();
  if (currentPeriods.some(p => p.id === periodId && p.type === type)) {
    return currentPeriods; // Já existe
  }

  const stubs = getPaystubs();
  const monthStubs = stubs.filter(s => s.periodId === 'per-2026-07'); // Duplica como modelo inicial

  const totalGross = monthStubs.reduce((acc, s) => acc + s.totalProventos, 0);
  const totalDiscounts = monthStubs.reduce((acc, s) => acc + s.totalDescontos, 0);
  const totalNet = monthStubs.reduce((acc, s) => acc + s.valorLiquido, 0);
  const totalFGTS = monthStubs.reduce((acc, s) => acc + s.valorFGTS, 0);
  const totalPatronal = monthStubs.reduce((acc, s) => acc + s.employerCharges.totalPatronal, 0);

  const newPeriod: PayrollPeriod = {
    id: periodId,
    referenceMonth,
    year,
    month,
    type,
    status: 'Aberto',
    totalEmployees: monthStubs.length,
    totalGross,
    totalDiscounts,
    totalNet,
    totalFGTS,
    totalPatronal,
    paystubsCount: monthStubs.length,
    paystubsSignedCount: 0,
    updatedAt: new Date().toISOString()
  };

  const updatedPeriods = [newPeriod, ...currentPeriods];
  savePayrollPeriods(updatedPeriods);

  // Duplica os holerites para o novo período
  const newStubs = monthStubs.map(s => ({
    ...s,
    id: `stub-${year}-${monthStr}-${s.employeeId}`,
    periodId,
    periodName: `Folha ${type} - ${monthStr}/${year}`,
    statusAssinatura: 'Pendente' as const,
    dataAssinatura: undefined,
    hashDigital: undefined,
    ipAssinatura: undefined
  }));

  savePaystubs([...newStubs, ...stubs]);

  return updatedPeriods;
}

/**
 * Atualiza contadores do período
 */
export function updatePeriodCounters(periodId: string): void {
  const periods = getPayrollPeriods();
  const stubs = getPaystubs().filter(s => s.periodId === periodId);

  const signedCount = stubs.filter(s => s.statusAssinatura === 'Assinado Digitalmente').length;
  const totalGross = stubs.reduce((acc, s) => acc + s.totalProventos, 0);
  const totalDiscounts = stubs.reduce((acc, s) => acc + s.totalDescontos, 0);
  const totalNet = stubs.reduce((acc, s) => acc + s.valorLiquido, 0);
  const totalFGTS = stubs.reduce((acc, s) => acc + s.valorFGTS, 0);
  const totalPatronal = stubs.reduce((acc, s) => acc + s.employerCharges.totalPatronal, 0);

  const updatedPeriods = periods.map(p => {
    if (p.id === periodId) {
      return {
        ...p,
        paystubsCount: stubs.length,
        paystubsSignedCount: signedCount,
        totalGross,
        totalDiscounts,
        totalNet,
        totalFGTS,
        totalPatronal,
        updatedAt: new Date().toISOString()
      };
    }
    return p;
  });

  savePayrollPeriods(updatedPeriods);
}
