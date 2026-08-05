import { fetchCompanyReleasedModules } from '../services/ModuleCatalogService';

export const MODULE_ALIASES: Record<string, string[]> = {
  vagas: ["vagas"],
  candidatos: ["candidatos", "bancoTalentos"],
  bancoTalentos: ["bancoTalentos", "candidatos"],
  entrevistas: ["entrevistas", "agenda"],
  contratacoes: ["contratacoes"],
  headhunter: ["headhunter"],
  financeiroHeadhunter: ["financeiroHeadhunter"],
  departamentoPessoal: [
    "departamentoPessoal",
    "funcionarios",
    "dp"
  ],
  funcionarios: [
    "funcionarios",
    "departamentoPessoal",
    "dp"
  ],
  pontoEletronico: [
    "pontoEletronico",
    "ponto"
  ],
  folhaPagamento: [
    "folhaPagamento",
    "folha"
  ],
  feriasBeneficios: [
    "feriasBeneficios"
  ],
  documentos: [
    "documentos",
    "documentosAssinatura"
  ],
  siteVagas: [
    "siteVagas",
    "siteVagasPersonalizado"
  ],
  relatorios: [
    "relatorios",
    "relatoriosAvancados"
  ],
  consultorRH: [
    "consultorRH"
  ],
  agenda: [
    "agenda",
    "entrevistas"
  ]
};

export interface ResolveCompanyModulesParams {
  empresaId?: string | null;
  uid?: string | null;
  companyDocument?: any;
  companyModulesDocument?: any;
  userDocument?: any;
  usuarioDocument?: any;
}

export interface ResolvedModulesResult {
  loaded: boolean;
  source: "empresa_modulos" | "empresas" | "users" | "usuarios" | "fallback" | "error";
  modules: Record<string, boolean>;
  error?: string | null;
}

function extractBooleanMap(obj: Record<string, any>): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'boolean') {
      result[k] = v;
    } else if (v === 'true' || v === 1) {
      result[k] = true;
    } else if (v === 'false' || v === 0) {
      result[k] = false;
    }
  }
  return result;
}

function extractDirectBooleans(obj: Record<string, any>): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  const ignoredKeys = new Set(['ativo', 'isMaster', 'sendWelcomeEmail', 'autoRenew']);
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'boolean' && !ignoredKeys.has(k)) {
      result[k] = v;
    }
  }
  return result;
}

/**
 * Single Resolver for Company Released Modules.
 * Priority order:
 * 1. empresa_modulos/{empresaId}.modules / .modulos / direct booleans
 * 2. empresas/{empresaId}.modules / .modulos / .rawTenantData.modules as compatibility
 * 3. users/{uid}.modules / .modulos as compatibility
 * 4. usuarios/{uid}.modules / .modulos as compatibility
 */
export function resolveCompanyModules(params: ResolveCompanyModulesParams): ResolvedModulesResult {
  const { companyModulesDocument, companyDocument, userDocument, usuarioDocument } = params;

  // 1. empresa_modulos/{empresaId}
  if (companyModulesDocument && typeof companyModulesDocument === 'object') {
    const mods = companyModulesDocument.modules || companyModulesDocument.modulos;
    if (mods && typeof mods === 'object' && Object.keys(mods).length > 0) {
      return {
        loaded: true,
        source: "empresa_modulos",
        modules: extractBooleanMap(mods)
      };
    }
    const directBooleans = extractDirectBooleans(companyModulesDocument);
    if (Object.keys(directBooleans).length > 0) {
      return {
        loaded: true,
        source: "empresa_modulos",
        modules: directBooleans
      };
    }
  }

  // 2. empresas/{empresaId}
  if (companyDocument && typeof companyDocument === 'object') {
    const mods = companyDocument.modules || companyDocument.modulos || companyDocument.rawTenantData?.modules;
    if (mods && typeof mods === 'object' && Object.keys(mods).length > 0) {
      return {
        loaded: true,
        source: "empresas",
        modules: extractBooleanMap(mods)
      };
    }
    const directBooleans = extractDirectBooleans(companyDocument);
    if (Object.keys(directBooleans).length > 0) {
      return {
        loaded: true,
        source: "empresas",
        modules: directBooleans
      };
    }
  }

  // 3. users/{uid}
  if (userDocument && typeof userDocument === 'object') {
    const mods = userDocument.modules || userDocument.modulos;
    if (mods && typeof mods === 'object' && Object.keys(mods).length > 0) {
      return {
        loaded: true,
        source: "users",
        modules: extractBooleanMap(mods)
      };
    }
  }

  // 4. usuarios/{uid}
  if (usuarioDocument && typeof usuarioDocument === 'object') {
    const mods = usuarioDocument.modules || usuarioDocument.modulos;
    if (mods && typeof mods === 'object' && Object.keys(mods).length > 0) {
      return {
        loaded: true,
        source: "usuarios",
        modules: extractBooleanMap(mods)
      };
    }
  }

  return {
    loaded: false,
    source: "fallback",
    modules: {},
    error: "Não foi possível carregar os módulos da empresa."
  };
}

