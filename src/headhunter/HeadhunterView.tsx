import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  TrendingUp, 
  Briefcase, 
  Users, 
  List, 
  Video, 
  UserCheck, 
  Calendar, 
  Award, 
  DollarSign, 
  Receipt, 
  FileText, 
  BarChart2,
  Sparkles
} from 'lucide-react';

import { HeadhunterDashboard } from './components/HeadhunterDashboard';
import { HeadhunterClientes } from './components/HeadhunterClientes';
import { HeadhunterCRM } from './components/HeadhunterCRM';
import { HeadhunterVagas } from './components/HeadhunterVagas';
import { HeadhunterCandidatos } from './components/HeadhunterCandidatos';
import { HeadhunterPipeline } from './components/HeadhunterPipeline';
import { HeadhunterEntrevistas } from './components/HeadhunterEntrevistas';
import { HeadhunterContratacoes } from './components/HeadhunterContratacoes';
import { HeadhunterAgenda } from './components/HeadhunterAgenda';
import { HeadhunterComissoes } from './components/HeadhunterComissoes';
import { HeadhunterFinanceiro } from './components/HeadhunterFinanceiro';
import { HeadhunterDespesas } from './components/HeadhunterDespesas';
import { HeadhunterContratos } from './components/HeadhunterContratos';
import { HeadhunterRelatorios } from './components/HeadhunterRelatorios';
import { HeadhunterAiModal } from './components/HeadhunterAiModal';

import { 
  MOCK_HEADHUNTER_CLIENTS, 
  MOCK_HEADHUNTER_LEADS, 
  MOCK_HEADHUNTER_JOBS, 
  MOCK_HEADHUNTER_CANDIDATES, 
  MOCK_HEADHUNTER_INTERVIEWS, 
  MOCK_HEADHUNTER_HIRINGS, 
  MOCK_HEADHUNTER_COMMISSIONS, 
  MOCK_HEADHUNTER_FINANCIAL, 
  MOCK_HEADHUNTER_EXPENSES, 
  MOCK_HEADHUNTER_EVENTS, 
  MOCK_HEADHUNTER_CONTRACTS 
} from './mockData';

import { 
  HeadhunterClient, 
  HeadhunterLead, 
  HeadhunterJob, 
  HeadhunterCandidate, 
  HeadhunterInterview, 
  HeadhunterHiring, 
  HeadhunterCommission, 
  HeadhunterFinanceItem, 
  HeadhunterExpense, 
  HeadhunterEvent, 
  HeadhunterContract,
  LeadStage
} from './types';

export type HeadhunterSubTab = 
  | 'dashboard'
  | 'clientes'
  | 'crm'
  | 'vagas'
  | 'candidatos'
  | 'pipeline'
  | 'entrevistas'
  | 'contratacoes'
  | 'agenda'
  | 'comissoes'
  | 'financeiro'
  | 'despesas'
  | 'contratos'
  | 'relatorios';

interface HeadhunterViewProps {
  initialSubTab?: HeadhunterSubTab;
}

