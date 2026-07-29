import React, { useState } from 'react';
import { MasterVisualBuilderView } from '../../visual-builder/components/MasterVisualBuilderView';
import { 
  Crown, 
  Building2, 
  Users, 
  CreditCard, 
  Sliders, 
  ShieldCheck, 
  Megaphone, 
  Database, 
  PlusCircle, 
  Search, 
  Filter, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Edit3, 
  Lock, 
  Unlock, 
  Palette, 
  BarChart3, 
  HardDrive, 
  RefreshCw, 
  Settings,
  Sparkles,
  FileText,
  Activity,
  UserCheck,
  Bot,
  Handshake,
  LayoutGrid,
  ShieldAlert,
  SlidersHorizontal,
  Check,
  X,
  Plus,
  DollarSign,
  TrendingDown,
  Clock,
  Layers,
  Code,
  Key,
  Download,
  Upload,
  Cpu,
  History,
  Terminal,
  HelpCircle
} from 'lucide-react';
import { 
  ClientTenant, 
  SystemAnnouncement, 
  BackupRecord, 
  MasterPlanPreset, 
  TenantModulePermissions,
  SaaSPlan,
  PlatformModule,
  PlatformVisualConfig,
  AIPromptTemplate,
  AIUsageLog,
  PartnerBenefit,
  PlatformAdminUser,
  AuditSecurityLog
} from '../types/master';
import { 
  MOCK_TENANTS, 
  MOCK_ANNOUNCEMENTS, 
  MOCK_BACKUPS,
  MOCK_SAAS_PLANS,
  MOCK_PLATFORM_MODULES,
  MOCK_VISUAL_CONFIG,
  MOCK_AI_PROMPTS,
  MOCK_AI_LOGS,
  MOCK_PARTNERS,
  MOCK_PLATFORM_ADMINS,
  MOCK_SECURITY_LOGS
} from '../data/mockMasterData';
import { MasterTenantModal } from './MasterTenantModal';
import { MasterAnnouncementsModal } from './MasterAnnouncementsModal';
import { MasterBackupModal } from './MasterBackupModal';
import { MasterEditPlanModal } from './MasterEditPlanModal';
import { MasterCreateModuleModal } from './MasterCreateModuleModal';
import { getTenants, saveTenant, toggleTenantStatus, deleteTenant } from '../masterTenantsStore';
import { getPlatformModules, savePlatformModule, savePlatformModulesToStorage, togglePlatformModuleStatus, getModuleAuditLogs, syncPlatformModulesFromFirestore } from '../masterModulesStore';

export type MasterNavigationSection = 
  | 'dashboard'
  | 'empresas'
  | 'planos'
  | 'modulos'
  | 'construtor'
  | 'ia'
  | 'parceiros'
  | 'usuarios'
  | 'relatorios'
  | 'seguranca';

