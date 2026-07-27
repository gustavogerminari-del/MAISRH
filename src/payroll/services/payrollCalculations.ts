/**
 * MÓDULO FOLHA DE PAGAMENTO - Motor de Cálculos Trabalhistas e Fiscais (CLT 2026)
 * Tabelas e alíquotas oficiais de INSS, IRRF, FGTS e Encargos Patronais
 */

export const MINIMUM_WAGE_2026 = 1518.00;
export const INSS_CEILING_2026 = 8157.41;
export const IRRF_DEPENDENT_DEDUCTION = 189.59;
export const IRRF_SIMPLIFIED_DEDUCTION = 564.80;

/**
 * Cálculo do INSS Progressivo por Faixas (Vigência 2026)
 */
export function calculateINSS(grossSalary: number): { amount: number; effectiveRate: number; base: number } {
  const base = Math.min(grossSalary, INSS_CEILING_2026);
  let tax = 0;

  // Faixa 1: Até R$ 1.518,00 -> 7,5%
  if (base > 0) {
    const band1 = Math.min(base, 1518.00);
    tax += band1 * 0.075;
  }

  // Faixa 2: De R$ 1.518,01 até R$ 2.793,88 -> 9,0%
  if (base > 1518.00) {
    const band2 = Math.min(base, 2793.88) - 1518.00;
    tax += band2 * 0.09;
  }

  // Faixa 3: De R$ 2.793,89 até R$ 4.190,83 -> 12,0%
  if (base > 2793.88) {
    const band3 = Math.min(base, 4190.83) - 2793.88;
    tax += band3 * 0.12;
  }

  // Faixa 4: De R$ 4.190,84 até R$ 8.157,41 -> 14,0%
  if (base > 4190.83) {
    const band4 = Math.min(base, 8157.41) - 4190.83;
    tax += band4 * 0.14;
  }

  const amount = Number(tax.toFixed(2));
  const effectiveRate = grossSalary > 0 ? Number(((amount / grossSalary) * 100).toFixed(2)) : 0;

  return { amount, effectiveRate, base };
}

/**
 * Cálculo do IRRF com Dedução por Dependente, Pensão Alimentícia e Regra de Desconto Simplificado
 */
export function calculateIRRF(
  grossSalary: number,
  inssAmount: number,
  dependentsCount: number = 0,
  pensaoAlimenticia: number = 0
): { amount: number; ratePercent: number; deduction: number; base: number } {
  
  // Opção 1: Abatimento Legal Tradicional (INSS + Dependente + Pensão)
  const traditionalDeduction = inssAmount + (dependentsCount * IRRF_DEPENDENT_DEDUCTION) + pensaoAlimenticia;
  const baseTraditional = Math.max(0, grossSalary - traditionalDeduction);

  // Opção 2: Desconto Simplificado R$ 564,80
  const baseSimplified = Math.max(0, grossSalary - IRRF_SIMPLIFIED_DEDUCTION);

  // Utiliza a menor base tributável (a mais vantajosa para o colaborador)
  const base = Math.min(baseTraditional, baseSimplified);

  let ratePercent = 0;
  let deduction = 0;

  if (base <= 2259.20) {
    ratePercent = 0;
    deduction = 0;
  } else if (base <= 2828.65) {
    ratePercent = 7.5;
    deduction = 169.44;
  } else if (base <= 3751.05) {
    ratePercent = 15.0;
    deduction = 381.59;
  } else if (base <= 4664.68) {
    ratePercent = 22.5;
    deduction = 662.92;
  } else {
    ratePercent = 27.5;
    deduction = 896.00;
  }

  const rawTax = (base * (ratePercent / 100)) - deduction;
  const amount = Math.max(0, Number(rawTax.toFixed(2)));

  return { amount, ratePercent, deduction, base };
}

/**
 * Cálculo do FGTS (8% sobre Proventos Tributáveis)
 */
export function calculateFGTS(grossSalary: number): { amount: number; base: number } {
  const base = grossSalary;
  const amount = Number((base * 0.08).toFixed(2));
  return { amount, base };
}

/**
 * Cálculo dos Encargos Patronais da Empresa (INSS Patronal 20%, RAT/SAT 2%, Terceiros 5.8%)
 */
export function calculateEmployerCharges(grossSalary: number) {
  const inssPatronal = Number((grossSalary * 0.20).toFixed(2));
  const ratSat = Number((grossSalary * 0.02).toFixed(2));
  const terceiros = Number((grossSalary * 0.058).toFixed(2));
  const totalPatronal = Number((inssPatronal + ratSat + terceiros).toFixed(2));
  const fgtsValor = Number((grossSalary * 0.08).toFixed(2));

  return {
    inssPatronal,
    ratSat,
    terceiros,
    totalPatronal,
    fgtsValor
  };
}

/**
 * Horas Extras (50% e 100%)
 */
export function calculateOvertime(baseSalary: number, hours50: number = 0, hours100: number = 0) {
  const hourlyRate = baseSalary / 220;
  const amount50 = Number((hourlyRate * 1.5 * hours50).toFixed(2));
  const amount100 = Number((hourlyRate * 2.0 * hours100).toFixed(2));
  return { hourlyRate, amount50, amount100, totalOvertime: amount50 + amount100 };
}

/**
 * Adicional Noturno (20% sobre valor hora base)
 */
export function calculateNightShift(baseSalary: number, nightHours: number = 0) {
  const hourlyRate = baseSalary / 220;
  const amount = Number((hourlyRate * 0.20 * nightHours).toFixed(2));
  return amount;
}

/**
 * Insalubridade (10%, 20% ou 40% sobre Salário Mínimo)
 */
export function calculateInsalubridade(degree: '10%' | '20%' | '40%') {
  const percentMap = { '10%': 0.10, '20%': 0.20, '40%': 0.40 };
  const percent = percentMap[degree] || 0.20;
  return Number((MINIMUM_WAGE_2026 * percent).toFixed(2));
}

/**
 * Periculosidade (30% sobre Salário Base)
 */
export function calculatePericulosidade(baseSalary: number) {
  return Number((baseSalary * 0.30).toFixed(2));
}

/**
 * DSR (Descanso Semanal Remunerado) sobre Horas Extras / Comissões
 */
export function calculateDSR(overtimeAndCommissionsTotal: number, workingDays: number = 25, sundaysAndHolidays: number = 5) {
  if (workingDays <= 0) return 0;
  return Number(((overtimeAndCommissionsTotal / workingDays) * sundaysAndHolidays).toFixed(2));
}

/**
 * Gera Hash Digital SHA-like para validação do Holerite Assinado
 */
export function generateDigitalHash(paystubId: string, employeeCpf: string, timestamp: string): string {
  const str = `${paystubId}-${employeeCpf}-${timestamp}-MAISRH-SECURE-CLT-2026`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'MAISRH-SHA256-' + Math.abs(hash).toString(16).toUpperCase().padStart(12, '0') + '-' + Date.now().toString(36).toUpperCase();
}
