import { 
  PageConfig, 
  ComponentInstance, 
  PageVersion, 
  BuilderAuditLog, 
  CustomFieldDefinition, 
  NavigationMenuItem, 
  ClientTemplate,
  BuilderScope
} from '../types/builderTypes';

const STORAGE_KEYS = {
  PAGES: 'maisrh_builder_pages_v2',
  VERSIONS: 'maisrh_builder_versions_v2',
  AUDIT_LOGS: 'maisrh_builder_audit_v2',
  CUSTOM_FIELDS: 'maisrh_builder_fields_v2',
  MENUS: 'maisrh_builder_menus_v2',
  TEMPLATES: 'maisrh_builder_templates_v2',
  THEMES: 'maisrh_builder_themes_v2'
};

// Initial Seed Pages
export const INITIAL_SYSTEM_PAGES: PageConfig[] = [
  {
    id: 'page-dashboard',
    name: 'Dashboard Operacional',
    slug: 'dashboard',
    route: '/dashboard',
    pageType: 'system',
    isSystemPage: true,
    scope: 'global',
    status: 'published',
    version: 1,
    layoutType: 'dashboard',
    requiredPermissions: ['dashboard.view'],
    updatedAt: new Date().toISOString(),
    updatedBy: 'MASTER Admin',
    components: [
      {
        id: 'comp-dash-header',
        pageId: 'page-dashboard',
        componentType: 'header',
        componentKey: 'header_main',
        name: 'Cabeçalho Principal',
        order: 1,
        protectionLevel: 'protected',
        content: {
          text: 'Painel Geral de Gestão de RH',
          helpText: 'Acompanhamento em tempo real de vagas, contratações e colaboradores'
        },
        styles: {
          fontSize: '24px',
          fontWeight: '800',
          textColor: '#0f172a',
          marginBottom: '16px'
        },
        responsive: { desktop: { fontSize: '24px' }, mobile: { fontSize: '18px' } },
        visibilityRules: { hidden: false },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'comp-dash-stat-vagas',
        pageId: 'page-dashboard',
        componentType: 'stat_card',
        componentKey: 'stat_vagas_ativas',
        name: 'Card Vagas Ativas',
        order: 2,
        protectionLevel: 'editable',
        content: {
          label: 'Vagas em Aberto',
          text: '12 Vagas',
          badgeText: '+2 esta semana',
          iconName: 'Briefcase'
        },
        styles: {
          backgroundColor: '#ffffff',
          borderColor: '#e2e8f0',
          borderRadius: '12px',
          paddingTop: '16px',
          paddingBottom: '16px'
        },
        responsive: { desktop: { width: '100%' } },
        visibilityRules: { hidden: false },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'comp-dash-btn-nova-vaga',
        pageId: 'page-dashboard',
        componentType: 'button',
        componentKey: 'btn_criar_vaga',
        name: 'Botão Nova Vaga',
        order: 3,
        protectionLevel: 'editable',
        content: {
          text: 'Criar Nova Vaga',
          iconName: 'Plus'
        },
        styles: {
          backgroundColor: '#4f46e5',
          textColor: '#ffffff',
          borderRadius: '8px',
          paddingTop: '10px',
          paddingBottom: '10px',
          fontWeight: '600'
        },
        responsive: { desktop: { display: 'inline-flex' } },
        visibilityRules: { hidden: false },
        actionConfig: { type: 'open_modal', targetModalId: 'new_job_modal' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'comp-dash-btn-logout',
        pageId: 'page-dashboard',
        componentType: 'button',
        componentKey: 'btn_logout_seguro',
        name: 'Botão Sair do Sistema',
        order: 99,
        protectionLevel: 'systemCritical',
        content: {
          text: 'Sair da Conta',
          iconName: 'LogOut'
        },
        styles: {
          backgroundColor: '#ef4444',
          textColor: '#ffffff',
          borderRadius: '8px'
        },
        responsive: {},
        visibilityRules: { hidden: false },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 'page-vagas',
    name: 'Gestão de Vagas',
    slug: 'vagas',
    route: '/vagas',
    pageType: 'system',
    isSystemPage: true,
    scope: 'global',
    status: 'published',
    version: 1,
    layoutType: 'table_view',
    requiredPermissions: ['jobs.view'],
    updatedAt: new Date().toISOString(),
    updatedBy: 'MASTER Admin',
    components: [
      {
        id: 'comp-vagas-title',
        pageId: 'page-vagas',
        componentType: 'title',
        componentKey: 'title_vagas',
        name: 'Título Gestão de Vagas',
        order: 1,
        protectionLevel: 'protected',
        content: { text: 'Gestão Completa de Oportunidades & R&S' },
        styles: { fontSize: '22px', fontWeight: '800', textColor: '#0f172a' },
        responsive: {},
        visibilityRules: { hidden: false },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'comp-vagas-btn-cadastrar',
        pageId: 'page-vagas',
        componentType: 'button',
        componentKey: 'btn_cadastrar_vaga_main',
        name: 'Botão Cadastrar Vaga',
        order: 2,
        protectionLevel: 'editable',
        content: { text: 'Abrir Nova Vaga', iconName: 'PlusCircle' },
        styles: { backgroundColor: '#0d9488', textColor: '#ffffff', borderRadius: '8px' },
        responsive: {},
        visibilityRules: { hidden: false },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 'page-candidatos',
    name: 'Banco de Talentos',
    slug: 'banco-talentos',
    route: '/banco-talentos',
    pageType: 'system',
    isSystemPage: true,
    scope: 'global',
    status: 'published',
    version: 1,
    layoutType: 'grid',
    requiredPermissions: ['candidates.view'],
    updatedAt: new Date().toISOString(),
    updatedBy: 'MASTER Admin',
    components: [
      {
        id: 'comp-cand-title',
        pageId: 'page-candidatos',
        componentType: 'title',
        componentKey: 'title_candidatos',
        name: 'Título Banco de Talentos',
        order: 1,
        protectionLevel: 'protected',
        content: { text: 'Banco Global de Talentos e Currículos' },
        styles: { fontSize: '22px', fontWeight: '800', textColor: '#0f172a' },
        responsive: {},
        visibilityRules: { hidden: false },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'comp-cand-btn-add',
        pageId: 'page-candidatos',
        componentType: 'button',
        componentKey: 'btn_adicionar_candidato',
        name: 'Botão Adicionar Candidato',
        order: 2,
        protectionLevel: 'editable',
        content: { text: 'Cadastrar Candidato', iconName: 'UserPlus' },
        styles: { backgroundColor: '#2563eb', textColor: '#ffffff', borderRadius: '8px' },
        responsive: {},
        visibilityRules: { hidden: false },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 'page-ponto',
    name: 'Ponto Digital & Jornada',
    slug: 'ponto-digital',
    route: '/ponto-digital',
    pageType: 'system',
    isSystemPage: true,
    scope: 'global',
    status: 'published',
    version: 1,
    layoutType: 'flex',
    requiredPermissions: ['timeclock.view'],
    updatedAt: new Date().toISOString(),
    updatedBy: 'MASTER Admin',
    components: [
      {
        id: 'comp-ponto-title',
        pageId: 'page-ponto',
        componentType: 'title',
        componentKey: 'title_ponto',
        name: 'Título Ponto Eletrônico',
        order: 1,
        protectionLevel: 'protected',
        content: { text: 'Registro de Ponto e Controle de Jornada (Portaria 671)' },
        styles: { fontSize: '20px', fontWeight: '700', textColor: '#0f172a' },
        responsive: {},
        visibilityRules: { hidden: false },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 'page-site-vagas',
    name: 'Portal Público de Vagas',
    slug: 'site-vagas',
    route: '/site-vagas',
    pageType: 'portal',
    isSystemPage: true,
    scope: 'global',
    status: 'published',
    version: 1,
    layoutType: 'flex',
    requiredPermissions: [],
    updatedAt: new Date().toISOString(),
    updatedBy: 'MASTER Admin',
    components: [
      {
        id: 'comp-portal-banner',
        pageId: 'page-site-vagas',
        componentType: 'banner',
        componentKey: 'hero_portal_vagas',
        name: 'Hero Banner Portal Vagas',
        order: 1,
        protectionLevel: 'editable',
        content: {
          text: 'Trabalhe Conosco — Transforme sua Carreira no MAIS RH',
          helpText: 'Confira nossas oportunidades em aberto e cadastre seu currículo diretamente.'
        },
        styles: {
          backgroundColor: '#1e1b4b',
          textColor: '#ffffff',
          paddingTop: '32px',
          paddingBottom: '32px',
          textAlign: 'center'
        },
        responsive: {},
        visibilityRules: { hidden: false },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  }
];

// Initial Seed Navigation Menus
export const INITIAL_NAVIGATION_MENUS: NavigationMenuItem[] = [
  { id: 'm-dash', label: 'Dashboard Operacional', icon: 'LayoutGrid', route: 'dashboard', order: 1, roles: ['TODOS'], hidden: false },
  { id: 'm-mais-ia', label: 'MAIS RH IA', icon: 'Sparkles', route: 'mais-rh-ia', order: 2, roles: ['TODOS'], hidden: false },
  { id: 'm-vagas', label: 'Gestão de Vagas', icon: 'Briefcase', route: 'vagas', order: 3, roles: ['TODOS'], hidden: false },
  { id: 'm-candidatos', label: 'Banco de Talentos', icon: 'Users', route: 'banco-talentos', order: 4, roles: ['TODOS'], hidden: false },
  { id: 'm-kanban', label: 'Kanban R&S', icon: 'Kanban', route: 'processos-seletivos', order: 5, roles: ['TODOS'], hidden: false },
  { id: 'm-entrevistas', label: 'Entrevistas & IA', icon: 'Calendar', route: 'entrevistas', order: 6, roles: ['TODOS'], hidden: false },
  { id: 'm-dp', label: 'Departamento Pessoal', icon: 'Building', route: 'departamento-pessoal', order: 7, roles: ['Administrador', 'RH', 'Gestor'], hidden: false },
  { id: 'm-ponto', label: 'Ponto Eletrônico', icon: 'Clock', route: 'ponto-digital', order: 8, roles: ['TODOS'], hidden: false },
  { id: 'm-folha', label: 'Folha de Pagamento', icon: 'DollarSign', route: 'folha-pagamento', order: 9, roles: ['Administrador', 'RH'], hidden: false },
  { id: 'm-portal-pub', label: 'Portal de Vagas', icon: 'Globe', route: 'site-vagas', order: 10, roles: ['TODOS'], hidden: false },
  { id: 'm-headhunter', label: 'Headhunter / Consultoria', icon: 'Award', route: 'headhunter', order: 11, roles: ['Consultor RH', 'Super Administrador'], hidden: false },
  { id: 'm-master', label: 'Acesso MASTER', icon: 'Crown', route: 'acesso-master', order: 99, roles: ['Super Administrador'], hidden: false, isCritical: true }
];

// Initial Seed Custom Fields
export const INITIAL_CUSTOM_FIELDS: CustomFieldDefinition[] = [
  {
    id: 'cf-uniforme',
    entityType: 'colaborador',
    name: 'tamanho_uniforme',
    label: 'Tamanho do Uniforme (Camiseta/Calçado)',
    fieldType: 'select',
    required: false,
    options: ['P', 'M', 'G', 'GG', 'XGG', 'Outro'],
    order: 1,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cf-centro-custo',
    entityType: 'vaga',
    name: 'centro_custo_especifico',
    label: 'Centro de Custo / Código do Projeto',
    fieldType: 'text',
    required: true,
    placeholder: 'Ex: CC-2026-SP',
    order: 2,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cf-pretensao',
    entityType: 'candidato',
    name: 'pretensao_salarial_detalhada',
    label: 'Pretensão Salarial Mensal (R$)',
    fieldType: 'currency',
    required: true,
    order: 3,
    active: true,
    createdAt: new Date().toISOString()
  }
];

// Initial Seed Templates
export const INITIAL_CLIENT_TEMPLATES: ClientTemplate[] = [
  {
    id: 'tpl-ats-essencial',
    name: 'ATS Essencial & R&S Ágil',
    description: 'Foco exclusivo na atração de talentos, triagem por IA e publicação em portal de vagas.',
    category: 'Recrutamento',
    defaultTheme: {
      primaryColor: '#2563eb',
      secondaryColor: '#3b82f6',
      accentColor: '#10b981',
      fontFamily: 'Plus Jakarta Sans'
    },
    menus: INITIAL_NAVIGATION_MENUS.filter(m => ['dashboard', 'vagas', 'banco-talentos', 'entrevistas', 'site-vagas'].includes(m.route)),
    customFields: INITIAL_CUSTOM_FIELDS,
    pages: INITIAL_SYSTEM_PAGES,
    active: true
  },
  {
    id: 'tpl-rh-completo',
    name: 'RH Corporativo 360° + DP',
    description: 'Pacote completo incluindo Folha, Ponto Eletrônico 671, Férias, eSocial e SST.',
    category: 'Completo',
    defaultTheme: {
      primaryColor: '#0f172a',
      secondaryColor: '#334155',
      accentColor: '#f59e0b',
      fontFamily: 'Plus Jakarta Sans'
    },
    menus: INITIAL_NAVIGATION_MENUS,
    customFields: INITIAL_CUSTOM_FIELDS,
    pages: INITIAL_SYSTEM_PAGES,
    active: true
  }
];

// Memory Stores with LocalStorage syncing
class VisualBuilderStore {
  private pages: PageConfig[] = [];
  private versions: PageVersion[] = [];
  private auditLogs: BuilderAuditLog[] = [];
  private customFields: CustomFieldDefinition[] = [];
  private menus: NavigationMenuItem[] = [];
  private templates: ClientTemplate[] = [];

  // Undo/Redo Stacks per Page
  private undoStack: Map<string, PageConfig[]> = new Map();
  private redoStack: Map<string, PageConfig[]> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const savedPages = localStorage.getItem(STORAGE_KEYS.PAGES);
      this.pages = savedPages ? JSON.parse(savedPages) : INITIAL_SYSTEM_PAGES;

      const savedVersions = localStorage.getItem(STORAGE_KEYS.VERSIONS);
      this.versions = savedVersions ? JSON.parse(savedVersions) : [];

      const savedLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      this.auditLogs = savedLogs ? JSON.parse(savedLogs) : [];

      const savedFields = localStorage.getItem(STORAGE_KEYS.CUSTOM_FIELDS);
      this.customFields = savedFields ? JSON.parse(savedFields) : INITIAL_CUSTOM_FIELDS;

      const savedMenus = localStorage.getItem(STORAGE_KEYS.MENUS);
      this.menus = savedMenus ? JSON.parse(savedMenus) : INITIAL_NAVIGATION_MENUS;

      const savedTemplates = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      this.templates = savedTemplates ? JSON.parse(savedTemplates) : INITIAL_CLIENT_TEMPLATES;
    } catch (e) {
      console.warn('Failed to parse visual builder storage, loading defaults', e);
      this.pages = INITIAL_SYSTEM_PAGES;
      this.versions = [];
      this.auditLogs = [];
      this.customFields = INITIAL_CUSTOM_FIELDS;
      this.menus = INITIAL_NAVIGATION_MENUS;
      this.templates = INITIAL_CLIENT_TEMPLATES;
    }
  }

  private savePages() {
    localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(this.pages));
  }

  private saveVersions() {
    localStorage.setItem(STORAGE_KEYS.VERSIONS, JSON.stringify(this.versions));
  }

  private saveLogs() {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
  }

  private saveCustomFieldsStorage() {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FIELDS, JSON.stringify(this.customFields));
  }

  private saveMenusStorage() {
    localStorage.setItem(STORAGE_KEYS.MENUS, JSON.stringify(this.menus));
  }

  // --- PAGES & COMPONENTS ---
  public getPages(): PageConfig[] {
    return this.pages;
  }

  public getPageById(id: string): PageConfig | undefined {
    return this.pages.find(p => p.id === id);
  }

  public getEffectivePageConfig(pageId: string, companyId?: string): PageConfig {
    const page = this.getPageById(pageId);
    if (!page) {
      return INITIAL_SYSTEM_PAGES[0];
    }

    if (!companyId || companyId === 'GLOBAL') {
      return page;
    }

    // Check if there is a company-specific version override
    const companyOverride = this.pages.find(p => p.id === `${pageId}_${companyId}` && p.companyId === companyId);
    if (companyOverride) {
      return companyOverride;
    }

    return page;
  }

  public updatePageConfig(pageConfig: PageConfig, authorName: string = 'MASTER Admin'): PageConfig {
    const existing = this.getPageById(pageConfig.id);
    if (existing) {
      // Push state to undo stack
      const stack = this.undoStack.get(pageConfig.id) || [];
      stack.push(JSON.parse(JSON.stringify(existing)));
      if (stack.length > 20) stack.shift(); // Limit to 20 history states
      this.undoStack.set(pageConfig.id, stack);
      this.redoStack.set(pageConfig.id, []);
    }

    const updated: PageConfig = {
      ...pageConfig,
      updatedAt: new Date().toISOString(),
      updatedBy: authorName,
      status: 'draft'
    };

    const idx = this.pages.findIndex(p => p.id === updated.id);
    if (idx >= 0) {
      this.pages[idx] = updated;
    } else {
      this.pages.push(updated);
    }

    this.savePages();
    return updated;
  }

  public canUndo(pageId: string): boolean {
    const stack = this.undoStack.get(pageId);
    return !!stack && stack.length > 0;
  }

  public canRedo(pageId: string): boolean {
    const stack = this.redoStack.get(pageId);
    return !!stack && stack.length > 0;
  }

  public undo(pageId: string): PageConfig | null {
    const stack = this.undoStack.get(pageId);
    if (!stack || stack.length === 0) return null;

    const current = this.getPageById(pageId);
    if (current) {
      const redos = this.redoStack.get(pageId) || [];
      redos.push(JSON.parse(JSON.stringify(current)));
      this.redoStack.set(pageId, redos);
    }

    const previousState = stack.pop()!;
    const idx = this.pages.findIndex(p => p.id === pageId);
    if (idx >= 0) {
      this.pages[idx] = previousState;
      this.savePages();
    }
    return previousState;
  }

  public redo(pageId: string): PageConfig | null {
    const redos = this.redoStack.get(pageId);
    if (!redos || redos.length === 0) return null;

    const current = this.getPageById(pageId);
    if (current) {
      const undos = this.undoStack.get(pageId) || [];
      undos.push(JSON.parse(JSON.stringify(current)));
      this.undoStack.set(pageId, undos);
    }

    const nextState = redos.pop()!;
    const idx = this.pages.findIndex(p => p.id === pageId);
    if (idx >= 0) {
      this.pages[idx] = nextState;
      this.savePages();
    }
    return nextState;
  }

  // --- PUBLICATION & VERSIONING ---
  public publishDraft(
    pageId: string, 
    changeSummary: string, 
    authorName: string, 
    scope: BuilderScope = 'global', 
    companyId?: string
  ): { page: PageConfig; version: PageVersion } {
    const page = this.getPageById(pageId);
    if (!page) {
      throw new Error(`Página ${pageId} não encontrada para publicação.`);
    }

    const nextVersionNum = (page.version || 1) + 1;
    const now = new Date().toISOString();

    const publishedPage: PageConfig = {
      ...page,
      version: nextVersionNum,
      status: 'published',
      updatedAt: now,
      updatedBy: authorName,
      scope,
      companyId
    };

    const newVersion: PageVersion = {
      versionId: `ver-${Date.now()}`,
      pageId: page.id,
      versionNumber: nextVersionNum,
      scope,
      companyId,
      configuration: JSON.parse(JSON.stringify(publishedPage)),
      changeSummary: changeSummary || 'Publicação de alterações no Construtor Visual',
      publishedAt: now,
      publishedBy: authorName,
      status: 'published'
    };

    // Mark previous versions as superseded
    this.versions = this.versions.map(v => v.pageId === pageId ? { ...v, status: 'superseded' as const } : v);
    this.versions.unshift(newVersion);

    // Update active page
    const idx = this.pages.findIndex(p => p.id === pageId);
    if (idx >= 0) {
      this.pages[idx] = publishedPage;
    }

    this.savePages();
    this.saveVersions();

    // Audit Log
    this.addAuditLog({
      scope,
      companyId,
      userId: 'master-user',
      userName: authorName,
      action: 'PUBLICAR_PAGINA',
      pageId,
      description: `Publicada versão v${nextVersionNum} da página ${page.name}. Resumo: ${changeSummary}`
    });

    return { page: publishedPage, version: newVersion };
  }

  public rollbackToVersion(versionId: string, authorName: string): PageConfig {
    const version = this.versions.find(v => v.versionId === versionId);
    if (!version) {
      throw new Error(`Versão ${versionId} não encontrada para restauração.`);
    }

    const pageId = version.pageId;
    const restoredPageConfig: PageConfig = {
      ...version.configuration,
      version: (version.configuration.version || 1) + 1,
      status: 'published',
      updatedAt: new Date().toISOString(),
      updatedBy: authorName
    };

    const idx = this.pages.findIndex(p => p.id === pageId);
    if (idx >= 0) {
      this.pages[idx] = restoredPageConfig;
    } else {
      this.pages.push(restoredPageConfig);
    }

    const newRestoreVersion: PageVersion = {
      versionId: `ver-restored-${Date.now()}`,
      pageId,
      versionNumber: restoredPageConfig.version,
      scope: version.scope,
      companyId: version.companyId,
      configuration: restoredPageConfig,
      changeSummary: `Restauração para versão v${version.versionNumber} (${version.changeSummary})`,
      publishedAt: new Date().toISOString(),
      publishedBy: authorName,
      status: 'published'
    };

    this.versions.unshift(newRestoreVersion);

    this.savePages();
    this.saveVersions();

    this.addAuditLog({
      scope: version.scope,
      companyId: version.companyId,
      userId: 'master-user',
      userName: authorName,
      action: 'RESTAURAR_VERSAO',
      pageId,
      description: `Restaurada versão v${version.versionNumber} para a página ${restoredPageConfig.name}`
    });

    return restoredPageConfig;
  }

  public getVersionsForPage(pageId: string): PageVersion[] {
    return this.versions.filter(v => v.pageId === pageId);
  }

  // --- CUSTOM FIELDS ---
  public getCustomFields(): CustomFieldDefinition[] {
    return this.customFields;
  }

  public saveCustomField(field: CustomFieldDefinition, authorName: string = 'MASTER Admin'): CustomFieldDefinition[] {
    const existingIdx = this.customFields.findIndex(f => f.id === field.id);
    if (existingIdx >= 0) {
      this.customFields[existingIdx] = field;
    } else {
      this.customFields.push(field);
    }
    this.saveCustomFieldsStorage();

    this.addAuditLog({
      scope: field.companyId ? 'company' : 'global',
      companyId: field.companyId,
      userId: 'master-user',
      userName: authorName,
      action: 'SALVAR_CAMPO_PERSONALIZADO',
      description: `Campo personalizado ${field.label} (${field.entityType}) foi salvo.`
    });

    return this.customFields;
  }

  public deleteCustomField(id: string): CustomFieldDefinition[] {
    this.customFields = this.customFields.filter(f => f.id !== id);
    this.saveCustomFieldsStorage();
    return this.customFields;
  }

  // --- MENUS ---
  public getNavigationMenus(): NavigationMenuItem[] {
    return this.menus;
  }

  public saveNavigationMenus(menus: NavigationMenuItem[], authorName: string = 'MASTER Admin'): NavigationMenuItem[] {
    // Safety check: ensure critical menus exist
    const hasMasterMenu = menus.some(m => m.route === 'acesso-master' || m.isCritical);
    if (!hasMasterMenu) {
      throw new Error('Não é permitido remover ou ocultar o Menu Crítico MASTER.');
    }

    this.menus = menus;
    this.saveMenusStorage();

    this.addAuditLog({
      scope: 'global',
      userId: 'master-user',
      userName: authorName,
      action: 'ATUALIZAR_MENUS',
      description: 'Reorganização da estrutura global de navegação e menus.'
    });

    return this.menus;
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(): BuilderAuditLog[] {
    return this.auditLogs;
  }

  public addAuditLog(logData: Omit<BuilderAuditLog, 'id' | 'createdAt'>): BuilderAuditLog {
    const newLog: BuilderAuditLog = {
      ...logData,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString()
    };
    this.auditLogs.unshift(newLog);
    if (this.auditLogs.length > 500) this.auditLogs.pop(); // Limit 500 entries
    this.saveLogs();
    return newLog;
  }

  // --- TEMPLATES ---
  public getTemplates(): ClientTemplate[] {
    return this.templates;
  }

  public applyTemplateToCompany(templateId: string, companyId: string, companyName: string, authorName: string) {
    const tpl = this.templates.find(t => t.id === templateId);
    if (!tpl) throw new Error('Modelo não encontrado.');

    this.addAuditLog({
      scope: 'company',
      companyId,
      userId: 'master-user',
      userName: authorName,
      action: 'APLICAR_MODELO',
      description: `Modelo "${tpl.name}" aplicado à empresa ${companyName}.`
    });

    return true;
  }
}

export const visualBuilderStore = new VisualBuilderStore();
