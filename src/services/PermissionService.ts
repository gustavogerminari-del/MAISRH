export type SystemRole = 'MASTER' | 'EMPRESA_ADMIN' | 'RH' | 'GESTOR' | 'COLABORADOR';

export interface RolePermissions {
  role: SystemRole;
  displayName: string;
  permissions: string[];
}

export const ROLE_PERMISSIONS_MAP: Record<SystemRole, string[]> = {
  MASTER: [
    '*',
    'master:manage_companies',
    'master:manage_plans',
    'master:manage_modules',
    'master:view_all_audits',
    'master:view_billing',
    'master:impersonate_company',
    'company:read',
    'company:write',
    'users:read',
    'users:write',
    'jobs:read',
    'jobs:write',
    'candidates:read',
    'candidates:write',
    'employees:read',
    'employees:write',
    'payroll:read',
    'payroll:write',
    'timeclock:read',
    'timeclock:write',
    'benefits:read',
    'benefits:write',
    'documents:read',
    'documents:write',
    'reports:read'
  ],
  EMPRESA_ADMIN: [
    'company:read',
    'company:write',
    'users:read',
    'users:write',
    'jobs:read',
    'jobs:write',
    'candidates:read',
    'candidates:write',
    'employees:read',
    'employees:write',
    'payroll:read',
    'payroll:write',
    'timeclock:read',
    'timeclock:write',
    'benefits:read',
    'benefits:write',
    'documents:read',
    'documents:write',
    'reports:read',
    'settings:read',
    'settings:write',
    'modules:manage',
    'subscriptions:read',
    'headhunter.visualizar',
    'headhunter.criar',
    'headhunter.editar',
    'headhunter.contatar',
    'headhunter.vincular_vaga',
    'headhunter.converter_candidato',
    'headhunter.excluir',
    'headhunter.exportar'
  ],
  RH: [
    'company:read',
    'users:read',
    'jobs:read',
    'jobs:write',
    'candidates:read',
    'candidates:write',
    'employees:read',
    'employees:write',
    'payroll:read',
    'payroll:write',
    'timeclock:read',
    'timeclock:write',
    'benefits:read',
    'benefits:write',
    'documents:read',
    'documents:write',
    'reports:read',
    'headhunter.visualizar',
    'headhunter.criar',
    'headhunter.editar',
    'headhunter.contatar',
    'headhunter.vincular_vaga',
    'headhunter.converter_candidato'
  ],
  GESTOR: [
    'company:read',
    'users:read',
    'jobs:read',
    'jobs:write',
    'candidates:read',
    'employees:read',
    'timeclock:read',
    'timeclock:write',
    'documents:read',
    'reports:read'
  ],
  COLABORADOR: [
    'profile:read',
    'profile:write',
    'timeclock:read',
    'timeclock:write',
    'payroll:read_own',
    'benefits:read_own',
    'documents:read_own'
  ]
};

export class PermissionService {
  static normalizeRole(roleString?: string): SystemRole {
    if (!roleString) return 'COLABORADOR';
    const upper = roleString.toUpperCase().trim();
    if (upper === 'MASTER' || upper === 'SUPER_ADMIN') return 'MASTER';
    if (upper === 'EMPRESA_ADMIN' || upper === 'ADMIN_EMPRESA' || upper === 'ADMIN') return 'EMPRESA_ADMIN';
    if (upper === 'RH' || upper === 'RECURSOS_HUMANOS' || upper === 'RECRUTADOR') return 'RH';
    if (upper === 'GESTOR' || upper === 'GERENTE' || upper === 'LIDER') return 'GESTOR';
    return 'COLABORADOR';
  }

  static isMaster(role?: string): boolean {
    return this.normalizeRole(role) === 'MASTER';
  }

  static isEmpresaAdmin(role?: string): boolean {
    const norm = this.normalizeRole(role);
    return norm === 'MASTER' || norm === 'EMPRESA_ADMIN';
  }

  static isRH(role?: string): boolean {
    const norm = this.normalizeRole(role);
    return norm === 'MASTER' || norm === 'EMPRESA_ADMIN' || norm === 'RH';
  }

  static isGestor(role?: string): boolean {
    const norm = this.normalizeRole(role);
    return norm === 'MASTER' || norm === 'EMPRESA_ADMIN' || norm === 'RH' || norm === 'GESTOR';
  }

  static isColaborador(role?: string): boolean {
    return true; // All roles include colaborador base access
  }

  static hasPermission(userRole: string, permission: string, customPermissions?: string[]): boolean {
    const normRole = this.normalizeRole(userRole);
    if (normRole === 'MASTER') return true;

    const basePermissions = ROLE_PERMISSIONS_MAP[normRole] || [];
    if (basePermissions.includes('*')) return true;
    if (basePermissions.includes(permission)) return true;

    if (customPermissions && customPermissions.includes(permission)) return true;

    return false;
  }

  static canAccessRoute(userRole: string, route: string, enabledModules?: Record<string, boolean>): boolean {
    const normRole = this.normalizeRole(userRole);

    // Master admin routes
    if (route.startsWith('/master') || route === 'master') {
      return normRole === 'MASTER';
    }

    if (normRole === 'MASTER') return true;

    // Module checks
    if (enabledModules) {
      if (route.includes('headhunter') && enabledModules.headhunter === false) return false;
      if (route.includes('payroll') || route.includes('folha') && enabledModules.folhaPagamento === false) return false;
      if (route.includes('ponto') && enabledModules.pontoDigital === false) return false;
      if (route.includes('beneficios') && enabledModules.beneficios === false) return false;
      if (route.includes('banco-talentos') && enabledModules.bancoTalentos === false) return false;
      if (route.includes('rh-consultant') && enabledModules.iaConsultora === false) return false;
    }

    return true;
  }

  static getPermissionsForRole(role: string): string[] {
    const norm = this.normalizeRole(role);
    return ROLE_PERMISSIONS_MAP[norm] || ROLE_PERMISSIONS_MAP.COLABORADOR;
  }
}
