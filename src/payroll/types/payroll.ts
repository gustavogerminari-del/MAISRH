/**
 * MÓDULO FOLHA DE PAGAMENTO - Contratos e Tipos TypeScript
 * MAIS RH - Sistema de Gestão de Pessoas (em conformidade com CLT / Legislação Brasileira 2026)
 * 
 * Depende apenas de NÚCLEO, COMPARTILHADO, AUTENTICAÇÃO, CADASTROS COMPLETOS, CONTROLE DE PONTO e BENEFÍCIOS.
 */

export type PayrollPeriodStatus = 'Aberto' | 'Em Processamento' | 'Fechado' | 'Cancelado';

export type PayrollType = 
  | 'Mensal' 
  | 'Complementar' 
  | 'Rescisão' 
  | '13º Salário (1ª Parcela)' 
  | '13º Salário (2ª Parcela)' 
  | 'Férias' 
  | 'Adiantamento Salarial';

export type RubricType = 'Provento' | 'Desconto' | 'Informativa';

export interface RubricDefinition {
  code: string;           // Código eSocial / Interno (Ex: "1001", "5001")
  name: string;           // Nome da Rúbrica (Ex: "Salário Base", "INSS")
  type: RubricType;
  description: string;
  incidesINSS: boolean;
  incidesIRRF: boolean;
  incidesFGTS: boolean;
  isSystemDefault: boolean;
}

export interface PaystubItem {
  id: string;
  code: string;
  name: string;
  type: RubricType;
  reference: string;      // Ex: "220 hrs", "10 hrs 50%", "7,5%", "2 dependentes"
  amount: number;         // Valor em R$
  isManual?: boolean;     // Se foi adicionado/editado manualmente
}

export interface EmployerCharges {
  inssPatronal: number;    // INSS Patronal (20%)
  ratSat: number;          // RAT / SAT (2%)
  terceiros: number;       // Terceiros / Outras Entidades (5.8%)
  totalPatronal: number;   // Total Patronal (27.8%)
  fgtsValor: number;       // FGTS da empresa (8%)
}

export interface Paystub {
  id: string;
  periodId: string;
  periodName: string;      // Ex: "Folha Mensal - Julho / 2026"
  employeeId: string;
  employeeName: string;
  cpf: string;
  cargo: string;
  departamento: string;
  admissaoDate: string;
  bancoInfo?: {
    banco: string;
    agencia: string;
    conta: string;
    tipoConta: 'Corrente' | 'Poupança' | 'Salário';
    pix?: string;
  };
  salarioBase: number;
  diasTrabalhados: number;
  dependentsCount: number;
  pensaoAlimenticiaValue: number;
  
  items: PaystubItem[];
  
  totalProventos: number;
  totalDescontos: number;
  valorLiquido: number;
  
  // Bases e Impostos Calculados
  baseINSS: number;
  valorINSS: number;
  baseIRRF: number;
  valorIRRF: number;
  baseFGTS: number;
  valorFGTS: number;
  
  // Encargos da Empresa
  employerCharges: EmployerCharges;
  
  // Assinatura e Segurança
  statusAssinatura: 'Pendente' | 'Assinado Digitalmente' | 'Recusado';
  dataAssinatura?: string;
  hashDigital?: string;
  ipAssinatura?: string;
  notes?: string;
}

export interface PayrollPeriod {
  id: string;
  referenceMonth: string;  // Ex: "2026-07"
  year: number;
  month: number;
  type: PayrollType;
  status: PayrollPeriodStatus;
  
  closedAt?: string;
  closedBy?: string;
  reopenedAt?: string;
  reopenedBy?: string;
  reopenReason?: string;
  
  totalEmployees: number;
  totalGross: number;      // Total Proventos
  totalDiscounts: number;  // Total Descontos
  totalNet: number;        // Total Líquido a Pagar
  totalFGTS: number;       // Total FGTS 8%
  totalPatronal: number;   // Total Encargos Empresa
  
  paystubsCount: number;
  paystubsSignedCount: number;
  updatedAt: string;
}

export interface ESocialEvent {
  id: string;
  code: 'S-1200' | 'S-1210' | 'S-2200' | 'S-2299';
  title: string;
  description: string;
  periodRef: string;
  totalRecords: number;
  status: 'Gerado' | 'Transmitido' | 'Validado com Sucesso' | 'Erro no Lote';
  xmlData: string;
  generatedAt: string;
  receiptNumber?: string;
}

export interface PayrollFilterParams {
  searchTerm?: string;
  department?: string;
  statusAssinatura?: 'Todos' | 'Pendente' | 'Assinado Digitalmente';
  payrollType?: PayrollType | 'Todos';
}
