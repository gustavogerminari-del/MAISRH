import { MODULE_ALIASES, ResolvedModulesResult } from '../utils/companyModules';

export type SystemRole = 'MASTER' | 'EMPRESA_ADMIN' | 'RH' | 'GESTOR' | 'COLABORADOR';

export type ModuleCategoryKey = 'RECRUTAMENTO' | 'HEADHUNTER' | 'DEPARTAMENTO_PESSOAL' | 'GESTAO';

export interface ModuleDefinition {
  key: string;
  name: string;
  category: ModuleCategoryKey;
  description: string;
  aliases: string[];
}

export const PLATFORM_MODULE_CATEGORIES: Record<ModuleCategoryKey, { title: string; modules: ModuleDefinition[] }> = {
  RECRUTAMENTO: {
    title: 'Recrutamento & Seleção',
    modules: [
      { key: 'dashboard', name: 'Dashboard', category: 'RECRUTAMENTO', description: 'Painel geral e indicadores de recrutamento', aliases: ['dashboard', 'visaoGeral', 'visao_geral', 'inicio', 'visãogeral', 'visão_geral'] },
      { key: 'vagas', name: 'Vagas', category: 'RECRUTAMENTO', description: 'Abertura, edição e gestão de vagas', aliases: ['vagas', 'recrutamento', 'jobs', 'create_job', 'edit_job', 'close_job'] },
      { key: 'candidatos', name: 'Candidatos', category: 'RECRUTAMENTO', description: 'Triagem, movimentação de pipeline e candidaturas', aliases: ['candidatos', 'delete_candidate', 'candidaturas'] },
      { key: 'bancoTalentos', name: 'Banco de Talentos', category: 'RECRUTAMENTO', description: 'Base centralizada e busca de currículos', aliases: ['bancoTalentos', 'banco-talentos', 'banco_talentos', 'bancotalentos', 'banco_de_talentos'] },
      { key: 'entrevistas', name: 'Entrevistas', category: 'RECRUTAMENTO', description: 'Agendamento e avaliação de entrevistas', aliases: ['entrevistas', 'schedule_interview'] },
      { key: 'contratacoes', name: 'Contratações', category: 'RECRUTAMENTO', description: 'Fluxo unificado de aprovações e efetivação', aliases: ['contratacoes', 'contratações', 'contratacao', 'contratação', 'approve_hire'] },
    ],
  },
  HEADHUNTER: {
    title: 'Headhunter & Consultoria',
    modules: [
      { key: 'headhunter', name: 'Headhunter', category: 'HEADHUNTER', description: 'Módulo de recrutamento executivo e terceirizado', aliases: ['headhunter'] },
      { key: 'clientes', name: 'Clientes', category: 'HEADHUNTER', description: 'Gestão de empresas clientes e contas', aliases: ['clientes', 'headhunter-clientes', 'headhunter_clientes', 'headhunterclientes'] },
      { key: 'comercial', name: 'Comercial', category: 'HEADHUNTER', description: 'Propostas comerciais e CRM de vendas', aliases: ['comercial', 'headhunter-comercial', 'headhunter_comercial', 'headhuntercomercial', 'headhunter-crm', 'headhunter-propostas', 'headhunter-contratos'] },
      { key: 'financeiroHeadhunter', name: 'Financeiro (Headhunter)', category: 'HEADHUNTER', description: 'Faturamento de honorários e cobranças', aliases: ['financeiroHeadhunter', 'financeiro', 'financeiro_headhunter', 'financeiroheadhunter', 'headhunter-financeiro', 'headhunter_financeiro', 'headhunter-comissoes', 'headhunter-despesas', 'enviar_cobranca'] },
    ],
  },
  DEPARTAMENTO_PESSOAL: {
    title: 'Departamento Pessoal (DP)',
    modules: [
      { key: 'departamentoPessoal', name: 'Departamento Pessoal', category: 'DEPARTAMENTO_PESSOAL', description: 'Painel geral e gestão da equipe interna', aliases: ['departamentoPessoal', 'dp', 'departamento_pessoal', 'departamentopessoal', 'equipeInterna', 'equipe-interna', 'equipe_interna', 'colaboradores'] },
      { key: 'admissao', name: 'Admissão', category: 'DEPARTAMENTO_PESSOAL', description: 'Admissão digital, envio de kits e efetivação', aliases: ['admissao', 'admissões', 'admissoes', 'efetivar_admissao'] },
      { key: 'funcionarios', name: 'Funcionários', category: 'DEPARTAMENTO_PESSOAL', description: 'Cadastro e prontuário de colaboradores', aliases: ['funcionarios', 'funcionários', 'cadastrar_funcionario', 'manage_users'] },
      { key: 'documentos', name: 'Documentos', category: 'DEPARTAMENTO_PESSOAL', description: 'Gestão documental e assinatura digital', aliases: ['documentos', 'documentosAssinatura', 'documentos-assinatura'] },
      { key: 'pontoEletronico', name: 'Ponto Eletrônico', category: 'DEPARTAMENTO_PESSOAL', description: 'Controle de ponto digital e espelhos de jornada', aliases: ['pontoEletronico', 'pontoDigital', 'ponto-digital', 'ponto_digital', 'ponto', 'jornada', 'afastamentos', 'sst'] },
      { key: 'folhaPagamento', name: 'Folha de Pagamento', category: 'DEPARTAMENTO_PESSOAL', description: 'Cálculo de holerites, proventos e fechamento de folha', aliases: ['folhaPagamento', 'folha', 'folha-pagamento', 'folha_pagamento', 'payroll', 'rescisao', 'rescisões', 'rescisoes'] },
      { key: 'feriasBeneficios', name: 'Férias & Benefícios', category: 'DEPARTAMENTO_PESSOAL', description: 'Gestão de férias, transporte, alimentação e saúde', aliases: ['feriasBeneficios', 'ferias', 'férias', 'beneficios', 'benefícios', 'ferias-beneficios'] },
    ],
  },
  GESTAO: {
    title: 'Gestão & Tecnologia',
    modules: [
      { key: 'consultorRH', name: 'Consultor RH (IA)', category: 'GESTAO', description: 'Assistente inteligente e análises preditivas', aliases: ['consultorRH', 'iaConsultora', 'mais-rh-ia', 'consultor-rh', 'ia'] },
      { key: 'relatorios', name: 'Relatórios', category: 'GESTAO', description: 'Relatórios analíticos e exportação de dados', aliases: ['relatorios', 'relatórios', 'relatoriosAvancados', 'relatorios-dp', 'export_reports', 'relatorios-gerais'] },
      { key: 'auditoria', name: 'Auditoria', category: 'GESTAO', description: 'Trilha de auditoria e logs de segurança', aliases: ['auditoria', 'logs'] },
      { key: 'siteVagas', name: 'Site de Vagas', category: 'GESTAO', description: 'Portal de carreiras e publicação pública de vagas', aliases: ['siteVagas', 'siteVagasPersonalizado', 'site-vagas'] },
      { key: 'api', name: 'API & Integrações', category: 'GESTAO', description: 'Acesso a endpoints de API e conectores externos', aliases: ['api', 'integracoes'] },
      { key: 'configuracoes', name: 'Configurações', category: 'GESTAO', description: 'Parâmetros corporativos e preferências', aliases: ['configuracoes', 'configurações', 'edit_settings', 'configuracoes-trabalhistas', 'empresa'] },
    ],
  },
};

