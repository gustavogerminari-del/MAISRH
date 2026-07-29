import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Contact, 
  ListChecks, 
  Video, 
  UserCheck, 
  Building2, 
  TrendingUp, 
  FileText, 
  FileSignature, 
  BadgeDollarSign, 
  Wallet, 
  Receipt, 
  ShieldCheck, 
  ShieldAlert,
  BarChart2, 
  Clock, 
  Calculator, 
  Gift, 
  Sun, 
  UserMinus, 
  FileCheck, 
  HeartPulse,
  Calendar, 
  Settings, 
  Building, 
  Crown, 
  Layers, 
  Palette, 
  Shield, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Globe
} from 'lucide-react';
import { useAuth } from '../auth';

export type MainTab = 
  | 'dashboard' 
  | 'vagas' 
  | 'candidatos' 
  | 'banco-talentos' 
  | 'processos-seletivos' 
  | 'entrevistas' 
  | 'contratacoes' 
  | 'headhunter'
  | 'headhunter-clientes' 
  | 'headhunter-comercial'
  | 'headhunter-crm'
  | 'headhunter-propostas' 
  | 'headhunter-contratos' 
  | 'headhunter-comissoes' 
  | 'headhunter-financeiro' 
  | 'headhunter-despesas' 
  | 'headhunter-garantias' 
  | 'headhunter-relatorios' 
  | 'colaboradores' 
  | 'ponto-digital' 
  | 'jornada'
  | 'folha-pagamento' 
  | 'beneficios' 
  | 'ferias' 
  | 'rescisao' 
  | 'documentos' 
  | 'afastamentos'
  | 'sst'
  | 'agenda' 
  | 'relatorios' 
  | 'configuracoes' 
  | 'site-vagas' 
  | 'acesso-master' 
  | 'master-empresas' 
  | 'master-planos' 
  | 'master-modulos' 
  | 'master-usuarios' 
  | 'master-personalizacao' 
  | 'auditoria';

interface NavItem {
  id: MainTab;
  label: string;
  icon: React.FC<{ className?: string }>;
  badge?: number | string;
}

interface NavGroup {
  id: string;
  title: string;
  masterOnly?: boolean;
  items: NavItem[];
}

const COLLAPSED_STORAGE_KEY = 'sidebarCollapsed';

