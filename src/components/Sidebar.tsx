import React, { useState } from 'react';
import { 
  Home, 
  Briefcase, 
  FileText, 
  Users, 
  Calendar, 
  BarChart2, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  PlusCircle,
  UserCheck,
  Globe,
  Crown,
  Bot,
  Sparkles,
  Lock,
  Calculator,
  Clock,
  Building2,
  TrendingUp,
  Award,
  X
} from 'lucide-react';
import { useAuth } from '../auth';

export type MainTab = 
  | 'dashboard' 
  | 'mais-rh-ia'
  | 'ponto-digital'
  | 'vagas' 
  | 'banco-talentos' 
  | 'entrevistas' 
  | 'relatorios' 
  | 'empresa' 
  | 'colaboradores' 
  | 'site-vagas' 
  | 'consultor-rh' 
  | 'ferias-beneficios' 
  | 'beneficios'
  | 'ferias'
  | 'rescisao'
  | 'documentos' 
  | 'folha-pagamento'
  | 'relatorios-dp'
  | 'configuracoes-trabalhistas'
  | 'auditoria' 
  | 'planos-saas' 
  | 'acesso-master' 
  | 'configuracoes';

interface SidebarProps {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  openNewJobModal: () => void;
  openNewCandidateModal: () => void;
  openScheduleInterviewModal: () => void;
  jobsCount: number;
  candidatesCount: number;
  interviewsCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  openNewJobModal,
  openNewCandidateModal,
  openScheduleInterviewModal,
  jobsCount,
  candidatesCount,
  interviewsCount,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const { user, isModuleActive } = useAuth();
  const [recruitmentOpen, setRecruitmentOpen] = useState(true);
  const [dpOpen, setDpOpen] = useState(true);

  const isMaster = user?.role === 'Super Administrador' || user?.tipoUsuario === 'MASTER';

  // Module active flags
  const hasRecrutamento = isModuleActive('recrutamento') || isModuleActive('vagas');
  const hasDp = isModuleActive('dp') || isModuleActive('equipeInterna');
  const hasDocumentos = isModuleActive('documentos') || isModuleActive('documentosAssinatura');
  const hasFolha = isModuleActive('folha') || isModuleActive('folhaPagamento') || isModuleActive('folha-pagamento') || isMaster;
  const hasPonto = isModuleActive('ponto') || isModuleActive('pontoDigital') || isMaster;
  const hasRelatorios = isModuleActive('relatoriosAvancados') || isMaster;

  const handleSelectTab = (tab: MainTab) => {
    setActiveTab(tab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity" 
          onClick={onCloseMobile} 
        />
      )}