/**
 * Normalizes any string, route, action or alias to its canonical platform module key.
 */
export function getCanonicalModuleKey(keyOrAlias: string): string {
  if (!keyOrAlias) return 'dashboard';
  const clean = String(keyOrAlias).trim();
  const lower = clean.toLowerCase();
  const normalizedClean = lower.replace(/[-_]/g, '');

  for (const cat of Object.values(PLATFORM_MODULE_CATEGORIES)) {
    for (const mod of cat.modules) {
      if (mod.key === clean || mod.key.toLowerCase() === lower || mod.key.toLowerCase().replace(/[-_]/g, '') === normalizedClean) {
        return mod.key;
      }
      if (mod.aliases.some((a) => a === clean || a.toLowerCase() === lower || a.toLowerCase().replace(/[-_]/g, '') === normalizedClean)) {
        return mod.key;
      }
    }
  }

  return clean;
}

export interface CompanyModulesMap {
  [moduleKey: string]: boolean;
}

export interface UserPermissionsMap {
  [moduleKey: string]: boolean;
}

export interface AccessCheckOptions {
  userRole?: string;
  isMaster?: boolean;
  companyModules?: CompanyModulesMap;
  modulesLoaded?: boolean;
  source?: string;
  resolvedModules?: ResolvedModulesResult;
  userPermissions?: UserPermissionsMap | string[];
  userId?: string;
  companyId?: string;
}

