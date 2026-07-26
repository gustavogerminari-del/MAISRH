import { ClientTenant, SystemAnnouncement, BackupRecord } from '../types/master';

export const MOCK_TENANTS: ClientTenant[] = [
  {
    id: 't-001',
    code: 'ALPHA-LOG',
    companyName: 'Grupo Alpha Logística S/A',
    tradeName: 'Alpha Logística',
    cnpj: '12.345.678/0001-90',
    ownerName: 'Carlos Eduardo Santos',
    ownerEmail: 'carlos.santos@alphalog.com.br',
    ownerPhone: '(11) 98765-4321',
    address: {
      cep: '01310-200',
      street: 'Av. Paulista',
      number: '1578',
      complement: 'Andar 12, Conjunto 1201',
      neighborhood: 'Bela Vista',
      cityUf: 'São Paulo / SP'
    },
    adminCredentials: {
      adminEmail: 'carlos.santos@alphalog.com.br',
      initialPassword: '••••••••',
      sendWelcomeEmail: true
    },
    status: 'Ativo',
    maxUsers: 25,
    maxActiveJobs: 50,
    modules: {
      vagas: true,
      bancoTalentos: true,
      entrevistas: true,
      equipeInterna: true,
      consultorRH: true,
      feriasBeneficios: true,
      documentosAssinatura: true,
      auditoriaLogs: true,
      relatoriosAvancados: true,
      siteVagasPersonalizado: true
    },
    branding: {
      primaryColor: '#2563EB',
      companyDisplayName: 'Alpha Logística RH',
      customDomain: 'carreiras.alphalog.com.br'
    },
    metrics: {
      activeUsersCount: 14,
      totalJobsCreated: 38,
      totalTalentsStored: 1420,
      totalDocumentsSigned: 210,
      storageUsedMB: 840,
      lastLoginAt: '2026-07-26 14:10'
    },
    contract: {
      id: 'ctr-001',
      contractNumber: 'CTR-2025-0812',
      planName: 'Completo / Enterprise',
      monthlyFee: 2890,
      billingCycle: 'Mensal',
      startDate: '2025-08-01',
      expirationDate: '2026-08-01',
      paymentMethod: 'Pix',
      autoRenew: true
    },
    createdAt: '2025-08-01',
    notes: 'Cliente VIP Enterprise. Renovação automática via Pix.'
  },
  {
    id: 't-002',
    code: 'OMNI-SOFT',
    companyName: 'OmniTech Softwares Ltda',
    tradeName: 'OmniTech',
    cnpj: '98.765.432/0001-10',
    ownerName: 'Mariana Oliveira',
    ownerEmail: 'mariana.oliveira@omnitech.io',
    ownerPhone: '(11) 97123-8899',
    status: 'Aguardando Pagamento',
    maxUsers: 15,
    maxActiveJobs: 20,
    modules: {
      vagas: true,
      bancoTalentos: true,
      entrevistas: true,
      equipeInterna: true,
      consultorRH: false,
      feriasBeneficios: true,
      documentosAssinatura: true,
      auditoriaLogs: false,
      relatoriosAvancados: true,
      siteVagasPersonalizado: true
    },
    branding: {
      primaryColor: '#7C3AED',
      companyDisplayName: 'OmniTech Careers'
    },
    metrics: {
      activeUsersCount: 8,
      totalJobsCreated: 12,
      totalTalentsStored: 490,
      totalDocumentsSigned: 64,
      storageUsedMB: 310,
      lastLoginAt: '2026-07-25 09:45'
    },
    contract: {
      id: 'ctr-002',
      contractNumber: 'CTR-2026-0115',
      planName: 'Intermediário',
      monthlyFee: 1290,
      billingCycle: 'Mensal',
      startDate: '2026-01-15',
      expirationDate: '2027-01-15',
      paymentMethod: 'Boleto Bancário',
      autoRenew: true
    },
    createdAt: '2026-01-15',
    notes: 'Fatura de Julho/2026 pendente de liquidação no banco.'
  },
  {
    id: 't-003',
    code: 'VAREJO-EXP',
    companyName: 'Varejo Express Brasil SA',
    tradeName: 'Varejo Express',
    cnpj: '44.555.666/0001-88',
    ownerName: 'Roberto Almeida',
    ownerEmail: 'roberto@varejoexpress.com.br',
    ownerPhone: '(21) 99887-1122',
    status: 'Ativo',
    maxUsers: 5,
    maxActiveJobs: 5,
    modules: {
      vagas: true,
      bancoTalentos: true,
      entrevistas: true,
      equipeInterna: true,
      consultorRH: false,
      feriasBeneficios: false,
      documentosAssinatura: false,
      auditoriaLogs: false,
      relatoriosAvancados: false,
      siteVagasPersonalizado: true
    },
    branding: {
      primaryColor: '#10B981',
      companyDisplayName: 'Trabalhe Conosco Varejo Express'
    },
    metrics: {
      activeUsersCount: 3,
      totalJobsCreated: 4,
      totalTalentsStored: 180,
      totalDocumentsSigned: 0,
      storageUsedMB: 95,
      lastLoginAt: '2026-07-26 11:20'
    },
    contract: {
      id: 'ctr-003',
      contractNumber: 'CTR-2025-1101',
      planName: 'Básico',
      monthlyFee: 490,
      billingCycle: 'Anual',
      startDate: '2025-11-01',
      expirationDate: '2026-11-01',
      paymentMethod: 'Cartão de Crédito',
      autoRenew: true
    },
    createdAt: '2025-11-01'
  },
  {
    id: 't-004',
    code: 'INNOVA-HEALTH',
    companyName: 'Innova Health Diagnósticos Médicos',
    tradeName: 'Innova Health',
    cnpj: '33.222.111/0001-55',
    ownerName: 'Dra. Vanessa Lima',
    ownerEmail: 'vanessa.lima@innovahealth.med.br',
    ownerPhone: '(31) 98844-3322',
    status: 'Suspenso',
    maxUsers: 10,
    maxActiveJobs: 10,
    modules: {
      vagas: true,
      bancoTalentos: true,
      entrevistas: true,
      equipeInterna: false,
      consultorRH: false,
      feriasBeneficios: false,
      documentosAssinatura: false,
      auditoriaLogs: false,
      relatoriosAvancados: false,
      siteVagasPersonalizado: false
    },
    branding: {
      primaryColor: '#06B6D4',
      companyDisplayName: 'Innova Health'
    },
    metrics: {
      activeUsersCount: 0,
      totalJobsCreated: 15,
      totalTalentsStored: 320,
      totalDocumentsSigned: 12,
      storageUsedMB: 210,
      lastLoginAt: '2026-05-10 16:30'
    },
    contract: {
      id: 'ctr-004',
      contractNumber: 'CTR-2024-0510',
      planName: 'Básico',
      monthlyFee: 490,
      billingCycle: 'Mensal',
      startDate: '2024-05-10',
      expirationDate: '2026-05-10',
      paymentMethod: 'Boleto Bancário',
      autoRenew: false
    },
    createdAt: '2024-05-10',
    notes: 'Acesso suspenso temporariamente a pedido do cliente por reestruturação interna.'
  }
];