export function isModuleEnabled(
  moduleName: string,
  resolvedModules: ResolvedModulesResult
): { granted: boolean; reason: string } {
  if (!resolvedModules || !resolvedModules.loaded) {
    return {
      granted: false,
      reason: "Não foi possível carregar os módulos da empresa."
    };
  }

  const aliases = MODULE_ALIASES[moduleName] || [moduleName];

  const granted = aliases.some(
    key => resolvedModules.modules[key] === true
  );

  return {
    granted,
    reason: granted
      ? "Módulo liberado para a empresa."
      : "Módulo não contratado pela empresa."
  };
}

export interface CompanyModuleCapabilities {
  hasHeadhunter: boolean;
  hasDP: boolean;
}

/**
 * Normalizes company modules dictionary from any raw structure.
 */
export function normalizeCompanyModules(modulesObj: any): CompanyModuleCapabilities {
  if (!modulesObj || typeof modulesObj !== 'object') {
    return { hasHeadhunter: false, hasDP: false };
  }

  const hasHeadhunter = Boolean(
    modulesObj.headhunter === true ||
    modulesObj.headhunterModule === true ||
    modulesObj.financeiroHeadhunter === true ||
    modulesObj.financeiro === true
  );

  const hasDP = Boolean(
    modulesObj.departamentoPessoal === true ||
    modulesObj.admissao === true ||
    modulesObj.documentosAdmissao === true ||
    modulesObj.dp === true ||
    modulesObj.equipeInterna === true ||
    modulesObj.pontoDigital === true ||
    modulesObj.feriasBeneficios === true
  );

  return { hasHeadhunter, hasDP };
}

/**
 * Normalizes origin field saved on a job document.
 */
export function normalizeJobOrigin(job: any): 'HEADHUNTER' | 'RH_INTERNO' | null {
  if (!job) return null;

  const raw = String(
    job.origemProcesso ||
    job.moduloOrigem ||
    job.origem ||
    job.tipoProcesso ||
    job.tipoVaga ||
    ''
  ).toLowerCase().trim();

  if (
    raw === 'headhunter' || 
    raw === 'financeiro_headhunter' || 
    raw === 'financeiro' ||
    job.isHeadhunter === true
  ) {
    return 'HEADHUNTER';
  }

  if (
    raw === 'rh_interno' ||
    raw === 'recrutamento_interno' ||
    raw === 'rh' ||
    raw === 'dp' ||
    raw === 'interno' ||
    raw === 'departamento_pessoal'
  ) {
    return 'RH_INTERNO';
  }

  if (job.clientId || job.clienteId) {
    return 'HEADHUNTER';
  }

  return null;
}

/**
 * Resolves job origin considering company module capabilities and legacy job handling.
 */
export function resolveJobOriginWithCompany(
  job: any,
  capabilities: CompanyModuleCapabilities
): 'HEADHUNTER' | 'RH_INTERNO' | 'REQUIRES_CHOICE' {
  // If company has ONLY Headhunter and NO DP, force HEADHUNTER
  if (capabilities.hasHeadhunter && !capabilities.hasDP) {
    return 'HEADHUNTER';
  }

  // If company has ONLY DP and NO Headhunter, force RH_INTERNO
  if (!capabilities.hasHeadhunter && capabilities.hasDP) {
    return 'RH_INTERNO';
  }

  const explicit = normalizeJobOrigin(job);
  
  if (explicit) {
    return explicit;
  }

  if (capabilities.hasHeadhunter && capabilities.hasDP) {
    return 'REQUIRES_CHOICE';
  }

  // Fallback default
  return 'RH_INTERNO';
}

/**
 * Helper to fetch capabilities for a company directly from Firestore.
 */
export async function getCompanyCapabilitiesFromFirestore(companyId: string): Promise<CompanyModuleCapabilities> {
  if (!companyId) return { hasHeadhunter: true, hasDP: true };
  try {
    const rawModules = await fetchCompanyReleasedModules(companyId);
    if (!rawModules || Object.keys(rawModules).length === 0) {
      // Default to both enabled if company has no explicit override
      return { hasHeadhunter: true, hasDP: true };
    }
    return normalizeCompanyModules(rawModules);
  } catch (err) {
    console.warn('Erro ao obter módulos da empresa no Firestore:', err);
    return { hasHeadhunter: true, hasDP: true };
  }
}
