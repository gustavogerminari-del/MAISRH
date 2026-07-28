import React, { useState, useEffect } from 'react';
import { HeadhunterDashboard } from './components/HeadhunterDashboard';
import { HeadhunterClientes } from './components/HeadhunterClientes';
import { HeadhunterCRM } from './components/HeadhunterCRM';
import { HeadhunterComissoes } from './components/HeadhunterComissoes';
import { HeadhunterFinanceiro } from './components/HeadhunterFinanceiro';
import { HeadhunterDespesas } from './components/HeadhunterDespesas';
import { HeadhunterContratos } from './components/HeadhunterContratos';
import { HeadhunterRelatorios } from './components/HeadhunterRelatorios';
import { HeadhunterSidebar } from './components/HeadhunterSidebar';

// Unified Recruitment Core Modules
import { 
  UnifiedJobsView,
  UnifiedTalentBankView,
  UnifiedPipelineView,
  UnifiedInterviewsView,
  UnifiedAgendaView,
  UnifiedContratacoesView,
  UnifiedContextualAiModal,
  recruitmentService,
  UnifiedJob,
  UnifiedCandidate,
  UnifiedInterview,
  UnifiedHiring,
  UnifiedAgendaEvent
} from '../recruitment-core';

import { 
  MOCK_HEADHUNTER_CLIENTS, 
  MOCK_HEADHUNTER_LEADS, 
  MOCK_HEADHUNTER_COMMISSIONS, 
  MOCK_HEADHUNTER_FINANCIAL, 
  MOCK_HEADHUNTER_EXPENSES, 
  MOCK_HEADHUNTER_CONTRACTS 
} from './mockData';

