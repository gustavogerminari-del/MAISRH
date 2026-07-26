import { LeaveRequest, EmployeeLeaveBalance, BenefitItem } from './types';

export const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'req-001',
    employeeId: 'emp-101',
    employeeName: 'Mariana Costa Siqueira',
    department: 'Recrutamento & Seleção',
    type: 'Férias Regulamentares',
    startDate: '2026-08-10',
    endDate: '2026-08-24',
    totalDays: 15,
    status: 'Pendente de Aprovação',
    requestedAt: '2026-07-20',
    notes: 'Solicitação referente ao 1º período de férias de 15 dias.'
  },
  {
    id: 'req-002',
    employeeId: 'emp-102',
    employeeName: 'Thiago Oliveira',
    department: 'Operações de RH',
    type: 'Atestado Médico',
    startDate: '2026-07-25',
    endDate: '2026-07-27',
    totalDays: 3,
    status: 'Aprovado',
    requestedAt: '2026-07-25',
    approverName: 'Ana Paula (Gestora)',
    medicalCertificateFile: 'atestado_3dias_cid10.pdf'
  },
  {
    id: 'req-003',
    employeeId: 'emp-103',
    employeeName: 'Beatriz Vasconcelos',
    department: 'Tecnologia da Informação',
    type: 'Licença Maternidade/Paternidade',
    startDate: '2026-09-01',
    endDate: '2026-12-30',
    totalDays: 120,
    status: 'Aprovado',
    requestedAt: '2026-07-01',
    approverName: 'Diretoria de RH'
  }
];

export const MOCK_LEAVE_BALANCES: EmployeeLeaveBalance[] = [
  {
    employeeId: 'emp-101',
    employeeName: 'Mariana Costa Siqueira',
    department: 'Recrutamento & Seleção',
    vestingPeriodStart: '2025-03-01',
    vestingPeriodEnd: '2026-02-28',
    expirationDate: '2027-01-31',
    accruedDays: 30,
    takenDays: 0,
    remainingDays: 30,
    isExpiringSoon: false
  },
  {
    employeeId: 'emp-102',
    employeeName: 'Thiago Oliveira',
    department: 'Operações de RH',
    vestingPeriodStart: '2024-08-15',
    vestingPeriodEnd: '2025-08-14',
    expirationDate: '2026-07-30', // Vence logo!
    accruedDays: 30,
    takenDays: 10,
    remainingDays: 20,
    isExpiringSoon: true
  },
  {
    employeeId: 'emp-104',
    employeeName: 'Lucas Mendes Prado',
    department: 'Financeiro',
    vestingPeriodStart: '2024-09-01',
    vestingPeriodEnd: '2025-08-31',
    expirationDate: '2026-08-15', // Vence em breve!
    accruedDays: 30,
    takenDays: 0,
    remainingDays: 30,
    isExpiringSoon: true
  }
];

export const MOCK_BENEFITS: BenefitItem[] = [
  {
    id: 'ben-001',
    code: 'BEN-VT',
    title: 'Vale Transporte Eletrônico (SPTrans / EMTU)',
    category: 'Vale Transporte (VT)',
    provider: 'Ticket Log / SPTrans',
    monthlyValuePerEmployee: 380,
    companyDiscountPercent: 6,
    activeEnrolledEmployees: 42,
    renewalDate: '2026-12-01',
    status: 'Ativo'
  },
  {
    id: 'ben-002',
    code: 'BEN-VR',
    title: 'Vale Refeição Flexível R$ 45/dia',
    category: 'Vale Refeição (VR)',
    provider: 'Caju Benefícios / Sodexo',
    monthlyValuePerEmployee: 990,
    companyDiscountPercent: 0,
    activeEnrolledEmployees: 58,
    renewalDate: '2026-08-15', // Próxima renovação
    status: 'Em Renovação'
  },
  {
    id: 'ben-003',
    code: 'BEN-SAUDE',
    title: 'Plano de Saúde Bradesco Top Nacional',
    category: 'Plano de Saúde',
    provider: 'Bradesco Saúde',
    monthlyValuePerEmployee: 650,
    companyDiscountPercent: 10,
    activeEnrolledEmployees: 55,
    renewalDate: '2027-03-30',
    status: 'Ativo'
  }
];
