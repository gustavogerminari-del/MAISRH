import { fetchCompanyReleasedModules } from '../services/ModuleCatalogService';

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
