/**
 * MÓDULO ACESSO MASTER (SUPER ADMINISTRADOR) - Contratos e Tipos TypeScript
 * MAIS RH - Sistema de Gestão de Pessoas
 * 
 * Depende exclusivamente de:
 * 1. NÚCLEO (/src/core)
 * 2. COMPARTILHADO (/src/shared)
 * 3. AUTENTICAÇÃO (/src/auth)
 */

export type TenantStatus = 'Ativo' | 'Suspenso' | 'Aguardando Pagamento' | 'Cancelado' | 'Em Teste (Trial)';

export type MasterPlanPreset = 'Básico' | 'Intermediário' | 'Completo / Enterprise' | 'Customizado';

export interface TenantModulePermissions {
  vagas: boolean;
  bancoTalentos: boolean;
  entrevistas: boolean;
  equipeInterna: boolean;
  consultorRH: boolean;
  feriasBeneficios: boolean;
  documentosAssinatura: boolean;
  auditoriaLogs: boolean;
  relatoriosAvancados: boolean;
  siteVagasPersonalizado: boolean;
}

export interface TenantBranding {
  logoUrl?: string;
  primaryColor: string; // Ex: #4F46E5
  companyDisplayName: string;
  customDomain?: string;
}

export interface TenantUsageMetrics {
  activeUsersCount: number;
  totalJobsCreated: number;
  totalTalentsStored: number;
  totalDocumentsSigned: number;
  storageUsedMB: number;
  lastLoginAt: string;
}

export interface TenantContract {
  id: string;
  contractNumber: string;
  planName: MasterPlanPreset;
  monthlyFee: number;
  billingCycle: 'Mensal' | 'Trimestral' | 'Anual';
  startDate: string;
  expirationDate: string;
  paymentMethod: 'Boleto Bancário' | 'Cartão de Crédito' | 'Pix' | 'Faturamento Direct';
  autoRenew: boolean;
}

export interface TenantAddress {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  cityUf: string;
}

export interface TenantAdminCredentials {
  adminEmail: string;
  initialPassword?: string;
  sendWelcomeEmail?: boolean;
  createdAt?: string;
}

export interface ClientTenant {
  id: string;
  code: string;
  companyName: string;
  tradeName: string;
  cnpj: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  address?: TenantAddress;
  adminCredentials?: TenantAdminCredentials;
  status: TenantStatus;
  maxUsers: number;
  maxActiveJobs: number;
  modules: TenantModulePermissions;
  branding: TenantBranding;
  metrics: TenantUsageMetrics;
  contract: TenantContract;
  createdAt: string;
  notes?: string;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  targetAudience: 'TODOS' | 'APENAS_ATIVOS' | 'EM_RISCO_RENOVACAO' | 'ESPECIFICO';
  targetTenantIds?: string[];
  sentAt: string;
  senderName: string;
  priority: 'BAIXA' | 'NORMAL' | 'ALTA' | 'CRITICA';
}

export interface BackupRecord {
  id: string;
  tenantId: string;
  tenantName: string;
  createdAt: string;
  fileSizeBytes: number;
  checksum: string;
  status: 'Concluído' | 'Em Processamento' | 'Falha';
}

// 💳 PLANOS & SAAS
export interface SaaSPlan {
  id: string;
  name: MasterPlanPreset;
  description: string;
  monthlyPrice: number;
  annualDiscountPercent: number;
  maxUsers: number;
  maxActiveJobs: number;
  maxEmployees: number;
  includedModules: (keyof TenantModulePermissions)[];
  status: 'Ativo' | 'Rascunho' | 'Arquivado';
  subscribersCount: number;
}

// 🧩 GERENCIADOR DE MÓDULOS
export interface PlatformModule {
  id: string;
  key: string;
  name: string;
  category: 'Recrutamento' | 'DP' | 'Ponto' | 'Folha' | 'Benefícios' | 'Gestão';
  description: string;
  status: 'Ativo' | 'Beta' | 'Em Desenvolvimento' | 'Inativo';
  isCore: boolean;
  activeTenantsCount: number;
  iconName: string;
}

// 🎨 CONSTRUTOR VISUAL
export interface PlatformVisualConfig {
  activeTheme: 'Indigo Moderno' | 'Slate Executivo' | 'Emerald Pro' | 'Rose Luxury';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: 'Plus Jakarta Sans' | 'Inter' | 'Roboto' | 'Playfair Display';
  globalLogoUrl: string;
  allowClientCustomLogo: boolean;
  enableCustomFields: boolean;
}

// 🤖 INTELIGÊNCIA ARTIFICIAL
export interface AIPromptTemplate {
  id: string;
  title: string;
  feature: 'Triagem de CV' | 'Descrição de Vaga' | 'Resumo Entrevista' | 'Consultor RH' | 'Análise de Desempenho';
  promptText: string;
  model: 'gemini-2.5-flash' | 'gemini-2.5-pro';
  active: boolean;
}

export interface AIUsageLog {
  id: string;
  tenantName: string;
  feature: string;
  tokensUsed: number;
  costEstUSD: number;
  requestedAt: string;
  status: 'Sucesso' | 'Erro' | 'Throttled';
}

// 🤝 PARCEIROS
export interface PartnerBenefit {
  id: string;
  name: string;
  category: 'Alimentação / Refeição' | 'Saúde & Odonto' | 'Mobilidade & Combustível' | 'Bem-estar & Academia' | 'Seguros';
  logoUrl: string;
  agreementStatus: 'Ativo' | 'Em Negociação' | 'Pendente';
  commissionRatePercent: number;
  monthlyVolumeBRL: number;
  activeEmployeesCount: number;
  contactPerson: string;
  contactEmail: string;
}

// 👥 USUÁRIOS E PERMISSÕES DA PLATAFORMA
export interface PlatformAdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Administrador' | 'Suporte Técnico' | 'CS & Onboarding' | 'Financeiro Master';
  status: 'Ativo' | 'Inativo';
  lastAccessAt: string;
  avatar: string;
}

// 🔐 SEGURANÇA E AUDITORIA
export interface AuditSecurityLog {
  id: string;
  timestamp: string;
  tenantName: string;
  userName: string;
  userRole: string;
  actionCategory: 'LOGIN' | 'ALTERACAO_DADOS' | 'EXPORTACAO' | 'CONF_EXCLUSAO' | 'MUDANCA_PERMISSAO';
  description: string;
  ipAddress: string;
  severity: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
}