export const MOCK_ANNOUNCEMENTS: SystemAnnouncement[] = [
  {
    id: 'anc-101',
    title: 'Atualização do Sistema MAIS RH v2.4',
    message: 'Lançamento do módulo de Assinatura Digital de Contratos e integração com WhatsApp.',
    targetAudience: 'TODOS',
    sentAt: '2026-07-20 10:00',
    senderName: 'Equipe Master MAIS RH',
    priority: 'NORMAL'
  },
  {
    id: 'anc-102',
    title: 'Manutenção Programada do Servidor',
    message: 'Nossa infraestrutura passará por otimizações na próxima madrugada de domingo, das 02:00 às 04:00.',
    targetAudience: 'TODOS',
    sentAt: '2026-07-15 15:30',
    senderName: 'Suporte Técnico Master',
    priority: 'ALTA'
  }
];

export const MOCK_BACKUPS: BackupRecord[] = [
  {
    id: 'bak-901',
    tenantId: 't-001',
    tenantName: 'Grupo Alpha Logística S/A',
    createdAt: '2026-07-26 03:00',
    fileSizeBytes: 428000000, // 428 MB
    checksum: 'a8f9c2d1e4b506172839401a',
    status: 'Concluído'
  },
  {
    id: 'bak-902',
    tenantId: 't-002',
    tenantName: 'OmniTech Softwares Ltda',
    createdAt: '2026-07-26 03:15',
    fileSizeBytes: 185000000, // 185 MB
    checksum: '7b6a5c4d3e2f10987654321b',
    status: 'Concluído'
  }
];