      {/* Sidebar Navigation Drawer */}
      <aside 
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 lg:w-64 bg-white border-r border-[#E5E7EB] flex flex-col justify-between shrink-0 select-none transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-60px)]">
          
          {/* Brand Logo & Mobile Close Button */}
          <div className="px-2 py-1 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white font-black flex items-center justify-center text-base shadow-xs">
                M
              </div>
              <div>
                <span className="text-lg font-black text-[#1E293B] tracking-tight">
                  MAIS<span className="text-[#2563EB]">RH</span>
                </span>
                <p className="text-[10px] text-[#64748B] font-semibold -mt-1">SaaS Corporativo</p>
              </div>
            </div>
            
            {/* Close Button on Mobile */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              title="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Button */}
          {hasRecrutamento && (
            <button
              onClick={() => {
                openNewJobModal();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold px-3 py-2.5 rounded-xl text-xs transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Criar Nova Vaga</span>
            </button>
          )}

          {/* Navigation Items */}
          <nav className="space-y-1">
            <p className="px-3 text-[10px] font-black text-[#64748B] uppercase tracking-wider mb-2">
              NAVEGAÇÃO PRINCIPAL
            </p>

            {/* 1. Dashboard / Início */}
            <button
              onClick={() => handleSelectTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                activeTab === 'dashboard'
                  ? 'bg-[#2563EB] text-white shadow-xs font-bold'
                  : 'text-[#1E293B] hover:bg-[#F8FAFC] hover:text-[#2563EB]'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>🏠 Início</span>
            </button>

            {/* 2. Recrutamento (Vagas, Candidatos, Banco de Talentos, Entrevistas) */}
            {hasRecrutamento ? (
              <div className="space-y-1 pt-1">
                <button
                  onClick={() => setRecruitmentOpen(!recruitmentOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                    activeTab === 'vagas' || activeTab === 'banco-talentos' || activeTab === 'entrevistas'
                      ? 'text-[#2563EB] bg-blue-50/50'
                      : 'text-[#1E293B] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-[#2563EB]" />
                    <span>🎯 Recrutamento</span>
                  </div>
                  {recruitmentOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
                  )}
                </button>

                {recruitmentOpen && (
                  <div className="pl-6 space-y-1 border-l-2 border-[#E5E7EB] ml-4 py-1">
                    <button
                      onClick={() => handleSelectTab('vagas')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === 'vagas'
                          ? 'bg-[#2563EB] text-white font-bold shadow-2xs'
                          : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
                      }`}
                    >
                      <span>Vagas</span>
                      <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                        activeTab === 'vagas' ? 'bg-blue-700 text-white' : 'bg-[#E5E7EB] text-[#1E293B]'
                      }`}>
                        {jobsCount}
                      </span>
                    </button>

                    <button
                      onClick={() => handleSelectTab('banco-talentos')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === 'banco-talentos'
                          ? 'bg-[#2563EB] text-white font-bold shadow-2xs'
                          : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
                      }`}
                    >
                      <span>Candidatos</span>
                      <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                        activeTab === 'banco-talentos' ? 'bg-blue-700 text-white' : 'bg-[#E5E7EB] text-[#1E293B]'
                      }`}>
                        {candidatesCount}
                      </span>
                    </button>

                    <button
                      onClick={() => handleSelectTab('banco-talentos')}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B] transition-all cursor-pointer"
                    >
                      <span>Banco de Talentos IA</span>
                    </button>

                    <button
                      onClick={() => handleSelectTab('entrevistas')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === 'entrevistas'
                          ? 'bg-[#2563EB] text-white font-bold shadow-2xs'
                          : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
                      }`}
                    >
                      <span>Processo Seletivo</span>
                      <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                        activeTab === 'entrevistas' ? 'bg-blue-700 text-white' : 'bg-[#E5E7EB] text-[#1E293B]'
                      }`}>
                        {interviewsCount}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2.5 bg-amber-50 border border-amber-200/60 rounded-xl my-1 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Recrutamento Indisponível</span>
                </div>
              </div>
            )}

            {/* 3. MAIS RH IA */}
            <div className="pt-1">
              <button
                onClick={() => handleSelectTab('mais-rh-ia')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border min-h-[44px] ${
                  activeTab === 'mais-rh-ia'
                    ? 'bg-[#B8963E] text-white border-[#B8963E] shadow-sm'
                    : 'bg-[#B8963E]/5 text-[#1E293B] hover:bg-[#B8963E]/10 border-[#B8963E]/20'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className={`w-4 h-4 ${activeTab === 'mais-rh-ia' ? 'text-white' : 'text-[#B8963E]'}`} />
                  <span>🤖 MAIS RH IA</span>
                </div>
                <span className={`text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded ${
                  activeTab === 'mais-rh-ia' ? 'bg-white text-[#B8963E]' : 'bg-[#B8963E] text-white'
                }`}>
                  IA
                </span>
              </button>
            </div>

            {/* 4. Colaboradores / DP */}
            <div className="space-y-1 pt-1">
              <button
                onClick={() => setDpOpen(!dpOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                  [
                    'colaboradores',
                    'ponto-digital',
                    'folha-pagamento',
                    'beneficios',
                    'ferias',
                    'rescisao',
                    'documentos',
                    'relatorios-dp',
                    'configuracoes-trabalhistas'
                  ].includes(activeTab)
                    ? 'text-[#2563EB] bg-blue-50/50 font-bold'
                    : 'text-[#1E293B] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-[#2563EB]" />
                  <span>👥 Colaboradores</span>
                </div>
                {dpOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
                )}
              </button>

              {dpOpen && (
                <div className="pl-6 space-y-1 border-l-2 border-[#E5E7EB] ml-4 py-1">
                  <button
                    onClick={() => handleSelectTab('colaboradores')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      activeTab === 'colaboradores'
                        ? 'bg-[#2563EB] text-white font-bold shadow-2xs'
                        : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
                    }`}
                  >
                    <span>Lista de Colaboradores</span>
                  </button>

                  <button
                    onClick={() => handleSelectTab('ponto-digital')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      activeTab === 'ponto-digital'
                        ? 'bg-[#2563EB] text-white font-bold shadow-2xs'
                        : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
                    }`}
                  >
                    <span>⏱ Ponto Digital</span>
                  </button>

                  <button
                    onClick={() => handleSelectTab('folha-pagamento')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      activeTab === 'folha-pagamento'
                        ? 'bg-[#2563EB] text-white font-bold shadow-2xs'
                        : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
                    }`}
                  >
                    <span>💰 Departamento Pessoal</span>
                  </button>

                  <button
                    onClick={() => handleSelectTab('beneficios')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      activeTab === 'beneficios'
                        ? 'bg-[#2563EB] text-white font-bold shadow-2xs'
                        : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
                    }`}
                  >
                    <span>Benefícios</span>
                  </button>

                  <button
                    onClick={() => handleSelectTab('ferias')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      activeTab === 'ferias'
                        ? 'bg-[#2563EB] text-white font-bold shadow-2xs'
                        : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
                    }`}
                  >
                    <span>Férias</span>
                  </button>

                  <button
                    onClick={() => handleSelectTab('rescisao')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      activeTab === 'rescisao'
                        ? 'bg-[#2563EB] text-white font-bold shadow-2xs'
                        : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
                    }`}
                  >
                    <span>Rescisão</span>
                  </button>

                  <button
                    onClick={() => handleSelectTab('documentos')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      activeTab === 'documentos'
                        ? 'bg-[#2563EB] text-white font-bold shadow-2xs'
                        : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
                    }`}
                  >
                    <span>Documentos</span>
                  </button>

                  <button
                    onClick={() => handleSelectTab('relatorios-dp')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      activeTab === 'relatorios-dp'
                        ? 'bg-[#2563EB] text-white font-bold shadow-2xs'
                        : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
                    }`}
                  >
                    <span>Relatórios DP</span>
                  </button>

                  <button
                    onClick={() => handleSelectTab('configuracoes-trabalhistas')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      activeTab === 'configuracoes-trabalhistas'
                        ? 'bg-[#2563EB] text-white font-bold shadow-2xs'
                        : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
                    }`}
                  >
                    <span>Configurações Trabalhistas</span>
                  </button>
                </div>
              )}
            </div>

            {/* 5. Relatórios */}
            {hasRelatorios && (
              <button
                onClick={() => handleSelectTab('relatorios')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                  activeTab === 'relatorios'
                    ? 'bg-[#2563EB] text-white shadow-xs font-bold'
                    : 'text-[#1E293B] hover:bg-[#F8FAFC] hover:text-[#2563EB]'
                }`}
              >
                <BarChart2 className="w-4 h-4 text-[#2563EB]" />
                <span>📊 Relatórios</span>
              </button>
            )}

            {/* 6. Configurações */}
            <button
              onClick={() => handleSelectTab('configuracoes')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                activeTab === 'configuracoes'
                  ? 'bg-[#2563EB] text-white shadow-xs font-bold'
                  : 'text-[#1E293B] hover:bg-[#F8FAFC] hover:text-[#2563EB]'
              }`}
            >
              <Settings className="w-4 h-4 text-[#2563EB]" />
              <span>Configurações</span>
            </button>

            {/* Portal de Vagas Público */}
            <button
              onClick={() => handleSelectTab('site-vagas')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer mt-2 min-h-[44px] ${
                activeTab === 'site-vagas'
                  ? 'bg-[#2563EB] text-white shadow-xs font-bold'
                  : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
              }`}
            >
              <Globe className="w-4 h-4 text-[#64748B]" />
              <span>Portal de Vagas</span>
            </button>

            {/* Master Admin Panel */}
            {isMaster && (
              <button
                onClick={() => handleSelectTab('acesso-master')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer mt-3 min-h-[44px] ${
                  activeTab === 'acesso-master'
                    ? 'bg-[#1E293B] text-white shadow-sm'
                    : 'bg-[#F8FAFC] text-[#1E293B] border border-[#E5E7EB] hover:bg-[#E5E7EB]/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-[#B8963E]" />
                  <span>Painel Master</span>
                </div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-[#B8963E] text-white">
                  Admin
                </span>
              </button>
            )}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-[#E5E7EB] bg-[#F8FAFC] text-center">
          <p className="text-[10px] text-[#64748B] font-medium">MAIS RH © 2026 — Plataforma Oficial</p>
        </div>
      </aside>
    </>
  );
};