interface SidebarProps {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  openNewJobModal?: () => void;
  openNewCandidateModal?: () => void;
  openScheduleInterviewModal?: () => void;
  jobsCount?: number;
  candidatesCount?: number;
  interviewsCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  jobsCount = 0,
  candidatesCount = 0,
  interviewsCount = 0,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const { user } = useAuth();
  const isMaster = user?.role === 'Super Administrador' || user?.tipoUsuario === 'MASTER';

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem(COLLAPSED_STORAGE_KEY);
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem(COLLAPSED_STORAGE_KEY, String(isCollapsed));
  }, [isCollapsed]);

  const navGroups: NavGroup[] = [
    {
      id: 'inicio',
      title: 'INÍCIO',
      items: [
        { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
      ]
    },
    {
      id: 'recrutamento',
      title: 'RECRUTAMENTO',
      items: [
        { id: 'vagas', label: 'Vagas', icon: Briefcase, badge: jobsCount > 0 ? jobsCount : undefined },
        { id: 'candidatos', label: 'Candidatos', icon: Users, badge: candidatesCount > 0 ? candidatesCount : undefined },
        { id: 'banco-talentos', label: 'Banco de Talentos', icon: Contact },
        { id: 'processos-seletivos', label: 'Processos Seletivos', icon: ListChecks },
        { id: 'entrevistas', label: 'Entrevistas', icon: Video, badge: interviewsCount > 0 ? interviewsCount : undefined },
        { id: 'contratacoes', label: 'Contratações', icon: UserCheck },
      ]
    },
    {
      id: 'headhunter',
      title: 'HEADHUNTER',
      items: [
        { id: 'headhunter' as MainTab, label: 'Visão Geral', icon: LayoutDashboard },
        { id: 'headhunter-clientes' as MainTab, label: 'Clientes', icon: Building2 },
        { id: 'headhunter-comercial' as MainTab, label: 'Comercial', icon: TrendingUp },
        { id: 'headhunter-financeiro' as MainTab, label: 'Financeiro', icon: Wallet },
      ]
    },
    {
      id: 'colaboradores',
      title: 'COLABORADORES',
      items: [
        { id: 'colaboradores', label: 'Colaboradores', icon: Users },
      ]
    },
    {
      id: 'departamento-pessoal',
      title: 'DEPARTAMENTO PESSOAL',
      items: [
        { id: 'ponto-digital', label: 'Jornada', icon: Clock },
        { id: 'beneficios', label: 'Benefícios', icon: Gift },
        { id: 'ferias', label: 'Férias', icon: Sun },
        { id: 'rescisao', label: 'Rescisões', icon: UserMinus },
        { id: 'documentos', label: 'Documentos', icon: FileCheck },
        { id: 'afastamentos', label: 'Afastamentos', icon: ShieldAlert },
        { id: 'sst', label: 'Saúde e Segurança (SST)', icon: HeartPulse },
      ]
    },
    {
      id: 'gestao',
      title: 'GESTÃO',
      items: [
        { id: 'agenda', label: 'Agenda', icon: Calendar },
        { id: 'relatorios', label: 'Relatórios Gerais', icon: BarChart2 },
        { id: 'configuracoes', label: 'Configurações', icon: Settings },
      ]
    },
    ...(isMaster ? [{
      id: 'plataforma',
      title: 'PLATAFORMA',
      masterOnly: true,
      items: [
        { id: 'acesso-master' as MainTab, label: 'Painel Master', icon: Crown },
        { id: 'master-empresas' as MainTab, label: 'Empresas', icon: Building },
        { id: 'master-planos' as MainTab, label: 'Planos', icon: Crown },
        { id: 'master-modulos' as MainTab, label: 'Módulos', icon: Layers },
        { id: 'master-usuarios' as MainTab, label: 'Usuários', icon: Users },
        { id: 'master-personalizacao' as MainTab, label: 'Personalização', icon: Palette },
        { id: 'auditoria' as MainTab, label: 'Logs', icon: Shield },
      ]
    }] : [])
  ];

  const handleSelectTab = (tab: MainTab) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  // Helper to check if item is active or matched parent tab
  const isTabActive = (itemTab: MainTab) => {
    if (activeTab === itemTab) return true;
    if (itemTab === 'headhunter-clientes' && activeTab === 'headhunter') return true;
    return false;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar Element */}
      <aside 
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none transition-all duration-300 ${
          isOpenMobile 
            ? 'translate-x-0 w-72 shadow-2xl' 
            : `-translate-x-full lg:translate-x-0 ${isCollapsed ? 'lg:w-16' : 'lg:w-60'}`
        }`}
      >
        <div className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-50px)] scrollbar-thin">
          
          {/* Header & Logo */}
          <div className={`flex items-center pb-2 border-b border-slate-100 ${isCollapsed && !isOpenMobile ? 'justify-center' : 'justify-between px-1'}`}>
            {(!isCollapsed || isOpenMobile) && (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                  M
                </div>
                <div>
                  <span className="text-base font-black text-slate-900 tracking-tight">
                    MAIS<span className="text-indigo-600">RH</span>
                  </span>
                  <p className="text-[10px] text-slate-400 font-semibold -mt-1">SaaS Corporativo</p>
                </div>
              </div>
            )}

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop Collapse/Expand Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? "Expandir menu" : "Recolher menu"}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Groups */}
          <nav className="space-y-4">
            {navGroups.map((group, groupIdx) => (
              <div key={group.id} className="space-y-1">
                {(!isCollapsed || isOpenMobile) ? (
                  <span className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block pt-1 pb-1">
                    {group.title}
                  </span>
                ) : (
                  groupIdx > 0 && <div className="border-t border-slate-100 my-2" />
                )}

                {group.items.map(item => {
                  const Icon = item.icon;
                  const active = isTabActive(item.id);

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      title={isCollapsed && !isOpenMobile ? item.label : undefined}
                      className={`w-full rounded-xl text-xs font-semibold transition-all flex items-center cursor-pointer min-h-[38px] ${
                        isCollapsed && !isOpenMobile
                          ? 'justify-center p-2'
                          : 'px-3 py-2 gap-3 text-left justify-between'
                      } ${
                        active
                          ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-500'}`} />
                        {(!isCollapsed || isOpenMobile) && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>

                      {(!isCollapsed || isOpenMobile) && item.badge !== undefined && (
                        <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold shrink-0 ${
                          active ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Portal de Vagas Público */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => handleSelectTab('site-vagas')}
                title={isCollapsed && !isOpenMobile ? "Portal de Vagas" : undefined}
                className={`w-full rounded-xl text-xs font-semibold transition-all flex items-center cursor-pointer min-h-[38px] ${
                  isCollapsed && !isOpenMobile
                    ? 'justify-center p-2'
                    : 'px-3 py-2 gap-3 text-left'
                } ${
                  activeTab === 'site-vagas'
                    ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Globe className={`w-4 h-4 shrink-0 ${activeTab === 'site-vagas' ? 'text-white' : 'text-slate-500'}`} />
                {(!isCollapsed || isOpenMobile) && <span>Portal de Vagas</span>}
              </button>
            </div>
          </nav>
        </div>

        {/* Footer info */}
        {(!isCollapsed || isOpenMobile) && (
          <div className="p-3 border-t border-slate-100 bg-slate-50/80 text-center">
            <p className="text-[10px] text-slate-400 font-semibold">MAIS RH © 2026</p>
          </div>
        )}
      </aside>
    </>
  );
};