export const MOCK_SAAS_PLANS: import('../types/master').SaaSPlan[] = [
  {
    id: 'plan-001',
    name: 'Básico',
    description: 'Ideal para pequenas empresas iniciando a estruturação do RH.',
    monthlyPrice: 490,
    annualDiscountPercent: 15,
    maxUsers: 5,
    maxActiveJobs: 5,
    maxEmployees: 50,
    includedModules: ['vagas', 'bancoTalentos', 'entrevistas', 'siteVagasPersonalizado'],
    status: 'Ativo',
    subscribersCount: 2
  },
  {
    id: 'plan-002',
    name: 'Intermediário',
    description: 'Para empresas em crescimento que precisam de fluxo avançado de contratação e RH.',
    monthlyPrice: 1290,
    annualDiscountPercent: 20,
    maxUsers: 15,
    maxActiveJobs: 20,
    maxEmployees: 250,
    includedModules: ['vagas', 'bancoTalentos', 'entrevistas', 'equipeInterna', 'feriasBeneficios', 'documentosAssinatura', 'relatoriosAvancados', 'siteVagasPersonalizado'],
    status: 'Ativo',
    subscribersCount: 8
  },
  {
    id: 'plan-003',
    name: 'Completo / Enterprise',
    description: 'Acesso total irrestrito a todos os módulos com suporte dedicado e auditoria.',
    monthlyPrice: 2890,
    annualDiscountPercent: 25,
    maxUsers: 50,
    maxActiveJobs: 100,
    maxEmployees: 1000,
    includedModules: ['vagas', 'bancoTalentos', 'entrevistas', 'equipeInterna', 'consultorRH', 'feriasBeneficios', 'documentosAssinatura', 'auditoriaLogs', 'relatoriosAvancados', 'siteVagasPersonalizado'],
    status: 'Ativo',
    subscribersCount: 4
  }
];

export const MOCK_PLATFORM_MODULES: import('../types/master').PlatformModule[] = [
  {
    id: 'mod-101',
    key: 'recrutamento',
    name: 'Recrutamento & Seleção (R&S)',
    category: 'Recrutamento',
    description: 'Publicação de vagas, kanban de candidatos, triagem por IA e banco de talentos.',
    status: 'Ativo',
    isCore: true,
    activeTenantsCount: 14,
    iconName: 'Briefcase'
  },
  {
    id: 'mod-102',
    key: 'dp',
    name: 'Departamento Pessoal (DP)',
    category: 'DP',
    description: 'Admissão digital, documentos do funcionário, férias e desligamentos.',
    status: 'Ativo',
    isCore: true,
    activeTenantsCount: 12,
    iconName: 'Users'
  },
  {
    id: 'mod-103',
    key: 'ponto',
    name: 'Ponto Eletrônico Digital',
    category: 'Ponto',
    description: 'Marcação de ponto mobile/web com geolocalização e espelho de ponto.',
    status: 'Ativo',
    isCore: false,
    activeTenantsCount: 10,
    iconName: 'Clock'
  },
  {
    id: 'mod-104',
    key: 'folha',
    name: 'Folha de Pagamento & Holerites',
    category: 'Folha',
    description: 'Cálculo de proventos, descontos, holerite digital e eSocial.',
    status: 'Ativo',
    isCore: false,
    activeTenantsCount: 8,
    iconName: 'Calculator'
  },
  {
    id: 'mod-105',
    key: 'beneficios',
    name: 'Gestão de Benefícios & Convênios',
    category: 'Benefícios',
    description: 'Gestão de VA/VR, VT, plano de saúde, seguro de vida e parcerias.',
    status: 'Ativo',
    isCore: false,
    activeTenantsCount: 11,
    iconName: 'Gift'
  },
  {
    id: 'mod-106',
    key: 'desempenho',
    name: 'Avaliação de Desempenho & PDI',
    category: 'Gestão',
    description: 'Avaliação 360°, metas OKR, feedback contínuo e plano de desenvolvimento.',
    status: 'Beta',
    isCore: false,
    activeTenantsCount: 3,
    iconName: 'Target'
  }
];

export const MOCK_VISUAL_CONFIG: import('../types/master').PlatformVisualConfig = {
  activeTheme: 'Indigo Moderno',
  primaryColor: '#4F46E5',
  secondaryColor: '#0EA5E9',
  fontFamily: 'Plus Jakarta Sans',
  globalLogoUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=120&auto=format&fit=crop&q=80',
  allowClientCustomLogo: true,
  enableCustomFields: true
};

export const MOCK_AI_PROMPTS: import('../types/master').AIPromptTemplate[] = [
  {
    id: 'prm-01',
    title: 'Triagem Automática de Curriculo',
    feature: 'Triagem de CV',
    promptText: 'Analise o CV fornecido com base nos pré-requisitos da vaga. Forneça uma nota de 0 a 100 e 3 pontos fortes e 2 pontos de atenção.',
    model: 'gemini-2.5-flash',
    active: true
  },
  {
    id: 'prm-02',
    title: 'Geração de Descrição de Vagas Atrativas',
    feature: 'Descrição de Vaga',
    promptText: 'Elabore uma descrição de vaga moderna para LinkedIn com título, responsabilidades, requisitos técnicos e diferenciais.',
    model: 'gemini-2.5-flash',
    active: true
  },
  {
    id: 'prm-03',
    title: 'Assistente e Consultor de Legislação de RH (CLT)',
    feature: 'Consultor RH',
    promptText: 'Aja como um especialista sênior em legislação trabalhista brasileira (CLT) e responda de forma clara, citando artigos.',
    model: 'gemini-2.5-pro',
    active: true
  }
];