export const HeadhunterView: React.FC<HeadhunterViewProps> = ({ initialSubTab = 'dashboard' }) => {
  const [activeTab, setActiveTab] = useState<HeadhunterSubTab>(initialSubTab);

  // State Collections
  const [clients, setClients] = useState<HeadhunterClient[]>(MOCK_HEADHUNTER_CLIENTS);
  const [leads, setLeads] = useState<HeadhunterLead[]>(MOCK_HEADHUNTER_LEADS);
  const [jobs, setJobs] = useState<HeadhunterJob[]>(MOCK_HEADHUNTER_JOBS);
  const [candidates, setCandidates] = useState<HeadhunterCandidate[]>(MOCK_HEADHUNTER_CANDIDATES);
  const [interviews, setInterviews] = useState<HeadhunterInterview[]>(MOCK_HEADHUNTER_INTERVIEWS);
  const [hirings, setHirings] = useState<HeadhunterHiring[]>(MOCK_HEADHUNTER_HIRINGS);
  const [commissions, setCommissions] = useState<HeadhunterCommission[]>(MOCK_HEADHUNTER_COMMISSIONS);
  const [financial, setFinancial] = useState<HeadhunterFinanceItem[]>(MOCK_HEADHUNTER_FINANCIAL);
  const [expenses, setExpenses] = useState<HeadhunterExpense[]>(MOCK_HEADHUNTER_EXPENSES);
  const [events, setEvents] = useState<HeadhunterEvent[]>(MOCK_HEADHUNTER_EVENTS);
  const [contracts, setContracts] = useState<HeadhunterContract[]>(MOCK_HEADHUNTER_CONTRACTS);

  // AI Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiActionType, setAiActionType] = useState('resumoExecutivo');
  const [aiInitialData, setAiInitialData] = useState<any>(null);

  const handleOpenAiModal = (type: string, data?: any) => {
    setAiActionType(type);
    setAiInitialData(data);
    setAiModalOpen(true);
  };

  // State Handlers
  const handleAddClient = (cli: HeadhunterClient) => setClients([cli, ...clients]);
  const handleAddLead = (ld: HeadhunterLead) => setLeads([ld, ...leads]);
  const handleUpdateLeadStage = (id: string, stage: LeadStage) => {
    setLeads(leads.map(l => l.id === id ? { ...l, etapa: stage } : l));
  };

  const handleAddJob = (j: HeadhunterJob) => setJobs([j, ...jobs]);
  
  // FINALIZING JOB AUTOMATION
  const handleFinalizeJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    // 1. Alterar status da vaga para Fechada
    setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'Fechada' } : j));

    // 2. Gerar faturamento & receita
    const newFin: HeadhunterFinanceItem = {
      id: `fin-${Date.now()}`,
      empresaId: 'emp-001',
      criadoPor: job.consultorResponsavel,
      criadoEm: new Date().toISOString().split('T')[0],
      status: 'Pendente',
      tipo: 'Receita',
      categoria: 'Honorários Executive Search',
      descricao: `Faturamento Fechamento Vaga Executiva ${job.cargo} (${job.clienteNome})`,
      clienteNome: job.clienteNome,
      vagaTitulo: job.cargo,
      valor: job.comissaoCalculada,
      dataVencimento: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      formaPagamento: 'Boleto',
      centroCusto: 'Receitas de Executive Search',
      statusFinanceiro: 'Pendente'
    };
    setFinancial([newFin, ...financial]);

    // 3. Gerar comissão
    const newCom: HeadhunterCommission = {
      id: `com-${Date.now()}`,
      empresaId: 'emp-001',
      criadoPor: job.consultorResponsavel,
      criadoEm: new Date().toISOString().split('T')[0],
      status: 'Prevista',
      clienteNome: job.clienteNome,
      vagaTitulo: job.cargo,
      consultorNome: job.consultorResponsavel,
      tipoComissao: 'Comissão percentual',
      valorRecebidoVaga: job.comissaoCalculada,
      percentual: job.percentualComissao,
      valorComissao: Math.round(job.comissaoCalculada * 0.2), // 20% do faturamento da consultoria
      dataPrevista: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      situacao: 'Prevista'
    };
    setCommissions([newCom, ...commissions]);
  };

  const handleAddCandidate = (c: HeadhunterCandidate) => setCandidates([c, ...candidates]);
  const handleAddInterview = (i: HeadhunterInterview) => setInterviews([i, ...interviews]);
  const handleAddCommission = (c: HeadhunterCommission) => setCommissions([c, ...commissions]);
  const handleAddFinanceItem = (f: HeadhunterFinanceItem) => setFinancial([f, ...financial]);
  const handleAddExpense = (e: HeadhunterExpense) => setExpenses([e, ...expenses]);
  const handleAddEvent = (e: HeadhunterEvent) => setEvents([e, ...events]);
  const handleAddContract = (c: HeadhunterContract) => setContracts([c, ...contracts]);

  const navItems: Array<{ id: HeadhunterSubTab; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clientes', label: 'Clientes', icon: Building2 },
    { id: 'crm', label: 'CRM Comercial', icon: TrendingUp },
    { id: 'vagas', label: 'Vagas', icon: Briefcase },
    { id: 'candidatos', label: 'Candidatos', icon: Users },
    { id: 'pipeline', label: 'Pipeline', icon: List },
    { id: 'entrevistas', label: 'Entrevistas', icon: Video },
    { id: 'contratacoes', label: 'Contratações', icon: UserCheck },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'comissoes', label: 'Comissões', icon: Award },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'despesas', label: 'Despesas', icon: Receipt },
    { id: 'contratos', label: 'Contratos', icon: FileText },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart2 }
  ];

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black mb-2 border border-indigo-100">
            <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
            Módulo Headhunter & Executive Search MAIS RH
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Portal do Headhunter</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Gestão ponta a ponta do ciclo comercial, prospecção de clientes corporativos, recrutamento executivo e cálculo de comissões.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAiModal('resumoExecutivo')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Assistente IA do Headhunter</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-1 overflow-x-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Router */}
      {activeTab === 'dashboard' && (
        <HeadhunterDashboard
          clients={clients}
          jobs={jobs}
          commissions={commissions}
          expenses={expenses}
          interviews={interviews}
          events={events}
          onNavigateTab={tab => setActiveTab(tab)}
          onOpenAiModal={handleOpenAiModal}
        />
      )}

      {activeTab === 'clientes' && (
        <HeadhunterClientes
          clients={clients}
          onAddClient={handleAddClient}
          onOpenAiModal={handleOpenAiModal}
        />
      )}

      {activeTab === 'crm' && (
        <HeadhunterCRM
          leads={leads}
          onAddLead={handleAddLead}
          onUpdateLeadStage={handleUpdateLeadStage}
          onOpenAiModal={handleOpenAiModal}
        />
      )}

      {activeTab === 'vagas' && (
        <HeadhunterVagas
          jobs={jobs}
          clients={clients}
          onAddJob={handleAddJob}
          onFinalizeJob={handleFinalizeJob}
          onOpenAiModal={handleOpenAiModal}
        />
      )}

      {activeTab === 'candidatos' && (
        <HeadhunterCandidatos
          candidates={candidates}
          jobs={jobs}
          onAddCandidate={handleAddCandidate}
          onOpenAiModal={handleOpenAiModal}
        />
      )}

      {activeTab === 'pipeline' && (
        <HeadhunterPipeline
          jobs={jobs}
          candidates={candidates}
          clients={clients}
          onOpenAiModal={handleOpenAiModal}
        />
      )}

      {activeTab === 'entrevistas' && (
        <HeadhunterEntrevistas
          interviews={interviews}
          jobs={jobs}
          clients={clients}
          onAddInterview={handleAddInterview}
          onOpenAiModal={handleOpenAiModal}
        />
      )}

      {activeTab === 'contratacoes' && (
        <HeadhunterContratacoes
          hirings={hirings}
          onOpenAiModal={handleOpenAiModal}
        />
      )}

      {activeTab === 'agenda' && (
        <HeadhunterAgenda
          events={events}
          onAddEvent={handleAddEvent}
        />
      )}

      {activeTab === 'comissoes' && (
        <HeadhunterComissoes
          commissions={commissions}
          onAddCommission={handleAddCommission}
          onOpenAiModal={handleOpenAiModal}
        />
      )}

      {activeTab === 'financeiro' && (
        <HeadhunterFinanceiro
          financial={financial}
          onAddFinanceItem={handleAddFinanceItem}
          onOpenAiModal={handleOpenAiModal}
        />
      )}

      {activeTab === 'despesas' && (
        <HeadhunterDespesas
          expenses={expenses}
          clients={clients}
          jobs={jobs}
          onAddExpense={handleAddExpense}
        />
      )}

      {activeTab === 'contratos' && (
        <HeadhunterContratos
          contracts={contracts}
          clients={clients}
          onAddContract={handleAddContract}
          onOpenAiModal={handleOpenAiModal}
        />
      )}

      {activeTab === 'relatorios' && (
        <HeadhunterRelatorios
          onOpenAiModal={handleOpenAiModal}
        />
      )}

      {/* Centralized Headhunter AI Modal */}
      <HeadhunterAiModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        actionType={aiActionType}
        initialData={aiInitialData}
      />
    </div>
  );
};
