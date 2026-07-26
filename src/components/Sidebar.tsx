import React, { useState } from 'react';
import { 
  Home, 
  Briefcase, 
  FileText, 
  Users, 
  Calendar, 
  BarChart2, 
  Building2, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  PlusCircle,
  ShieldCheck,
  UserCheck,
  Globe,
  Palmtree,
  FileCheck,
  ShieldAlert,
  CreditCard,
  Crown
} from 'lucide-react';

export type MainTab = 
  | 'dashboard' 
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
  const [recruitmentOpen, setRecruitmentOpen] = useState(true);

  const isRecruitmentSubActive = activeTab === 'vagas' || activeTab === 'banco-talentos' || activeTab === 'entrevistas';

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none">
      <div className="p-4 space-y-6">
        {/* Quick Action Button */}
        <div className="space-y-2">
          <button
            onClick={openNewJobModal}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Criar Nova Vaga</span>
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-1">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Navegação MAIS RH
          </p>

          {/* 🏠 Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Home className="w-4 h-4 text-indigo-600" />
            <span>Dashboard</span>
          </button>

          {/* 💼 Recrutamento & Seleção Group */}
          <div className="space-y-1 pt-1">
            <button
              onClick={() => setRecruitmentOpen(!recruitmentOpen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isRecruitmentSubActive 
                  ? 'text-indigo-700 font-semibold bg-indigo-50/50' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>Recrutamento & Seleção</span>
              </div>
              {recruitmentOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Submenu */}
            {recruitmentOpen && (
              <div className="pl-6 space-y-1 border-l-2 border-slate-100 ml-4 py-1">
                {/* 📄 Vagas */}
                <button
                  onClick={() => setActiveTab('vagas')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'vagas'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Vagas</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'vagas' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {jobsCount}
                  </span>
                </button>

                {/* 👥 Banco de Talentos */}
                <button
                  onClick={() => setActiveTab('banco-talentos')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'banco-talentos'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    <span>Banco de Talentos</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'banco-talentos' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {candidatesCount}
                  </span>
                </button>

                {/* 📅 Entrevistas */}
                <button
                  onClick={() => setActiveTab('entrevistas')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'entrevistas'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Entrevistas</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'entrevistas' ? 'bg-indigo-700 text-white' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {interviewsCount}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* 📊 Relatórios */}
          <button
            onClick={() => setActiveTab('relatorios')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'relatorios'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-indigo-600" />
            <span>Relatórios</span>
          </button>

          {/* 🏢 Empresa */}
          <button
            onClick={() => setActiveTab('empresa')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'empresa'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Empresa</span>
          </button>

          {/* 👥 Equipe Interna */}
          <button
            onClick={() => setActiveTab('equipe-interna')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'equipe-interna'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <span>Equipe Interna</span>
          </button>

          {/* 🌐 Site Público de Vagas */}
          <button
            onClick={() => setActiveTab('site-vagas')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'site-vagas'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4 text-indigo-600" />
            <span>Site de Vagas</span>
          </button>

          {/* 💼 Consultor de RH */}
          <button
            onClick={() => setActiveTab('consultor-rh')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'consultor-rh'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span>Consultor de RH</span>
          </button>

          {/* 🌴 Férias & Benefícios */}
          <button
            onClick={() => setActiveTab('ferias-beneficios')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'ferias-beneficios'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Palmtree className="w-4 h-4 text-indigo-600" />
            <span>Férias & Benefícios</span>
          </button>

          {/* ✍️ Documentos & Assinatura */}
          <button
            onClick={() => setActiveTab('documentos')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'documentos'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4 text-indigo-600" />
            <span>Assinatura Digital</span>
          </button>

          {/* 🛡️ Auditoria & Logs */}
          <button
            onClick={() => setActiveTab('auditoria')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'auditoria'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-indigo-600" />
            <span>Auditoria & Logs</span>
          </button>

          {/* 💳 Planos & Assinaturas SaaS */}
          <button
            onClick={() => setActiveTab('planos-saas')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'planos-saas'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <span>Planos & SaaS</span>
          </button>

          {/* ⚙️ Configurações */}
          <button
            onClick={() => setActiveTab('configuracoes')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'configuracoes'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4 text-indigo-600" />
            <span>Configurações</span>
          </button>
        </nav>
      </div>

      {/* Footer System Info */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-3">
        <div className="flex items-center gap-2.5 text-xs text-slate-600">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-semibold text-slate-700">MAIS RH v2.4</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold ml-auto">Online</span>
        </div>
      </div>
    </aside>
  );
};
