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
  FileCheck,
  Crown,
  Bot,
  Sparkles,
  Lock,
  Calculator,
  DollarSign,
  Clock
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
  | 'equipe-interna' 
  | 'site-vagas' 
  | 'consultor-rh' 
  | 'ferias-beneficios' 
  | 'documentos' 
  | 'folha-pagamento'
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
}) => {
  const { user, isModuleActive } = useAuth();
  const [recruitmentOpen, setRecruitmentOpen] = useState(true);

  const isMaster = user?.role === 'Super Administrador' || user?.tipoUsuario === 'MASTER';

  // Module active flags
  const hasRecrutamento = isModuleActive('recrutamento') || isModuleActive('vagas');
  const hasDp = isModuleActive('dp') || isModuleActive('equipeInterna');
  const hasDocumentos = isModuleActive('documentos') || isModuleActive('documentosAssinatura');
  const hasFolha = isModuleActive('folha') || isModuleActive('folhaPagamento') || isModuleActive('folha-pagamento') || isMaster;
  const hasPonto = isModuleActive('ponto') || isModuleActive('pontoDigital') || isMaster;
  const hasBeneficios = isModuleActive('beneficios') || isModuleActive('feriasBeneficios');
  const hasConsultor = isModuleActive('consultorRH');
  const hasRelatorios = isModuleActive('relatoriosAvancados') || isMaster;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none">
      <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)]">
        
        {/* Quick Action Button - only if recruitment module is enabled */}
        {hasRecrutamento && (
          <div className="space-y-2">
            <button
              onClick={openNewJobModal}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Criar Nova Vaga</span>
            </button>
          </div>
        )}

        {/* Navigation Section */}
        <nav className="space-y-1">
          <p className="px-3 text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
            PAINEL EMPRESA
          </p>

          {/* 🏠 Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-emerald-50 text-emerald-800 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Home className="w-4 h-4 text-emerald-600" />
            <span>Dashboard</span>
          </button>

          {/* 🤖 MAIS RH IA */}
          <button
            onClick={() => setActiveTab('mais-rh-ia')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'mais-rh-ia'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100/80 border border-emerald-200/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bot className={`w-4 h-4 ${activeTab === 'mais-rh-ia' ? 'text-amber-300' : 'text-emerald-700'}`} />
              <span>MAIS RH IA</span>
            </div>
            <span className={`text-[9px] uppercase tracking-wider font-black px-1.5 py-0.5 rounded flex items-center gap-1 ${
              activeTab === 'mais-rh-ia' ? 'bg-amber-400 text-slate-950' : 'bg-emerald-200 text-emerald-900'
            }`}>
              <Sparkles className="w-2.5 h-2.5" />
              IA
            </span>
          </button>

          {/* ⏱ PONTO DIGITAL */}
          {hasPonto && (
            <button
              onClick={() => setActiveTab('ponto-digital')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'ponto-digital'
                  ? 'bg-emerald-50 text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Ponto Digital</span>
            </button>
          )}

          {/* 📌 Módulo RECRUTAMENTO & SELEÇÃO (Minhas Vagas, Candidatos, Banco Talentos, Entrevistas) */}
          {hasRecrutamento ? (
            <>
              <div className="space-y-1 pt-1">
                <button
                  onClick={() => setRecruitmentOpen(!recruitmentOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'vagas' 
                      ? 'text-emerald-800 bg-emerald-50/70' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <span>Minhas Vagas</span>
                  </div>
                  {recruitmentOpen ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {/* Submenu for Minhas Vagas */}
                {recruitmentOpen && (
                  <div className="pl-6 space-y-1 border-l-2 border-emerald-100 ml-4 py-1">
                    <button
                      onClick={openNewJobModal}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-all cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Criar vaga</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('vagas')}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === 'vagas'
                          ? 'bg-emerald-600 text-white font-bold shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Vagas abertas</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        activeTab === 'vagas' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {jobsCount}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* 👥 Candidatos */}
              <button
                onClick={() => setActiveTab('banco-talentos')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'banco-talentos'
                    ? 'bg-emerald-50 text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Candidatos</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700">
                  {candidatesCount}
                </span>
              </button>

              {/* 🧠 Banco de Talentos */}
              <button
                onClick={() => setActiveTab('banco-talentos')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Banco de Talentos</span>
                </div>
              </button>

              {/* 📅 Entrevistas */}
              <button
                onClick={() => setActiveTab('entrevistas')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'entrevistas'
                    ? 'bg-emerald-50 text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Entrevistas</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                  {interviewsCount}
                </span>
              </button>
            </>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200/70 rounded-xl my-2 text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Recrutamento Bloqueado</span>
              </div>
              <p className="text-[11px] text-amber-700">
                Módulo não liberado no plano contratado. Solicite a liberação ao MASTER.
              </p>
            </div>
          )}

          {/* 📄 Documentos (Se contratado) */}
          {hasDocumentos && (
            <button
              onClick={() => setActiveTab('documentos')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'documentos'
                  ? 'bg-emerald-50 text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Documentos</span>
            </button>
          )}

          {/* 💰 Folha de Pagamento (Se contratado) */}
          {hasFolha && (
            <button
              onClick={() => setActiveTab('folha-pagamento')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'folha-pagamento'
                  ? 'bg-emerald-50 text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>Folha de Pagamento</span>
            </button>
          )}

          {/* ⚙ Configurações */}
          <button
            onClick={() => setActiveTab('configuracoes')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'configuracoes'
                ? 'bg-emerald-50 text-emerald-800 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4 text-emerald-600" />
            <span>Configurações</span>
          </button>

          {/* 👑 Acesso Master - Visible only for MASTER role */}
          {isMaster && (
            <button
              onClick={() => setActiveTab('acesso-master')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer mt-2 ${
                activeTab === 'acesso-master'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-amber-500/10 text-amber-800 hover:bg-amber-500/20 border border-amber-300/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Crown className="w-4 h-4 text-amber-600" />
                <span>Painel Master</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-black px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                Admin
              </span>
            </button>
          )}

          {/* Outros Módulos Corporativos */}
          <div className="pt-3 mt-3 border-t border-slate-100 space-y-1">
            <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
              OUTROS MÓDULOS
            </p>

            {hasDp ? (
              <button
                onClick={() => setActiveTab('equipe-interna')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'equipe-interna' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Quadro de Colaboradores (DP)</span>
              </button>
            ) : (
              <div className="px-3 py-1.5 text-[11px] text-slate-400 flex items-center justify-between">
                <span>DP / Colaboradores</span>
                <Lock className="w-3 h-3 text-slate-400" />
              </div>
            )}

            {hasRelatorios && (
              <button
                onClick={() => setActiveTab('relatorios')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'relatorios' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Relatórios</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('site-vagas')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'site-vagas' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>Portal Público de Vagas</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Footer System Info */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-3">
        <div className="flex items-center gap-2.5 text-xs text-slate-600">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-semibold text-slate-700">MAIS RH SaaS</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold ml-auto">Firebase Active</span>
        </div>
      </div>
    </aside>
  );
};