import { 
  HeadhunterClient, 
  HeadhunterLead, 
  HeadhunterCommission, 
  HeadhunterFinanceItem, 
  HeadhunterExpense, 
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

const STORAGE_KEY = 'mais_rh_headhunter_data_v2';

export const HeadhunterView: React.FC<HeadhunterViewProps> = ({ initialSubTab = 'dashboard' }) => {
  const [activeTab, setActiveTab] = useState<HeadhunterSubTab>(initialSubTab);
  const [selectedJobForPipeline, setSelectedJobForPipeline] = useState<UnifiedJob | null>(null);

  // Initialize unified shared data via recruitmentService
  const [jobs, setJobs] = useState<UnifiedJob[]>(() => recruitmentService.getJobs('headhunter'));
  const [candidates, setCandidates] = useState<UnifiedCandidate[]>(() => recruitmentService.getCandidates('headhunter'));
  const [interviews, setInterviews] = useState<UnifiedInterview[]>(() => recruitmentService.getInterviews('headhunter'));
  const [hirings, setHirings] = useState<UnifiedHiring[]>(() => recruitmentService.getHirings('headhunter'));
  const [agendaEvents, setAgendaEvents] = useState<UnifiedAgendaEvent[]>(() => recruitmentService.getAgendaEvents('headhunter'));

  // Exclusive Headhunter modules
  const [clients, setClients] = useState<HeadhunterClient[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_clients`);
    return saved ? JSON.parse(saved) : MOCK_HEADHUNTER_CLIENTS;
  });

  const [leads, setLeads] = useState<HeadhunterLead[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_leads`);
    return saved ? JSON.parse(saved) : MOCK_HEADHUNTER_LEADS;
  });

  const [commissions, setCommissions] = useState<HeadhunterCommission[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_commissions`);
    return saved ? JSON.parse(saved) : MOCK_HEADHUNTER_COMMISSIONS;
  });

  const [financial, setFinancial] = useState<HeadhunterFinanceItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_financial`);
    return saved ? JSON.parse(saved) : MOCK_HEADHUNTER_FINANCIAL;
  });

  const [expenses, setExpenses] = useState<HeadhunterExpense[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_expenses`);
    return saved ? JSON.parse(saved) : MOCK_HEADHUNTER_EXPENSES;
  });

  const [contracts, setContracts] = useState<HeadhunterContract[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_contracts`);
    return saved ? JSON.parse(saved) : MOCK_HEADHUNTER_CONTRACTS;
  });

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_clients`, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_leads`, JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_jobs`, JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_candidates`, JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_interviews`, JSON.stringify(interviews));
  }, [interviews]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_hirings`, JSON.stringify(hirings));
  }, [hirings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_commissions`, JSON.stringify(commissions));
  }, [commissions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_financial`, JSON.stringify(financial));
  }, [financial]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_agenda`, JSON.stringify(agendaEvents));
  }, [agendaEvents]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_contracts`, JSON.stringify(contracts));
  }, [contracts]);

  // AI Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiActionType, setAiActionType] = useState('resumoExecutivo');
  const [aiInitialData, setAiInitialData] = useState<any>(null);

  const handleOpenAiModal = (type: string, data?: any) => {
    setAiActionType(type);
    setAiInitialData(data);
    setAiModalOpen(true);
  };

  // Handlers for state updates
  const handleAddClient = (cli: HeadhunterClient) => setClients([cli, ...clients]);
  const handleAddLead = (ld: HeadhunterLead) => setLeads([ld, ...leads]);
  const handleUpdateLeadStage = (id: string, stage: LeadStage) => {
    setLeads(leads.map(l => l.id === id ? { ...l, etapa: stage } : l));
  };

  const handleAddJob = (j: UnifiedJob) => setJobs([j, ...jobs]);
  const handleAddCandidate = (c: UnifiedCandidate) => setCandidates([c, ...candidates]);
  const handleAddInterview = (i: UnifiedInterview) => setInterviews([i, ...interviews]);
  const handleAddHiring = (h: UnifiedHiring) => setHirings([h, ...hirings]);

  const handleAddCommission = (c: HeadhunterCommission) => setCommissions([c, ...commissions]);
  const handleAddFinanceItem = (f: HeadhunterFinanceItem) => setFinancial([f, ...financial]);
  const handleAddExpense = (e: HeadhunterExpense) => setExpenses([e, ...expenses]);
  const handleAddEvent = (e: UnifiedAgendaEvent) => setAgendaEvents([e, ...agendaEvents]);
  const handleAddContract = (c: HeadhunterContract) => setContracts([c, ...contracts]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start w-full min-h-[calc(100vh-100px)]">
      {/* Headhunter Internal Vertical Sidebar */}
      <HeadhunterSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Page Content */}
      <main className="flex-1 min-w-0 w-full space-y-6">
        {activeTab === 'dashboard' && (
          <HeadhunterDashboard
            clients={clients}
            jobs={jobs as any}
            commissions={commissions}
            expenses={expenses}
            interviews={interviews as any}
            events={agendaEvents as any}
            leads={leads}
            candidates={candidates as any}
            financial={financial}
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
          clients={clients}
          onAddLead={handleAddLead}
          onUpdateLeadStage={handleUpdateLeadStage}
          onOpenAiModal={handleOpenAiModal}
        />
      )}

      {activeTab === 'vagas' && (
        <UnifiedJobsView
          origemProcesso="headhunter"
          jobs={jobs}
          candidates={candidates}
          interviews={interviews}
          clients={clients}
          onUpdateJobs={updatedJobs => setJobs(updatedJobs)}
          onOpenAiModal={handleOpenAiModal}
        />
      )}

      {activeTab === 'candidatos' && (
        <UnifiedTalentBankView
          origemProcesso="headhunter"
          candidates={candidates}
          jobs={jobs}
          onUpdateCandidates={updated => setCandidates(updated)}
          onOpenAiModal={handleOpenAiModal}
        />
      )}

      {activeTab === 'pipeline' && (
        <UnifiedPipelineView
          origemProcesso="headhunter"
          job={jobs[0] || { id: 'vaga-0', titulo: 'Vaga Selecionada', origemProcesso: 'headhunter' }}
          candidates={candidates}
          onBack={() => setActiveTab('vagas')}
          onOpenAiModal={handleOpenAiModal}
        />
      )}

      {activeTab === 'entrevistas' && (
        <UnifiedInterviewsView
          origemProcesso="headhunter"
          interviews={interviews}
          onScheduleInterview={newInt => setInterviews([newInt, ...interviews])}
          onOpenAiModal={handleOpenAiModal}
        />
      )}

      {activeTab === 'contratacoes' && (
        <UnifiedContratacoesView
          origemProcesso="headhunter"
          hirings={hirings}
          onOpenAiModal={handleOpenAiModal}
        />
      )}

      {activeTab === 'agenda' && (
        <UnifiedAgendaView
          origemProcesso="headhunter"
          events={agendaEvents}
          onAddEvent={evt => setAgendaEvents([evt, ...agendaEvents])}
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
          expenses={expenses}
          onAddFinanceItem={handleAddFinanceItem}
          onOpenAiModal={handleOpenAiModal}
        />
      )}

      {activeTab === 'despesas' && (
        <HeadhunterDespesas
          expenses={expenses}
          clients={clients}
          jobs={jobs as any}
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
          jobs={jobs as any}
          clients={clients}
          commissions={commissions}
          financial={financial}
          onOpenAiModal={handleOpenAiModal}
        />
      )}
      </main>

      {/* Centralized Contextual AI Modal */}
      {aiModalOpen && (
        <UnifiedContextualAiModal
          origemProcesso="headhunter"
          initialActionType={aiActionType}
          initialData={aiInitialData}
          onClose={() => setAiModalOpen(false)}
        />
      )}
    </div>
  );
};
