import { ClientSubscription, BillingInvoice } from './types';

export const MOCK_SUBSCRIPTIONS: ClientSubscription[] = [
  {
    id: 'sub-001',
    companyName: 'Grupo Alpha Logística',
    cnpj: '12.345.678/0001-90',
    planTier: 'Enterprise',
    mrrValue: 2450,
    billingCycle: 'Mensal',
    contractStart: '2025-08-01',
    contractExpiration: '2026-08-01', // Vence em breve!
    paymentStatus: 'Em Dia / Ativo',
    modulesEnabled: {
      vagas: true,
      bancoTalentos: true,
      entrevistas: true,
      equipeInterna: true,
      consultoriaRH: true,
      feriasBeneficios: true,
      documentosAssinatura: true,
      auditoriaLogs: true
    },
    userLimit: 25,
    activeUsersCount: 14,
    lastPaymentDate: '2026-07-01',
    nextRenewalDate: '2026-08-01'
  },
  {
    id: 'sub-002',
    companyName: 'OmniTech Softwares',
    cnpj: '98.765.432/0001-10',
    planTier: 'Professional',
    mrrValue: 1200,
    billingCycle: 'Mensal',
    contractStart: '2026-01-15',
    contractExpiration: '2027-01-15',
    paymentStatus: 'Aguardando Pagamento',
    modulesEnabled: {
      vagas: true,
      bancoTalentos: true,
      entrevistas: true,
      equipeInterna: true,
      consultoriaRH: false,
      feriasBeneficios: true,
      documentosAssinatura: true,
      auditoriaLogs: false
    },
    userLimit: 10,
    activeUsersCount: 6,
    lastPaymentDate: '2026-06-15',
    nextRenewalDate: '2026-07-30'
  },
  {
    id: 'sub-003',
    companyName: 'Varejo Express Brasil',
    cnpj: '44.555.666/0001-88',
    planTier: 'Starter',
    mrrValue: 590,
    billingCycle: 'Anual',
    contractStart: '2025-11-01',
    contractExpiration: '2026-11-01',
    paymentStatus: 'Em Dia / Ativo',
    modulesEnabled: {
      vagas: true,
      bancoTalentos: true,
      entrevistas: true,
      equipeInterna: false,
      consultoriaRH: false,
      feriasBeneficios: false,
      documentosAssinatura: false,
      auditoriaLogs: false
    },
    userLimit: 3,
    activeUsersCount: 2,
    lastPaymentDate: '2025-11-01',
    nextRenewalDate: '2026-11-01'
  }
];

export const MOCK_INVOICES: BillingInvoice[] = [
  {
    id: 'inv-1001',
    subscriptionId: 'sub-001',
    companyName: 'Grupo Alpha Logística',
    amount: 2450,
    dueDate: '2026-07-01',
    paidDate: '2026-07-01',
    status: 'Pago'
  },
  {
    id: 'inv-1002',
    subscriptionId: 'sub-002',
    companyName: 'OmniTech Softwares',
    amount: 1200,
    dueDate: '2026-07-28',
    status: 'Pendente'
  }
];