export const ROLE_PERMISSIONS_MAP: Record<SystemRole, string[]> = {
  MASTER: ['*'],
  EMPRESA_ADMIN: [
    'dashboard',
    'vagas',
    'candidatos',
    'bancoTalentos',
    'entrevistas',
    'contratacoes',
    'headhunter',
    'clientes',
    'comercial',
    'financeiroHeadhunter',
    'departamentoPessoal',
    'admissao',
    'funcionarios',
    'documentos',
    'pontoEletronico',
    'folhaPagamento',
    'feriasBeneficios',
    'consultorRH',
    'relatorios',
    'siteVagas',
    'api',
    'configuracoes',
  ],
  RH: [
    'dashboard',
    'vagas',
    'candidatos',
    'bancoTalentos',
    'entrevistas',
    'contratacoes',
    'headhunter',
    'clientes',
    'comercial',
    'departamentoPessoal',
    'admissao',
    'funcionarios',
    'documentos',
    'pontoEletronico',
    'feriasBeneficios',
    'consultorRH',
    'relatorios',
    'siteVagas',
  ],
  GESTOR: [
    'dashboard',
    'vagas',
    'candidatos',
    'bancoTalentos',
    'entrevistas',
    'departamentoPessoal',
    'pontoEletronico',
    'relatorios',
  ],
  COLABORADOR: [
    'dashboard',
    'pontoEletronico',
    'documentos',
  ],
};

export class PermissionService {
  private static recentLogs = new Map<string, number>();

  /**
   * Identifies if a given role string belongs to a Company Administrator profile.
   */
  static isCompanyAdmin(role?: string): boolean {
    if (!role) return false;
    const upper = String(role).trim().toUpperCase().replace(/\s+/g, '_');
    return (
      upper === 'EMPRESA_ADMIN' ||
      upper === 'ADMIN_EMPRESA' ||
      upper === 'ADMIN' ||
      upper === 'ADMINISTRADOR' ||
      upper === 'ADMINISTRADOR_EMPRESA' ||
      upper === 'EMPRESA' ||
      upper === 'GESTOR_EMPRESA'
    );
  }

  /**
   * Identifies if a given role string belongs to a Master (Super Admin) profile.
   */
  static isMaster(role?: string): boolean {
    if (!role) return false;
    const upper = String(role).trim().toUpperCase().replace(/\s+/g, '_');
    return (
      upper === 'MASTER' ||
      upper === 'SUPER_ADMIN' ||
      upper === 'SUPER_ADMINISTRADOR'
    );
  }

  /**
   * Evaluates access based on the Strict Hierarchy:
   * 1. MASTER: total access; ignores company & user restrictions.
   * 2. Base modules (dashboard, configuracoes): allowed for authenticated company users.
   * 3. LEVEL 1: Check if module is active for the company (companyModules / resolvedModules).
   * 4. LEVEL 2 (ADMIN_EMPRESA): automatically accesses all active company modules.
   * 5. LEVEL 2 (USUÁRIO COMUM): requires individual active user permission.
   */
  static checkAccess(
    keyOrAlias: string,
    options: AccessCheckOptions
  ): { allowed: boolean; reason?: string } {
    const canonicalKey = getCanonicalModuleKey(keyOrAlias);
    const role = options.userRole;

    // 1. MASTER Profile: Total unrestricted access
    if (options.isMaster || this.isMaster(role)) {
      this.logAccess(options, canonicalKey, true, 'Acesso Master Total Concedido', 'master');
      return { allowed: true };
    }

    // 2. Base Modules: Always accessible for logged-in company users
    if (canonicalKey === 'dashboard' || canonicalKey === 'configuracoes') {
      return { allowed: true };
    }

    // 3. LEVEL 1: Check if Company has module active / contracted
    const resolved = options.resolvedModules;
    const loaded = resolved ? resolved.loaded : (options.modulesLoaded !== false);
    const source = resolved ? resolved.source : (options.source || 'empresa_modulos');
    const modulesMap = resolved ? resolved.modules : (options.companyModules || {});

    const isMapEmpty = Object.keys(modulesMap).length === 0;

    // If modules are not yet loaded or if map is empty and we haven't loaded from DB
    if (!loaded || (isMapEmpty && options.modulesLoaded === false)) {
      if (this.isCompanyAdmin(role)) {
        // ADMIN_EMPRESA should never be blocked while modules are loading
        return { allowed: true };
      }
      this.logAccess(options, canonicalKey, false, 'Módulos da empresa ainda não carregados', source, loaded);
      return {
        allowed: false,
        reason: 'Não foi possível carregar os módulos da empresa.'
      };
    }

    const companyAllowed = this.isCompanyModuleActive(canonicalKey, modulesMap);

    if (!companyAllowed) {
      this.logAccess(options, canonicalKey, false, 'Módulo não contratado pela empresa (Nível 1)', source, loaded);
      return {
        allowed: false,
        reason: `Acesso negado: O módulo '${canonicalKey}' não está ativado na licença da empresa.`
      };
    }

    this.logAccess(options, canonicalKey, true, 'Módulo liberado para a empresa (Nível 1)', source, loaded);

    // 4. LEVEL 2 (ADMIN_EMPRESA): Automatically inherits all active company modules
    if (this.isCompanyAdmin(role)) {
      return { allowed: true };
    }

    // 5. LEVEL 2 (USUÁRIO COMUM): Requires individual user permission
    const userAllowed = this.isUserPermissionActive(canonicalKey, options);
    if (!userAllowed) {
      return {
        allowed: false,
        reason: `Acesso negado: Seu usuário não possui permissão para acessar o módulo '${canonicalKey}'.`
      };
    }

    return { allowed: true };
  }