export const MOCK_AI_LOGS: import('../types/master').AIUsageLog[] = [
  { id: 'log-01', tenantName: 'Grupo Alpha Logística', feature: 'Triagem de CV', tokensUsed: 1240, costEstUSD: 0.002, requestedAt: '2026-07-26 15:30', status: 'Sucesso' },
  { id: 'log-02', tenantName: 'OmniTech Softwares', feature: 'Consultor RH', tokensUsed: 3820, costEstUSD: 0.007, requestedAt: '2026-07-26 14:15', status: 'Sucesso' },
  { id: 'log-03', tenantName: 'Varejo Express Brasil', feature: 'Descrição de Vaga', tokensUsed: 950, costEstUSD: 0.001, requestedAt: '2026-07-26 12:00', status: 'Sucesso' }
];

export const MOCK_PARTNERS: import('../types/master').PartnerBenefit[] = [
  {
    id: 'part-01',
    name: 'Flash Benefícios Flexíveis',
    category: 'Alimentação / Refeição',
    logoUrl: 'https://images.unsplash.com/photo-1556742049-0a67568d0490?w=100&auto=format&fit=crop&q=80',
    agreementStatus: 'Ativo',
    commissionRatePercent: 2.5,
    monthlyVolumeBRL: 185000,
    activeEmployeesCount: 620,
    contactPerson: 'Fernando Castro',
    contactEmail: 'parcerias@flashapp.com.br'
  },
  {
    id: 'part-02',
    name: 'SulAmérica Saúde & Odonto',
    category: 'Saúde & Odonto',
    logoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=100&auto=format&fit=crop&q=80',
    agreementStatus: 'Ativo',
    commissionRatePercent: 3.0,
    monthlyVolumeBRL: 340000,
    activeEmployeesCount: 410,
    contactPerson: 'Patricia Souza',
    contactEmail: 'corporativo@sulamerica.com.br'
  },
  {
    id: 'part-03',
    name: 'TotalPass Academias',
    category: 'Bem-estar & Academia',
    logoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&auto=format&fit=crop&q=80',
    agreementStatus: 'Ativo',
    commissionRatePercent: 4.0,
    monthlyVolumeBRL: 92000,
    activeEmployeesCount: 280,
    contactPerson: 'Renato Lima',
    contactEmail: 'empresas@totalpass.com.br'
  }
];

export const MOCK_PLATFORM_ADMINS: import('../types/master').PlatformAdminUser[] = [
  {
    id: 'padm-01',
    name: 'Grupo MAIS RH (Master)',
    email: 'master@maisrh.com.br',
    role: 'Super Administrador',
    status: 'Ativo',
    lastAccessAt: '2026-07-26 15:50',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'padm-02',
    name: 'Engenharia & Infraestrutura Tech',
    email: 'tech.master@maisrh.com.br',
    role: 'Suporte Técnico',
    status: 'Ativo',
    lastAccessAt: '2026-07-26 11:30',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
];

export const MOCK_SECURITY_LOGS: import('../types/master').AuditSecurityLog[] = [
  {
    id: 'sec-01',
    timestamp: '2026-07-26 15:45:12',
    tenantName: 'Grupo MAIS RH (Master)',
    userName: 'master@maisrh.com.br',
    userRole: 'Super Administrador',
    actionCategory: 'LOGIN',
    description: 'Acesso autenticado ao Painel Exclusivo Master via Acesso Rápido Demo.',
    ipAddress: '187.108.22.14',
    severity: 'BAIXA'
  },
  {
    id: 'sec-02',
    timestamp: '2026-07-26 14:10:05',
    tenantName: 'Grupo Alpha Logística',
    userName: 'carlos.santos@alphalog.com.br',
    userRole: 'Administrador',
    actionCategory: 'ALTERACAO_DADOS',
    description: 'Atualização das configurações de marca e logotipo do tenant.',
    ipAddress: '200.142.10.99',
    severity: 'MEDIA'
  },
  {
    id: 'sec-03',
    timestamp: '2026-07-25 18:22:00',
    tenantName: 'OmniTech Softwares',
    userName: 'mariana.oliveira@omnitech.io',
    userRole: 'Administrador',
    actionCategory: 'EXPORTACAO',
    description: 'Exportação em massa do banco de talentos (PDF/Excel).',
    ipAddress: '177.33.88.102',
    severity: 'ALTA'
  }
];

