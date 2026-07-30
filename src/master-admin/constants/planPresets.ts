import { TenantModulePermissions, MasterPlanPreset } from '../types/master';

export interface PlanPresetConfig {
  id: MasterPlanPreset;
  name: string;
  description: string;
  suggestedPriceMonthly: number;
  maxUsers: number;
  maxActiveJobs: number;
  modules: TenantModulePermissions;
}

export const PLAN_PRESETS: PlanPresetConfig[] = [
  {
    id: 'Básico',
    name: 'Plano Básico (Start)',
    description: 'Ideal para pequenas empresas iniciando recrutamento e seleção.',
    suggestedPriceMonthly: 490,
    maxUsers: 5,
    maxActiveJobs: 5,
    modules: {
      vagas: true,
      headhunter: false,
      bancoTalentos: true,
      entrevistas: true,
      equipeInterna: true,
      consultorRH: false,
      feriasBeneficios: false,
      documentosAssinatura: false,
      auditoriaLogs: false,
      relatoriosAvancados: false,
      siteVagasPersonalizado: true
    }
  },
  {
    id: 'Intermediário',
    name: 'Plano Intermediário (Pro)',
    description: 'Para médias empresas com alta demanda de seleção e gestão de documentos.',
    suggestedPriceMonthly: 1290,
    maxUsers: 15,
    maxActiveJobs: 20,
    modules: {
      vagas: true,
      headhunter: true,
      bancoTalentos: true,
      entrevistas: true,
      equipeInterna: true,
      consultorRH: false,
      feriasBeneficios: true,
      documentosAssinatura: true,
      auditoriaLogs: false,
      relatoriosAvancados: true,
      siteVagasPersonalizado: true
    }
  },
  {
    id: 'Completo / Enterprise',
    name: 'Plano Completo / Enterprise',
    description: 'Acesso ilimitado com Consultoria em IA, Auditoria LGPD e Suporte VIP.',
    suggestedPriceMonthly: 2890,
    maxUsers: 50,
    maxActiveJobs: 100,
    modules: {
      vagas: true,
      headhunter: true,
      bancoTalentos: true,
      entrevistas: true,
      equipeInterna: true,
      consultorRH: true,
      feriasBeneficios: true,
      documentosAssinatura: true,
      auditoriaLogs: true,
      relatoriosAvancados: true,
      siteVagasPersonalizado: true
    }
  }
];