  /**
   * Helper to check Level 1 (Company Module Active)
   */
  static isCompanyModuleActive(keyOrAlias: string, companyModules: CompanyModulesMap | any): boolean {
    if (!companyModules || typeof companyModules !== 'object') return false;

    // Direct check
    if (companyModules[keyOrAlias] === true) return true;

    const canonicalKey = getCanonicalModuleKey(keyOrAlias);
    if (companyModules[canonicalKey] === true) return true;

    // Check MODULE_ALIASES map
    const aliases = MODULE_ALIASES[canonicalKey] || MODULE_ALIASES[keyOrAlias] || [];
    for (const alias of aliases) {
      if (companyModules[alias] === true) return true;
    }

    // Check PLATFORM_MODULE_CATEGORIES aliases
    for (const cat of Object.values(PLATFORM_MODULE_CATEGORIES)) {
      const mod = cat.modules.find((m) => m.key === canonicalKey);
      if (mod) {
        if (companyModules[mod.key] === true) return true;
        if (mod.aliases.some((alias) => companyModules[alias] === true)) return true;
      }
    }

    return false;
  }

  /**
   * Helper to check Level 2 (User Permission Active) for regular users.
   */
  static isUserPermissionActive(keyOrAlias: string, options: AccessCheckOptions): boolean {
    const canonicalKey = getCanonicalModuleKey(keyOrAlias);
    const role = options.userRole;

    // ADMIN_EMPRESA and MASTER automatically have permission for active company modules
    if (this.isMaster(role) || this.isCompanyAdmin(role)) {
      return true;
    }

    const userPerms = options.userPermissions;

    if (userPerms === undefined || userPerms === null) {
      const normRole = this.normalizeRole(role);
      const basePerms = ROLE_PERMISSIONS_MAP[normRole] || [];
      return basePerms.includes('*') || basePerms.includes(canonicalKey);
    }

    // Array format of user permissions: ['vagas', 'bancoTalentos', ...]
    if (Array.isArray(userPerms)) {
      if (userPerms.includes('*') || userPerms.includes(canonicalKey) || userPerms.includes(keyOrAlias)) return true;

      for (const cat of Object.values(PLATFORM_MODULE_CATEGORIES)) {
        const mod = cat.modules.find((m) => m.key === canonicalKey);
        if (mod && mod.aliases.some((a) => userPerms.includes(a))) return true;
      }
      return false;
    }

    // Map format of user permissions: { vagas: true, folhaPagamento: false }
    if (typeof userPerms === 'object') {
      if (userPerms[canonicalKey] === true || userPerms[keyOrAlias] === true) return true;

      for (const cat of Object.values(PLATFORM_MODULE_CATEGORIES)) {
        const mod = cat.modules.find((m) => m.key === canonicalKey);
        if (mod && mod.aliases.some((a) => userPerms[a] === true)) return true;
      }

      if (userPerms[canonicalKey] === undefined && userPerms[keyOrAlias] === undefined) {
        const normRole = this.normalizeRole(role);
        const basePerms = ROLE_PERMISSIONS_MAP[normRole] || [];
        return basePerms.includes('*') || basePerms.includes(canonicalKey);
      }

      return Boolean(userPerms[canonicalKey] ?? userPerms[keyOrAlias]);
    }

    return true;
  }

