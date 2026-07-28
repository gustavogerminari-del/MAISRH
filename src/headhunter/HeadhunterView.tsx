import React, { useState, useEffect } from 'react';
import { HeadhunterDashboard } from './components/HeadhunterDashboard';
import { HeadhunterClientes } from './components/HeadhunterClientes';
import { HeadhunterComercial } from './components/HeadhunterComercial';
import { HeadhunterFinanceiro } from './components/HeadhunterFinanceiro';

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
  MOCK_HEADHUNTER_CONTRACTS,
  MOCK_HEADHUNTER_PROPOSALS
} from './mockData';

import { 
  HeadhunterClient, 
  HeadhunterLead, 
  HeadhunterCommission, 
  HeadhunterFinanceItem, 
  HeadhunterExpense, 
  HeadhunterContract,
  HeadhunterProposal,
  LeadStage,
  ProposalStatus,
  ContractStatus
} from './types';

export type HeadhunterSubTab = 
  | 'dashboard'
  | 'clientes'
  | 'comercial'
  | 'financeiro'
  // Backward compatibility alias for former loose tabs:
  | 'crm'
  | 'vagas'
  | 'candidatos'
  | 'pipeline'
  | 'entrevistas'
  | 'contratacoes'
  | 'agenda'
  | 'comissoes'
  | 'despesas'
  | 'contratos'
  | 'relatorios';

interface HeadhunterViewProps {
  initialSubTab?: HeadhunterSubTab;
}

const STORAGE_KEY = 'mais_rh_headhunter_data_v2';

export const HeadhunterView: React.FC<HeadhunterViewProps> = ({ initialSubTab = 'dashboard' }) => {
  const [activeTab, setActiveTab] = useState<HeadhunterSubTab>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      // Map former loose routes to the 4 main sections
      if (initialSubTab === 'crm' || initialSubTab === 'contratos') {
        setActiveTab('comercial');
      } else if (initialSubTab === 'comissoes' || initialSubTab === 'despesas' || initialSubTab === 'relatorios') {
        setActiveTab('financeiro');
      } else {
        setActiveTab(initialSubTab);
      }
    }
  }, [initialSubTab]);

  // Unified shared data via recruitmentService
  const [jobs, setJobs] = useState<UnifiedJob[]>(() => recruitmentService.getJobs('headhunter'));
  const [candidates, setCandidates] = useState<UnifiedCandidate[]>(() => recruitmentService.getCandidates('headhunter'));
  const [interviews, setInterviews] = useState<UnifiedInterview[]>(() => recruitmentService.getInterviews('headhunter'));
  const [hirings, setHirings] = useState<UnifiedHiring[]>(() => recruitmentService.getHirings('headhunter'));
  const [agendaEvents, setAgendaEvents] = useState<UnifiedAgendaEvent[]>(() => recruitmentService.getAgendaEvents('headhunter'));

  // Headhunter state
  const [clients, setClients] = useState<HeadhunterClient[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_clients`);
    return saved ? JSON.parse(saved) : MOCK_HEADHUNTER_CLIENTS;
  });

  const [leads, setLeads] = useState<HeadhunterLead[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_leads`);
    return saved ? JSON.parse(saved) : MOCK_HEADHUNTER_LEADS;
  });

  const [proposals, setProposals] = useState<HeadhunterProposal[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_proposals`);
    return saved ? JSON.parse(saved) : MOCK_HEADHUNTER_PROPOSALS;
  });

  const [contracts, setContracts] = useState<HeadhunterContract[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_contracts`);
    return saved ? JSON.parse(saved) : MOCK_HEADHUNTER_CONTRACTS;
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

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_clients`, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_leads`, JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_proposals`, JSON.stringify(proposals));
  }, [proposals]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_contracts`, JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_commissions`, JSON.stringify(commissions));
  }, [commissions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_financial`, JSON.stringify(financial));
  }, [financial]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(expenses));
  }, [expenses]);

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

  const handleAddProposal = (prop: HeadhunterProposal) => setProposals([prop, ...proposals]);
  const handleUpdateProposalStatus = (id: string, status: ProposalStatus) => {
    setProposals(proposals.map(p => p.id === id ? { ...p, status } : p));
  };

  const handleAddContract = (ctr: HeadhunterContract) => setContracts([ctr, ...contracts]);
  const handleUpdateContractStatus = (id: string, status: ContractStatus) => {
    setContracts(contracts.map(c => c.id === id ? { ...c, status } : c));
  };

  const handleCreateJobFromContract = (ctr: HeadhunterContract) => {
    // Creates a new job in the Recruitment core operational layer linked to this contract
    const newJob: UnifiedJob = {
      id: `vaga-${Date.now()}`,
      empresaId: 'emp-001',
      titulo: ctr.tituloContrato.replace('Contrato ', '') || 'Vaga Executive Search',
      cargo: ctr.tituloContrato || 'Executivo',
      descricao: ctr.escopo || 'Busca executiva para posição sênior.',
      requisitos: ['Experiência executiva prévia', 'Inglês fluente'],
      salario: 'A combinar',
      tipoContrato: 'CLT',
      location: 'São Paulo, SP',
      department: 'Diretoria / Executivo',
      clienteId: ctr.clienteId,
      clienteNome: ctr.clienteNome,
      contratoId: ctr.id,
      tipoVaga: 'headhunter',
      origemProcesso: 'headhunter',
      status: 'Aberta',
      dataCriacao: new Date().toISOString().split('T')[0],
      dataAbertura: new Date().toISOString().split('T')[0],
      valorVaga: ctr.valorContrato || 25000,
      consultorResponsavel: ctr.responsavelComercial || 'Carlos Headhunter',
      quantidadeVagas: 1,
      candidatosIds: []
    };

    recruitmentService.saveJob(newJob);
    setJobs([newJob, ...jobs]);
    alert(`Vaga "${newJob.titulo}" criada com sucesso no módulo de Recrutamento para o cliente ${ctr.clienteNome}!`);
  };

  return (
    <div className="w-full space-y-6">
      <main className="w-full space-y-6">
        {(activeTab === 'dashboard') && (
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
            onNavigateTab={tab => {
              if (tab === 'crm' || tab === 'contratos') setActiveTab('comercial');
              else if (tab === 'comissoes' || tab === 'despesas' || tab === 'relatorios') setActiveTab('financeiro');
              else setActiveTab(tab);
            }}
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

        {(activeTab === 'comercial' || activeTab === 'crm' || activeTab === 'contratos') && (
          <HeadhunterComercial
            leads={leads}
            clients={clients}
            proposals={proposals}
            contracts={contracts}
            onAddLead={handleAddLead}
            onUpdateLeadStage={handleUpdateLeadStage}
            onAddProposal={handleAddProposal}
            onUpdateProposalStatus={handleUpdateProposalStatus}
            onAddContract={handleAddContract}
            onUpdateContractStatus={handleUpdateContractStatus}
            onCreateJobFromContract={handleCreateJobFromContract}
            onOpenAiModal={handleOpenAiModal}
          />
        )}

        {(activeTab === 'financeiro' || activeTab === 'comissoes' || activeTab === 'despesas' || activeTab === 'relatorios') && (
          <HeadhunterFinanceiro
            financial={financial}
            expenses={expenses}
            clients={clients}
            jobs={jobs}
            candidates={candidates}
            hirings={hirings}
            contracts={contracts}
            proposals={proposals}
            onAddFinanceItem={item => setFinancial([item, ...financial])}
            onOpenAiModal={handleOpenAiModal}
          />
        )}

        {/* Operational views routed when accessed directly from recruitment links */}
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