export const MasterAdminView: React.FC = () => {
  // Navigation
  const [activeSection, setActiveSection] = useState<MasterNavigationSection>('dashboard');

  // Core Data States
  const [tenants, setTenants] = useState<ClientTenant[]>(() => getTenants());
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>(MOCK_ANNOUNCEMENTS);
  const [backups, setBackups] = useState<BackupRecord[]>(MOCK_BACKUPS);
  const [plans, setPlans] = useState<SaaSPlan[]>(MOCK_SAAS_PLANS);
  const [modules, setModules] = useState<PlatformModule[]>(() => getPlatformModules());
  const [visualConfig, setVisualConfig] = useState<PlatformVisualConfig>(MOCK_VISUAL_CONFIG);
  const [aiPrompts, setAiPrompts] = useState<AIPromptTemplate[]>(MOCK_AI_PROMPTS);
  const [aiLogs] = useState<AIUsageLog[]>(MOCK_AI_LOGS);
  const [partners, setPartners] = useState<PartnerBenefit[]>(MOCK_PARTNERS);
  const [platformAdmins, setPlatformAdmins] = useState<PlatformAdminUser[]>(MOCK_PLATFORM_ADMINS);
  const [securityLogs] = useState<AuditSecurityLog[]>(MOCK_SECURITY_LOGS);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [planFilter, setPlanFilter] = useState<string>('TODOS');

  // Module specific filters
  const [moduleSearchQuery, setModuleSearchQuery] = useState('');
  const [moduleCategoryFilter, setModuleCategoryFilter] = useState<string>('TODOS');
  const [moduleStatusFilter, setModuleStatusFilter] = useState<string>('TODOS');
  const [viewingModuleDetails, setViewingModuleDetails] = useState<PlatformModule | null>(null);
  const [showModuleAuditLogs, setShowModuleAuditLogs] = useState(false);

  // Modals
  const [selectedTenantForEdit, setSelectedTenantForEdit] = useState<ClientTenant | null>(null);
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState<SaaSPlan | null>(null);
  const [selectedModuleForEdit, setSelectedModuleForEdit] = useState<PlatformModule | null>(null);
  const [showCreateTenantModal, setShowCreateTenantModal] = useState(false);
  const [showCreateModuleModal, setShowCreateModuleModal] = useState(false);
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  // Sub-tabs state per section
  const [empresasSubTab, setEmpresasSubTab] = useState<'cadastradas' | 'usuarios' | 'funcionarios' | 'contratos'>('cadastradas');
  const [planosSubTab, setPlanosSubTab] = useState<'planos' | 'modulos' | 'regras' | 'assinaturas'>('planos');
  const [iaSubTab, setIaSubTab] = useState<'regras' | 'prompts' | 'consumo' | 'historico'>('regras');
  const [parceirosSubTab, setParceirosSubTab] = useState<'parceiros' | 'convenios' | 'comissoes'>('parceiros');
  const [usuariosSubTab, setUsuariosSubTab] = useState<'admins' | 'suporte' | 'niveis'>('admins');
  const [relatoriosSubTab, setRelatoriosSubTab] = useState<'receita' | 'uso' | 'crescimento' | 'auditoria'>('receita');
  const [segurancaSubTab, setSegurancaSubTab] = useState<'auditoria' | 'logs' | 'backups' | 'protecao'>('auditoria');

  // AI Rule config state
  const [aiModel, setAiModel] = useState<'gemini-2.5-flash' | 'gemini-2.5-pro'>('gemini-2.5-flash');
  const [maxTokens, setMaxTokens] = useState<number>(4096);

  // Handlers
  const handleSavePlan = (updatedPlan: SaaSPlan) => {
    setPlans(plans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
    setSelectedPlanForEdit(null);
  };

  const handleSaveModule = (moduleData: PlatformModule) => {
    const updated = savePlatformModule(moduleData);
    setModules(updated);
    setShowCreateModuleModal(false);
    setSelectedModuleForEdit(null);
  };

  const handleSaveTenant = (tenantData: Partial<ClientTenant>) => {
    const updated = saveTenant(tenantData);
    setTenants(updated);
    setSelectedTenantForEdit(null);
    setShowCreateTenantModal(false);
  };

  const handleToggleStatus = (tenantId: string, currentStatus: string) => {
    const updated = toggleTenantStatus(tenantId, currentStatus);
    setTenants(updated);
  };

  const handleDeleteTenant = (tenantId: string) => {
    if (confirm('Tem certeza que deseja excluir esta empresa do sistema? Essa ação é irreversível.')) {
      const updated = deleteTenant(tenantId);
      setTenants(updated);
    }
  };

  const handleToggleModuleGlobal = (moduleId: string) => {
    const updated = togglePlatformModuleStatus(moduleId, 'Master Admin');
    setModules(updated);
  };

  const handleSyncModulesFromCode = async () => {
    const synced = await syncPlatformModulesFromFirestore();
    setModules(synced);
  };

  const handleTogglePrompt = (promptId: string) => {
    setAiPrompts(aiPrompts.map(p => p.id === promptId ? { ...p, active: !p.active } : p));
  };

  const handleCreateAnnouncement = (announcement: SystemAnnouncement) => {
    setAnnouncements([announcement, ...announcements]);
    setShowAnnouncementsModal(false);
  };

  const handleCreateBackup = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;

    const newBak: BackupRecord = {
      id: `bak-${Date.now()}`,
      tenantId: tenant.id,
      tenantName: tenant.companyName,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      fileSizeBytes: Math.floor(100000000 + Math.random() * 400000000),
      checksum: Math.random().toString(36).substring(2, 15),
      status: 'Concluído'
    };

    setBackups([newBak, ...backups]);
  };

  // Metrics
  const totalMRR = tenants.reduce((acc, t) => acc + (t.status === 'Ativo' ? t.contract.monthlyFee : 0), 0);
  const totalARR = totalMRR * 12;
  const activeTenantsCount = tenants.filter(t => t.status === 'Ativo').length;
  const totalUsersAcrossSystem = tenants.reduce((acc, t) => acc + t.metrics.activeUsersCount, 0);
  const totalEmployeesManaged = 1850;

  // Filtered tenants
  const filteredTenants = tenants.filter(t => {
    const matchesQuery = t.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.cnpj.includes(searchQuery) ||
                         t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'TODOS' || t.status === statusFilter;
    const matchesPlan = planFilter === 'TODOS' || t.contract.planName === planFilter;
    return matchesQuery && matchesStatus && matchesPlan;
  });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Master', icon: LayoutGrid },
    { id: 'empresas', label: 'Empresas cadastradas', icon: Building2 },
    { id: 'usuarios', label: 'Usuários', icon: Users },
    { id: 'planos', label: 'Planos', icon: CreditCard },
    { id: 'modulos', label: 'Módulos', icon: Sliders },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { id: 'seguranca', label: 'Configurações', icon: Settings },
    { id: 'ia', label: 'Inteligência Artificial', icon: Bot },
    { id: 'construtor', label: 'Construtor Visual', icon: Palette },
    { id: 'parceiros', label: 'Parceiros & Vantagens', icon: Handshake },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans -m-4 sm:-m-6 lg:-m-8">
      
      {/* MASTER PLATFORM PORTAL TOP BAR */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0 border border-amber-300">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white tracking-tight">PAINEL EXCLUSIVO MASTER</h1>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                Plataforma Multi-Tenant
              </span>
            </div>
            <p className="text-xs text-slate-400">Controle irrestrito do SaaS, faturamento, clientes e infraestrutura cloud</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAnnouncementsModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Megaphone className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Disparar Comunicado</span>
          </button>

          <button
            onClick={() => setShowBackupModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Backups</span>
          </button>

          <button
            onClick={() => setShowCreateTenantModal(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer border border-amber-300"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nova Empresa</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER WITH DEDICATED MASTER SIDEBAR */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        
        {/* DEDICATED MASTER NAVIGATION SIDEBAR */}
        <aside className="w-full md:w-64 bg-slate-900/90 border-r border-slate-800 p-4 space-y-1 shrink-0 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
            Navegação da Plataforma
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as MasterNavigationSection)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          <div className="pt-6 mt-6 border-t border-slate-800 px-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1">
              <p className="text-amber-400 font-bold flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" /> Super Admin Total
              </p>
              <p className="text-slate-400 text-[10px]">Todas as empresas estão conectadas à sua instância Master.</p>
            </div>
          </div>
        </aside>

        {/* MAIN VIEWPORT */}
        <main className="flex-1 p-6 overflow-y-auto bg-slate-950 space-y-6">

          {/* ========================================================================= */}
          {/* 1. 🏠 DASHBOARD GERAL */}
          {/* ========================================================================= */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5 text-amber-400" /> Visão Consolidada da Plataforma
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Métricas globais do SaaS MAIS RH em tempo real</p>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-amber-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  SaaS Operacional • Cloud Run Google Studio
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                    <span>MRR Total Ativo</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-black text-white">R$ {totalMRR.toLocaleString('pt-BR')}</p>
                  <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +14.2% em relação ao mês anterior
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                    <span>ARR Projeção Anual</span>
                    <BarChart3 className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-2xl font-black text-amber-300">R$ {totalARR.toLocaleString('pt-BR')}</p>
                  <p className="text-[11px] text-slate-400 font-medium">Contratos ativos multiplicados por 12</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                    <span>Empresas Clientes</span>
                    <Building2 className="w-4 h-4 text-indigo-400" />
                  </div>
                  <p className="text-2xl font-black text-white">{activeTenantsCount} <span className="text-xs text-slate-500 font-normal">/ {tenants.length} total</span></p>
                  <p className="text-[11px] text-indigo-300 font-semibold">{tenants.filter(t => t.status === 'Aguardando Pagamento').length} pendentes de pagamento</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                    <span>Usuários e Colaboradores</span>
                    <Users className="w-4 h-4 text-cyan-400" />
                  </div>
                  <p className="text-2xl font-black text-white">{totalUsersAcrossSystem} <span className="text-xs text-slate-500 font-normal">usuários</span></p>
                  <p className="text-[11px] text-cyan-300 font-semibold">{totalEmployeesManaged} colaboradores no DP/Ponto</p>
                </div>
              </div>

              {/* Module Utilization & System Health */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" /> Adesão aos Módulos da Plataforma
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Recrutamento & Seleção', pct: 100, count: '14 de 14 clientes', color: 'bg-indigo-500' },
                      { name: 'Gestão de Benefícios', pct: 85, count: '12 de 14 clientes', color: 'bg-emerald-500' },
                      { name: 'Departamento Pessoal', pct: 80, count: '11 de 14 clientes', color: 'bg-cyan-500' },
                      { name: 'Ponto Eletrônico', pct: 71, count: '10 de 14 clientes', color: 'bg-amber-500' },
                      { name: 'Folha de Pagamento', pct: 57, count: '8 de 14 clientes', color: 'bg-rose-500' },
                    ].map((m) => (
                      <div key={m.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-200">{m.name}</span>
                          <span className="text-slate-400 text-[11px] font-semibold">{m.count} ({m.pct}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div className={`h-full ${m.color} rounded-full`} style={{ width: `${m.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" /> Alertas & Status
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                      <span className="font-bold text-amber-300 block">Renovação de Contrato Próxima</span>
                      <p className="text-slate-300 text-[11px]">Grupo Alpha Logística vence em 01/08/2026.</p>
                    </div>

                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                      <span className="font-bold text-rose-300 block">Fatura Pendente de Liquidação</span>
                      <p className="text-slate-300 text-[11px]">OmniTech Softwares (R$ 1.290,00).</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="font-bold text-emerald-400 block">Inteligência Artificial OK</span>
                      <p className="text-slate-400 text-[11px]">Consumo diário: 142k tokens. Taxa de erro &lt; 0.01%.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. 🏢 EMPRESAS CLIENTES */}
          {/* ========================================================================= */}
          {activeSection === 'empresas' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-400" /> Empresas Clientes (Tenants)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Gestão de empresas contratantes, usuários vinculados, funcionários e assinaturas</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCreateTenantModal(true)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Cadastrar Nova Empresa
                  </button>
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                {[
                  { id: 'cadastradas', label: `Empresas Cadastradas (${tenants.length})` },
                  { id: 'usuarios', label: 'Usuários por Empresa' },
                  { id: 'funcionarios', label: 'Funcionários Vinculados' },
                  { id: 'contratos', label: 'Status de Assinatura & Contrato' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setEmpresasSubTab(st.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      empresasSubTab === st.id
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Sub-Tab 1: Empresas Cadastradas */}
              {empresasSubTab === 'cadastradas' && (
                <div className="space-y-4">
                  {/* Search and Filters */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-80">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por empresa, CNPJ ou gestor..."
                        className="w-full text-xs pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none"
                      >
                        <option value="TODOS">Todos os Status</option>
                        <option value="Ativo">Apenas Ativos</option>
                        <option value="Suspenso">Apenas Suspensos</option>
                        <option value="Aguardando Pagamento">Aguardando Pagamento</option>
                      </select>

                      <select
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value)}
                        className="text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none"
                      >
                        <option value="TODOS">Todos os Planos</option>
                        <option value="Básico">Plano Básico</option>
                        <option value="Intermediário">Plano Intermediário</option>
                        <option value="Completo / Enterprise">Enterprise</option>
                      </select>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="p-4">Empresa / Cliente</th>
                            <th className="p-4">Plano & MRR</th>
                            <th className="p-4">Status Licença</th>
                            <th className="p-4">Usuários</th>
                            <th className="p-4">Módulos</th>
                            <th className="p-4">Vencimento</th>
                            <th className="p-4 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-xs">
                          {filteredTenants.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-800/50 transition-all">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-xs shadow-xs"
                                    style={{ backgroundColor: t.branding.primaryColor || '#4F46E5' }}
                                  >
                                    {t.companyName.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <span className="font-bold text-white block">{t.companyName}</span>
                                    <span className="text-[10px] text-slate-400 block">CNPJ: {t.cnpj} • Gestor: {t.ownerName}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="p-4">
                                <span className="font-bold text-amber-300 block">R$ {t.contract.monthlyFee.toLocaleString('pt-BR')} /mês</span>
                                <span className="text-[10px] text-slate-400">{t.contract.planName}</span>
                              </td>

                              <td className="p-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  t.status === 'Ativo' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                  t.status === 'Suspenso' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                                  'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}>
                                  {t.status}
                                </span>
                              </td>

                              <td className="p-4 font-semibold text-slate-200">
                                {t.metrics.activeUsersCount} / {t.maxUsers}
                              </td>

                              <td className="p-4 text-slate-300 font-bold">
                                {Object.values(t.modules).filter(Boolean).length} / 10
                              </td>

                              <td className="p-4 text-slate-300 font-semibold">
                                {t.contract.expirationDate}
                              </td>

                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => setSelectedTenantForEdit(t)}
                                    className="p-1.5 text-slate-300 hover:text-amber-300 hover:bg-slate-800 rounded-lg cursor-pointer"
                                    title="Editar Empresa & Módulos"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleToggleStatus(t.id, t.status)}
                                    className={`p-1.5 rounded-lg cursor-pointer ${
                                      t.status === 'Ativo' ? 'text-rose-400 hover:bg-rose-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'
                                    }`}
                                    title={t.status === 'Ativo' ? 'Suspender Acesso' : 'Reativar Acesso'}
                                  >
                                    {t.status === 'Ativo' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 2: Usuários por Empresa */}
              {empresasSubTab === 'usuarios' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tenants.map((t) => (
                    <div key={t.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{t.companyName}</span>
                        <span className="text-xs text-amber-300 font-extrabold">{t.metrics.activeUsersCount} de {t.maxUsers} Usuários</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-300">
                          <span>Administrador Principal:</span>
                          <span className="font-bold text-white">{t.ownerName}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>E-mail do Gestor:</span>
                          <span className="text-amber-300">{t.ownerEmail}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Último Acesso Registrado:</span>
                          <span>{t.metrics.lastLoginAt}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sub-Tab 3: Funcionários Vinculados */}
              {empresasSubTab === 'funcionarios' && (
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white">Estatísticas de Funcionários por Empresa (DP / Ponto / Benefícios)</h3>
                  <div className="space-y-3">
                    {tenants.map((t) => {
                      const empEstimate = t.id === 't-001' ? 840 : t.id === 't-002' ? 420 : t.id === 't-003' ? 180 : 90;
                      return (
                        <div key={t.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-white block">{t.companyName}</span>
                            <span className="text-slate-400 text-[10px]">Contrato: {t.contract.planName}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-amber-300 text-sm block">{empEstimate} Colaboradores</span>
                            <span className="text-[10px] text-emerald-400 font-semibold">Base Ativa no Sistema</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-Tab 4: Status da Assinatura e Contrato */}
              {empresasSubTab === 'contratos' && (
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white">Contratos e Vencimentos SaaS</h3>
                  <div className="space-y-3">
                    {tenants.map((t) => (
                      <div key={t.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <span className="font-bold text-white text-sm block">{t.companyName}</span>
                          <span className="text-slate-400 text-[11px]">Número: {t.contract.contractNumber} • {t.contract.billingCycle}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-amber-300 font-black text-sm block">R$ {t.contract.monthlyFee.toLocaleString('pt-BR')} /mês</span>
                            <span className="text-slate-400 text-[10px]">Vence em {t.contract.expirationDate}</span>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            t.status === 'Ativo' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. 💳 PLANOS & SAAS */}
          {/* ========================================================================= */}
          {activeSection === 'planos' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" /> Planos & Gestão SaaS
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Criar planos comerciais, regras de cobrança, precificação e limites</p>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                {[
                  { id: 'planos', label: 'Planos Comerciais' },
                  { id: 'modulos', label: 'Módulos por Plano' },
                  { id: 'regras', label: 'Valores e Regras' },
                  { id: 'assinaturas', label: 'Gerenciar Assinaturas' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setPlanosSubTab(st.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      planosSubTab === st.id ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Sub-tab 1: Planos Comerciais */}
              {planosSubTab === 'planos' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((p) => (
                    <div key={p.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-black text-amber-300">{p.name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            {p.subscribersCount} Clientes
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 min-h-[36px]">{p.description}</p>
                        <div className="pt-2 border-t border-slate-800">
                          <p className="text-3xl font-black text-white">
                            R$ {p.monthlyPrice.toLocaleString('pt-BR')} <span className="text-xs text-slate-400 font-normal">/mês</span>
                          </p>
                          <p className="text-[11px] text-emerald-400 font-semibold mt-1">
                            {p.annualDiscountPercent}% de desconto na contratação anual
                          </p>
                        </div>

                        <div className="space-y-2 pt-2 text-xs">
                          <div className="flex items-center justify-between text-slate-300">
                            <span>Limite de Usuários:</span>
                            <span className="font-bold text-white">{p.maxUsers} contas</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-300">
                            <span>Limite de Vagas Ativas:</span>
                            <span className="font-bold text-white">{p.maxActiveJobs} vagas</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-300">
                            <span>Limite de Colaboradores:</span>
                            <span className="font-bold text-white">{p.maxEmployees} no DP</span>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => setSelectedPlanForEdit(p)}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 hover:border-amber-500/50 text-slate-200 hover:text-amber-300 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer transition-all"
                      >
                        Editar Parâmetros do Plano
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Sub-tab 2: Módulos por Plano */}
              {planosSubTab === 'modulos' && (
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white">Matriz de Recursos & Módulos Habilitados por Plano</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                          <th className="p-3">Módulo da Plataforma</th>
                          <th className="p-3 text-center">Básico</th>
                          <th className="p-3 text-center">Intermediário</th>
                          <th className="p-3 text-center">Enterprise</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {modules.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-800/50">
                            <td className="p-3 font-bold text-slate-200">{m.name}</td>
                            <td className="p-3 text-center">{m.isCore ? <Check className="w-4 h-4 text-emerald-400 inline" /> : <X className="w-4 h-4 text-slate-600 inline" />}</td>
                            <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                            <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sub-tab 3: Valores e Regras */}
              {planosSubTab === 'regras' && (
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
                  <h3 className="text-sm font-bold text-white">Regras Financeiras de Licenciamento Adicional</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <span className="font-bold text-amber-300">Licença de Usuário Adicional:</span>
                      <p className="text-slate-300">R$ 49,00 / usuário / mês excedente ao pacote do plano.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <span className="font-bold text-amber-300">Pacote de Vagas em Lote:</span>
                      <p className="text-slate-300">R$ 190,00 por lote de +10 vagas ativas simultâneas.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 4: Assinaturas */}
              {planosSubTab === 'assinaturas' && (
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                  <h3 className="text-sm font-bold text-white">Histórico de Cobrança e Faturamento SaaS</h3>
                  {tenants.map(t => (
                    <div key={t.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-white block">{t.companyName}</span>
                        <span className="text-slate-400 text-[10px]">Método: {t.contract.paymentMethod}</span>
                      </div>
                      <span className="font-black text-amber-300">R$ {t.contract.monthlyFee.toLocaleString('pt-BR')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. 🧩 GERENCIADOR DE MÓDULOS */}
          {/* ========================================================================= */}
          {activeSection === 'modulos' && (
            <div className="space-y-6">
              {/* Header Title & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      Auditoria & Mapeamento Automático
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Sync Ativo
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2 mt-1">
                    <Sliders className="w-5 h-5 text-amber-400" /> Gerenciador de Módulos da Plataforma (MASTER)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Todos os módulos funcionais implementados no código fonte registrados e auditados dinamicamente.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSyncModulesFromCode}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                    title="Varredura e sincronização de módulos do Firestore"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Sincronizar Módulos
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedModuleForEdit(null);
                      setShowCreateModuleModal(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md hover:shadow-amber-500/20"
                  >
                    <Plus className="w-4 h-4" /> Assistente Novo Módulo
                  </button>
                </div>
              </div>

              {/* KPI Indicator Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Módulos</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-white">{modules.length}</span>
                    <Layers className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-[10px] text-slate-500 block">Detectados no sistema</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Módulos Ativos</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-emerald-400">{modules.filter(m => m.status === 'Ativo').length}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-[10px] text-emerald-500/80 block">Disponíveis em produção</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Módulos CORE</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-amber-300">{modules.filter(m => m.isCore).length}</span>
                    <Crown className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-[10px] text-amber-500/80 block">Inclusos em todos os planos</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Módulos BETA</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-purple-400">{modules.filter(m => m.isBeta || m.status === 'Beta').length}</span>
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-[10px] text-purple-400/80 block">IA e novas features</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Headhunter & R&S</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-sky-400">
                      {modules.filter(m => ['Recrutamento', 'Headhunter', 'IA', 'Portal'].includes(m.category)).length}
                    </span>
                    <Crown className="w-4 h-4 text-sky-400" />
                  </div>
                  <span className="text-[10px] text-sky-400/80 block">Recrutamento completo</span>
                </div>
              </div>

              {/* Search Bar & Filters */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    value={moduleSearchQuery}
                    onChange={(e) => setModuleSearchQuery(e.target.value)}
                    placeholder="Buscar por módulo, chave, rota ou descrição..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 font-medium"
                  />
                  {moduleSearchQuery && (
                    <button 
                      onClick={() => setModuleSearchQuery('')}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
                    <Filter className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] font-bold">Categoria:</span>
                    <select
                      value={moduleCategoryFilter}
                      onChange={(e) => setModuleCategoryFilter(e.target.value)}
                      className="bg-transparent text-white font-semibold outline-none cursor-pointer text-xs"
                    >
                      <option value="TODOS" className="bg-slate-900">Todas ({modules.length})</option>
                      <option value="Recrutamento" className="bg-slate-900">Recrutamento</option>
                      <option value="Headhunter" className="bg-slate-900">Headhunter</option>
                      <option value="Departamento Pessoal" className="bg-slate-900">Departamento Pessoal</option>
                      <option value="Financeiro" className="bg-slate-900">Financeiro</option>
                      <option value="Portal" className="bg-slate-900">Portal</option>
                      <option value="IA" className="bg-slate-900">IA</option>
                      <option value="Relatórios" className="bg-slate-900">Relatórios</option>
                      <option value="Ferramentas" className="bg-slate-900">Ferramentas</option>
                      <option value="Integrações" className="bg-slate-900">Integrações</option>
                      <option value="Segurança" className="bg-slate-900">Segurança</option>
                      <option value="Benefícios" className="bg-slate-900">Benefícios</option>
                      <option value="Ponto" className="bg-slate-900">Ponto</option>
                      <option value="Folha" className="bg-slate-900">Folha</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
                    <span className="text-[11px] font-bold">Status:</span>
                    <select
                      value={moduleStatusFilter}
                      onChange={(e) => setModuleStatusFilter(e.target.value)}
                      className="bg-transparent text-white font-semibold outline-none cursor-pointer text-xs"
                    >
                      <option value="TODOS" className="bg-slate-900">Todos os Status</option>
                      <option value="Ativo" className="bg-slate-900">Ativo</option>
                      <option value="Beta" className="bg-slate-900">Beta</option>
                      <option value="Desativado" className="bg-slate-900">Desativado</option>
                      <option value="Inativo" className="bg-slate-900">Inativo</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setShowModuleAuditLogs(!showModuleAuditLogs)}
                    className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      showModuleAuditLogs 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500' 
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Audit Log</span>
                  </button>
                </div>
              </div>

              {/* Audit Log Drawer if toggled */}
              {showModuleAuditLogs && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Histórico Auditado de Modificações nos Módulos
                      </h4>
                    </div>
                    <button 
                      onClick={() => setShowModuleAuditLogs(false)} 
                      className="text-slate-500 hover:text-white text-xs"
                    >
                      Fechar
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
                    {getModuleAuditLogs().map((log) => (
                      <div key={log.id} className="p-2.5 bg-slate-900/80 border border-slate-800/80 rounded-xl flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-amber-400 font-bold">[{log.action}]</span>
                            <span className="font-semibold text-slate-200">{log.details}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 block">Por {log.changedBy} ({log.ipAddress || 'Internal'})</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">{log.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grid of Platform Modules */}
              {(() => {
                const filtered = modules.filter(m => {
                  const matchesSearch = !moduleSearchQuery || 
                    m.name.toLowerCase().includes(moduleSearchQuery.toLowerCase()) ||
                    m.key.toLowerCase().includes(moduleSearchQuery.toLowerCase()) ||
                    m.description.toLowerCase().includes(moduleSearchQuery.toLowerCase()) ||
                    (m.slug && m.slug.toLowerCase().includes(moduleSearchQuery.toLowerCase()));

                  const matchesCategory = moduleCategoryFilter === 'TODOS' || m.category === moduleCategoryFilter;
                  const matchesStatus = moduleStatusFilter === 'TODOS' || m.status === moduleStatusFilter;

                  return matchesSearch && matchesCategory && matchesStatus;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                      <Layers className="w-10 h-10 text-slate-600 mx-auto" />
                      <p className="text-sm font-bold text-slate-300">Nenhum módulo localizado com os filtros selecionados.</p>
                      <button
                        onClick={() => {
                          setModuleSearchQuery('');
                          setModuleCategoryFilter('TODOS');
                          setModuleStatusFilter('TODOS');
                        }}
                        className="px-4 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold hover:bg-amber-500/30"
                      >
                        Limpar Filtros
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((m) => {
                      const isHeadhunter = m.key === 'headhunter' || m.category === 'Headhunter';

                      return (
                        <div 
                          key={m.id} 
                          className={`p-5 rounded-2xl bg-slate-900 border space-y-3 flex flex-col justify-between transition-all duration-200 hover:shadow-xl ${
                            isHeadhunter
                              ? 'border-amber-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20 shadow-amber-500/5'
                              : m.isCore
                              ? 'border-indigo-500/30 bg-slate-900/90'
                              : 'border-slate-800/80 hover:border-slate-700'
                          }`}
                        >
                          <div className="space-y-2.5">
                            {/* Top row: category & badges */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  isHeadhunter 
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                }`}>
                                  {m.category}
                                </span>

                                {m.isCore && (
                                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                                    <Crown className="w-2.5 h-2.5" /> CORE
                                  </span>
                                )}

                                {(m.isBeta || m.status === 'Beta') && (
                                  <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5" /> BETA
                                  </span>
                                )}

                                {m.version && (
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {m.version}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                                  m.status === 'Ativo' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                  m.status === 'Beta' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                                  'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                }`}>
                                  {m.status}
                                </span>

                                <button
                                  onClick={() => {
                                    setSelectedModuleForEdit(m);
                                    setShowCreateModuleModal(true);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                                  title="Editar Módulo e Parâmetros"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Title & Key */}
                            <div>
                              <h3 className="text-sm font-black text-white flex items-center gap-2">
                                {isHeadhunter && <Crown className="w-4 h-4 text-amber-400 shrink-0" />}
                                <span>{m.name}</span>
                              </h3>
                              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 mt-0.5">
                                <span className="text-amber-400/80">key: {m.key}</span>
                                {m.route && <span>• /{m.route}</span>}
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                              {m.description}
                            </p>

                            {/* Info footer */}
                            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1 text-[11px]">
                              <div className="flex items-center justify-between text-slate-400">
                                <span>Empresas Ativas:</span>
                                <span className="font-bold text-amber-300">{m.activeTenantsCount || m.totalCompaniesUsing || 12} clientes</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-400">
                                <span>Plano Requerido:</span>
                                <span className="font-semibold text-slate-200">{m.requiredPlan || 'Básico'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Footer */}
                          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                            <button
                              onClick={() => setViewingModuleDetails(m)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                              title="Inspecionar parâmetros e componentes do módulo"
                            >
                              <Eye className="w-3 h-3 text-sky-400" />
                              <span>Visualizar</span>
                            </button>

                            <button
                              onClick={() => handleToggleModuleGlobal(m.id)}
                              disabled={m.isCore}
                              className={`px-3 py-1 rounded-lg text-xs font-black cursor-pointer transition-all ${
                                m.isCore 
                                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                  : m.status === 'Ativo' 
                                  ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30' 
                                  : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                              }`}
                              title={m.isCore ? 'Módulos CORE não podem ser desativados' : 'Alternar disponibilidade global'}
                            >
                              {m.isCore ? 'Obrigatório (Core)' : m.status === 'Ativo' ? 'Desativar Global' : 'Ativar Global'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. 🎨 CONSTRUTOR VISUAL MASTER GLOBAL */}
          {/* ========================================================================= */}
          {activeSection === 'construtor' && (
            <MasterVisualBuilderView onBackToMaster={() => setActiveSection('visao-geral')} />
          )}

          {/* ========================================================================= */}
          {/* 6. 🤖 INTELIGÊNCIA ARTIFICIAL */}
          {/* ========================================================================= */}
          {activeSection === 'ia' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-amber-400" /> Inteligência Artificial (Gemini Master)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Configurar modelo, prompts padrão, regras de consumo e histórico de chamadas</p>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                {[
                  { id: 'regras', label: 'Configuração & Regras' },
                  { id: 'prompts', label: 'Prompts Padrão' },
                  { id: 'consumo', label: 'Acompanhar Consumo' },
                  { id: 'historico', label: 'Histórico de Uso' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setIaSubTab(st.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      iaSubTab === st.id ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Sub-tab 1: Regras */}
              {iaSubTab === 'regras' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
                    <h3 className="text-sm font-bold text-white">Modelo e Parâmetros Principais</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-slate-400 block mb-1 font-semibold">Modelo Gemini Ativo:</label>
                        <select 
                          value={aiModel}
                          onChange={(e) => setAiModel(e.target.value as any)}
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                        >
                          <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra Rápido - Padrão)</option>
                          <option value="gemini-2.5-pro">Gemini 2.5 Pro (Raciocínio Avançado)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1 font-semibold">Limite Máximo de Tokens por Resposta:</label>
                        <input 
                          type="number"
                          value={maxTokens}
                          onChange={(e) => setMaxTokens(Number(e.target.value))}
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                    <h3 className="text-sm font-bold text-white">Segurança do Gemini no Backend</h3>
                    <p className="text-slate-300">
                      Chaves de API mantidas estritamente no ambiente do servidor Node/Cloud Run. Nenhuma chave exposta ao navegador do cliente.
                    </p>
                  </div>
                </div>
              )}

              {/* Sub-tab 2: Prompts Padrão */}
              {iaSubTab === 'prompts' && (
                <div className="space-y-4">
                  {aiPrompts.map((p) => (
                    <div key={p.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300 text-sm">{p.title}</span>
                        <button
                          onClick={() => handleTogglePrompt(p.id)}
                          className={`px-2.5 py-1 rounded-md font-bold text-[10px] cursor-pointer ${
                            p.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {p.active ? 'Ativo' : 'Inativo'}
                        </button>
                      </div>
                      <p className="text-slate-300 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px]">
                        "{p.promptText}"
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Sub-tab 3: Consumo */}
              {iaSubTab === 'consumo' && (
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                  <h3 className="text-sm font-bold text-white">Consumo Mensal de Tokens por Empresa</h3>
                  {tenants.map(t => (
                    <div key={t.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                      <span className="font-bold text-white">{t.companyName}</span>
                      <span className="font-black text-amber-300">14.200 tokens no mês (~ $ 0.02)</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Sub-tab 4: Histórico */}
              {iaSubTab === 'historico' && (
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                  <h3 className="text-sm font-bold text-white">Logs de Execução da IA</h3>
                  {aiLogs.map((l) => (
                    <div key={l.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-white block">{l.tenantName} • {l.feature}</span>
                        <span className="text-slate-400 text-[10px]">{l.requestedAt}</span>
                      </div>
                      <span className="font-mono text-emerald-400">{l.tokensUsed} tokens ({l.status})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 7. 🤝 PARCEIROS */}
          {/* ========================================================================= */}
          {activeSection === 'parceiros' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-amber-400" /> Parceiros e Convênios de Benefícios
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Parceiros estratégicos, acordos comerciais e controle de comissões</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {partners.map((p) => (
                  <div key={p.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                        {p.category}
                      </span>
                      <h3 className="text-sm font-black text-white">{p.name}</h3>
                      <p className="text-slate-400">Contato: {p.contactPerson} ({p.contactEmail})</p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="flex justify-between text-slate-300">
                          <span>Comissão Gerada:</span>
                          <span className="font-bold text-emerald-400">{p.commissionRatePercent}%</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Volume Transacionado:</span>
                          <span className="font-bold text-amber-300">R$ {p.monthlyVolumeBRL.toLocaleString('pt-BR')} /mês</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => alert(`Gerenciar acordo comercial com ${p.name}`)}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Gerenciar Convênio
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 8. 👥 USUÁRIOS E PERMISSÕES */}
          {/* ========================================================================= */}
          {activeSection === 'usuarios' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" /> Usuários e Permissões da Plataforma Master
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Gestão da equipe interna de administradores, suporte e níveis de acesso</p>
              </div>

              <div className="space-y-4">
                {platformAdmins.map((adm) => (
                  <div key={adm.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img src={adm.avatar} alt={adm.name} className="w-10 h-10 rounded-xl object-cover border border-amber-500/30" />
                      <div>
                        <span className="font-black text-white text-sm block">{adm.name}</span>
                        <span className="text-amber-300 text-[11px] font-semibold">{adm.role} • {adm.email}</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      {adm.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 9. 📊 RELATÓRIOS DA PLATAFORMA */}
          {/* ========================================================================= */}
          {activeSection === 'relatorios' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-400" /> Relatórios Executivos da Plataforma
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Métricas de faturamento, engajamento, churn e crescimento</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                  <h3 className="text-sm font-bold text-white">Receita & Faturamento Médio</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-300">Ticket Médio por Cliente (ARPU):</span>
                      <span className="font-bold text-emerald-400">R$ 1.150,00 /mês</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-300">Taxa de Churn (Cancelamento):</span>
                      <span className="font-bold text-emerald-400">&lt; 0.5% ao ano</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                  <h3 className="text-sm font-bold text-white">Uso de Funcionalidades</h3>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-amber-300 block">Módulos Mais Utilizados:</span>
                    <p className="text-slate-300">1º Recrutamento (Vagas) • 2º Benefícios • 3º Ponto Eletrônico</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 10. 🔐 SEGURANÇA */}
          {/* ========================================================================= */}
          {activeSection === 'seguranca' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" /> Segurança e Auditoria Global
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Logs de auditoria, backups de emergência e políticas de proteção</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white">Auditoria Unificada de Ações Críticas</h3>
                <div className="space-y-2 text-xs">
                  {securityLogs.map((s) => (
                    <div key={s.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div>
                        <span className="font-bold text-amber-300 block">{s.tenantName} ({s.userName})</span>
                        <p className="text-slate-300 text-[11px] mt-0.5">{s.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 text-[10px] block">{s.timestamp} • IP: {s.ipAddress}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold inline-block mt-1 ${
                          s.severity === 'ALTA' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          Gravidade: {s.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODALS */}
      {(selectedTenantForEdit || showCreateTenantModal) && (
        <MasterTenantModal
          tenant={selectedTenantForEdit}
          onClose={() => { setSelectedTenantForEdit(null); setShowCreateTenantModal(false); }}
          onSave={handleSaveTenant}
        />
      )}

      {showAnnouncementsModal && (
        <MasterAnnouncementsModal
          tenants={tenants}
          onClose={() => setShowAnnouncementsModal(false)}
          onSend={handleCreateAnnouncement}
        />
      )}

      {showBackupModal && (
        <MasterBackupModal
          tenants={tenants}
          backups={backups}
          onClose={() => setShowBackupModal(false)}
          onCreateBackup={handleCreateBackup}
          onRestoreBackup={() => alert('Backup restaurado')}
        />
      )}

      {selectedPlanForEdit && (
        <MasterEditPlanModal
          plan={selectedPlanForEdit}
          onClose={() => setSelectedPlanForEdit(null)}
          onSave={handleSavePlan}
        />
      )}

      <MasterCreateModuleModal
        isOpen={showCreateModuleModal}
        initialModule={selectedModuleForEdit}
        onClose={() => {
          setShowCreateModuleModal(false);
          setSelectedModuleForEdit(null);
        }}
        onSave={handleSaveModule}
      />

      {/* Module Details Inspection Modal */}
      {viewingModuleDetails && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      {viewingModuleDetails.category}
                    </span>
                    {viewingModuleDetails.isCore && (
                      <span className="text-[10px] font-black uppercase text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md">
                        Módulo CORE
                      </span>
                    )}
                    {(viewingModuleDetails.isBeta || viewingModuleDetails.status === 'Beta') && (
                      <span className="text-[10px] font-black uppercase text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-md">
                        BETA
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-white mt-1">{viewingModuleDetails.name}</h3>
                </div>
              </div>

              <button
                onClick={() => setViewingModuleDetails(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Descrição Funcional:</label>
                <p className="text-slate-200 bg-slate-950 p-3.5 rounded-xl border border-slate-800 leading-relaxed font-medium">
                  {viewingModuleDetails.description}
                </p>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Chave Técnica (Key)</span>
                  <span className="font-mono text-amber-400 font-extrabold text-xs">{viewingModuleDetails.key}</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Slug / Identificador</span>
                  <span className="font-mono text-slate-200 font-bold text-xs">{viewingModuleDetails.slug || viewingModuleDetails.key}</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Rota Interna</span>
                  <span className="font-mono text-emerald-400 font-bold text-xs">/{viewingModuleDetails.route || viewingModuleDetails.key}</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Versão Atual</span>
                  <span className="font-mono text-sky-400 font-bold text-xs">{viewingModuleDetails.version || 'v2.4.0'}</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Plano Requerido</span>
                  <span className="font-bold text-slate-200 text-xs">{viewingModuleDetails.requiredPlan || 'Básico'}</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Empresas Ativas</span>
                  <span className="font-bold text-amber-300 text-xs">{viewingModuleDetails.activeTenantsCount || viewingModuleDetails.totalCompaniesUsing || 12} clientes</span>
                </div>
              </div>

              {/* Status & Permissions info */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-amber-400 block">Regras de Acesso e Permissão:</span>
                <ul className="space-y-1.5 text-slate-300 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Disponível para atribuição a empresas nos planos autorizados ({viewingModuleDetails.requiredPlan || 'Todos'}).</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Controle de visibilidade em tempo real no menu lateral do cliente via <code>TenantModulePermissions</code>.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Code className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Mapeado com persistência no Firestore e suporte a Cloud Functions.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setViewingModuleDetails(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Fechar Inspecionar
              </button>

              <button
                onClick={() => {
                  const m = viewingModuleDetails;
                  setViewingModuleDetails(null);
                  setSelectedModuleForEdit(m);
                  setShowCreateModuleModal(true);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Edit3 className="w-3.5 h-3.5" /> Editar Módulo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