  /**
   * STRICT INHERITANCE RULE:
   * Sanitize user permissions so that NO user can be granted a permission
   * for a module that the company does NOT possess.
   */
  static sanitizeUserPermissions(
    requestedPermissions: Record<string, boolean>,
    companyModules: CompanyModulesMap
  ): Record<string, boolean> {
    const sanitized: Record<string, boolean> = {};

    Object.entries(requestedPermissions).forEach(([key, requestedValue]) => {
      const canonicalKey = getCanonicalModuleKey(key);
      const isCompanyActive = this.isCompanyModuleActive(canonicalKey, companyModules);

      sanitized[key] = isCompanyActive ? Boolean(requestedValue) : false;
    });

    return sanitized;
  }

  /**
   * Audit Logger for Access Attempts - Single Diagnostic Format
   */
  static logAccess(
    options: AccessCheckOptions,
    moduleKey: string,
    granted: boolean,
    reason: string,
    source: string = 'empresa_modulos',
    loaded: boolean = true
  ): void {
    const uid = options.userId || 'sessao_ativa';
    const empresaId = options.companyId || 'empresa_ativa';
    const canonicalKey = getCanonicalModuleKey(moduleKey);
    const aliasesChecked = MODULE_ALIASES[canonicalKey] || [canonicalKey];
    const availableModuleKeys = Object.keys(options.companyModules || {});

    const logKey = `${uid}_${empresaId}_${canonicalKey}_${granted}`;
    const now = Date.now();
    const lastTime = this.recentLogs.get(logKey) || 0;

    if (now - lastTime > 3000) {
      this.recentLogs.set(logKey, now);
      console.log("MODULE RESOLUTION", {
        uid,
        empresaId,
        source,
        loaded,
        requestedModule: canonicalKey,
        aliasesChecked,
        granted,
        availableModuleKeys
      });
    }
  }

  /**
   * Guard for Firestore Writes
   */
  static validateFirestoreWrite(
    moduleKey: string,
    options?: AccessCheckOptions | string
  ): void {
    if (!options) return;
    let resolvedOptions: AccessCheckOptions;
    if (typeof options === 'string') {
      resolvedOptions = { companyId: options, companyModules: { [moduleKey]: true } };
    } else {
      resolvedOptions = options;
    }

    if (!resolvedOptions.companyModules || Object.keys(resolvedOptions.companyModules).length === 0) {
      return;
    }

    const check = this.checkAccess(moduleKey, resolvedOptions);
    if (!check.allowed) {
      console.warn(`[FIRESTORE GUARD NOTICE] Gravação no módulo '${moduleKey}': ${check.reason}`);
    }
  }

  static normalizeRole(roleString?: string): SystemRole {
    if (!roleString) return 'COLABORADOR';
    if (this.isMaster(roleString)) return 'MASTER';
    if (this.isCompanyAdmin(roleString)) return 'EMPRESA_ADMIN';
    const upper = String(roleString).trim().toUpperCase().replace(/\s+/g, '_');
    if (upper === 'RH' || upper === 'RECURSOS_HUMANOS' || upper === 'RECRUTADOR') return 'RH';
    if (upper === 'GESTOR' || upper === 'GERENTE' || upper === 'LIDER') return 'GESTOR';
    return 'COLABORADOR';
  }

  static isEmpresaAdmin(role?: string): boolean {
    return this.isMaster(role) || this.isCompanyAdmin(role);
  }

  static isRH(role?: string): boolean {
    const norm = this.normalizeRole(role);
    return norm === 'MASTER' || norm === 'EMPRESA_ADMIN' || norm === 'RH';
  }

  static isGestor(role?: string): boolean {
    const norm = this.normalizeRole(role);
    return norm === 'MASTER' || norm === 'EMPRESA_ADMIN' || norm === 'RH' || norm === 'GESTOR';
  }

  static isColaborador(): boolean {
    return true;
  }

  static hasPermission(userRole: string, permission: string, customPermissions?: string[]): boolean {
    return this.checkAccess(permission, { userRole, userPermissions: customPermissions }).allowed;
  }

  static canAccessRoute(userRole: string, route: string, enabledModules?: Record<string, boolean>, userPermissions?: any): boolean {
    const check = this.checkAccess(route, { userRole, companyModules: enabledModules, userPermissions });
    return check.allowed;
  }

  static getPermissionsForRole(role: string): string[] {
    const norm = this.normalizeRole(role);
    return ROLE_PERMISSIONS_MAP[norm] || ROLE_PERMISSIONS_MAP.COLABORADOR;
  }
}

