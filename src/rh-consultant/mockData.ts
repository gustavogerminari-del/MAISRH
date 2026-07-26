import { ConsultantClient, ConsultantJob, ConsultantCandidateScreening } from './types';

export const MOCK_CONSULTANT_CLIENTS: ConsultantClient[] = [
  {
    id: 'cli-001',
    name: 'Grupo Alpha Logística',
    cnpj: '12.345.678/0001-90',
    contactName: 'Carlos Eduardo (Gerente RH)',
    email: 'carlos@alphalog.com.br',
    phone: '(11) 98888-1122',
    activeJobsCount: 2,
    totalFeeValue: 18500
  },
  {
    id: 'cli-002',
    name: 'OmniTech Softwares',
    cnpj: '98.765.432/0001-10',
    contactName: 'Fernanda Lima (Diretora)',
    email: 'fernanda@omnitech.io',
    phone: '(11) 97777-3344',
    activeJobsCount: 1,
    totalFeeValue: 12000
  }
];

export const MOCK_CONSULTANT_JOBS: ConsultantJob[] = [
  {
    id: 'cjob-101',
    code: 'CON-01',
    title: 'Gerente de Operações Logísticas',
    clientId: 'cli-001',
    clientName: 'Grupo Alpha Logística',
    status: 'Em Triagem',
    candidatesCount: 14,
    financial: {
      feeValue: 10500,
      paymentMethod: 'Faturamento 30 Dias',
      commissionRatePercent: 15,
      commissionValue: 1575,
      amountReceived: 10500,
      isPaid: true,
      paymentDate: '2026-07-15'
    },
    expenses: [
      {
        id: 'exp-1',
        jobId: 'cjob-101',
        clientId: 'cli-001',
        description: 'Destaque de vaga no Catho & LinkedIn Recruiter',
        category: 'Anúncio de Vaga',
        amount: 450,
        date: '2026-07-02'
      },
      {
        id: 'exp-2',
        jobId: 'cjob-101',
        clientId: 'cli-001',
        description: 'Aplicação de Testes Comportamentais DISC (5 candidatos)',
        category: 'Análise de Perfil/Assessment',
        amount: 350,
        date: '2026-07-10'
      }
    ],
    createdAt: '2026-07-01'
  },
  {
    id: 'cjob-102',
    code: 'CON-02',
    title: 'Coordenador de Transportes',
    clientId: 'cli-001',
    clientName: 'Grupo Alpha Logística',
    status: 'Entrevistas',
    candidatesCount: 8,
    financial: {
      feeValue: 8000,
      paymentMethod: 'Pix',
      commissionRatePercent: 12,
      commissionValue: 960,
      amountReceived: 4000, // 50% entrada
      isPaid: false
    },
    expenses: [
      {
        id: 'exp-3',
        jobId: 'cjob-102',
        clientId: 'cli-001',
        description: 'Anúncio impulsionado redes sociais',
        category: 'Anúncio de Vaga',
        amount: 200,
        date: '2026-07-12'
      }
    ],
    createdAt: '2026-07-10'
  },
  {
    id: 'cjob-103',
    code: 'CON-03',
    title: 'Arquiteto de Soluções AWS',
    clientId: 'cli-002',
    clientName: 'OmniTech Softwares',
    status: 'Aprovado / Fechada',
    candidatesCount: 6,
    financial: {
      feeValue: 12000,
      paymentMethod: 'Pix',
      commissionRatePercent: 20,
      commissionValue: 2400,
      amountReceived: 12000,
      isPaid: true,
      paymentDate: '2026-07-20'
    },
    expenses: [
      {
        id: 'exp-4',
        jobId: 'cjob-103',
        clientId: 'cli-002',
        description: 'Avaliação Técnica Externa de Código',
        category: 'Softwares/Testes',
        amount: 600,
        date: '2026-07-15'
      }
    ],
    createdAt: '2026-06-25'
  }
];

export const MOCK_CONSULTANT_SCREENINGS: ConsultantCandidateScreening[] = [
  {
    id: 'cand-s1',
    jobId: 'cjob-101',
    candidateName: 'Rodrigo Albuquerque',
    email: 'rodrigo.albuquerque@email.com',
    phone: '(11) 98111-2233',
    rating: 5,
    tag: 'Altamente Recomendado',
    notes: 'Excelente bagagem em gestão de frotas e centro de distribuição.',
    interviewFeedback: 'Aprovado pelo Consultor. Agendado entrevista presencial com o Cliente.',
    interviewScheduledDate: '2026-07-28 14:00'
  },
  {
    id: 'cand-s2',
    jobId: 'cjob-101',
    candidateName: 'Juliana Mendes',
    email: 'juliana.mendes@email.com',
    phone: '(11) 98222-3344',
    rating: 4,
    tag: 'Em Análise',
    notes: 'Perfil técnico forte, aguardando validação de expectativa salarial.',
    interviewFeedback: 'Aguardando envio do teste DISC.'
  }
];
