import React, { useState, useEffect } from 'react';
import { HeadhunterDashboard } from './components/HeadhunterDashboard';
import { HeadhunterClientes } from './components/HeadhunterClientes';
import { HeadhunterComercial } from './components/HeadhunterComercial';
import { HeadhunterFinanceiro } from './components/HeadhunterFinanceiro';
import { HeadhunterCandidatos } from './components/HeadhunterCandidatos';
import { HeadhunterPortalCliente } from './components/HeadhunterPortalCliente';
import { HeadhunterCandidate } from './types';

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
import { HeadhunterDataService, syncHeadhunterDataWithFirestore } from './services/headhunterDataService';
import { HeadhunterFinanceService, syncHeadhunterFinanceWithFirestore } from './services/headhunterFinanceService';

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
  | 'relatorios'
  | 'portal_cliente';

interface HeadhunterViewProps {
  initialSubTab?: HeadhunterSubTab;
  selectedFinancialId?: string | null;
}

const STORAGE_KEY = 'mais_rh_headhunter_data_v2';

export const HeadhunterView: React.FC<HeadhunterViewProps> = ({ initialSubTab = 'dashboard', selectedFinancialId }) => {
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

  // Headhunter state from Firestore service
  const [clients, setClients] = useState<HeadhunterClient[]>(() => HeadhunterDataService.getClients());
  const [leads, setLeads] = useState<HeadhunterLead[]>(() => HeadhunterDataService.getLeads());
  const [proposals, setProposals] = useState<HeadhunterProposal[]>(() => HeadhunterDataService.getProposals());
  const [contracts, setContracts] = useState<HeadhunterContract[]>(() => HeadhunterDataService.getContracts());
  const [commissions, setCommissions] = useState<HeadhunterCommission[]>(() => HeadhunterFinanceService.getComissoes());
  const [financial, setFinancial] = useState<HeadhunterFinanceItem[]>([]);
  const [expenses, setExpenses] = useState<HeadhunterExpense[]>(() => HeadhunterFinanceService.getDespesas());

  // Background refresh when Firestore loads
  useEffect(() => {
    async function loadData() {
      await Promise.all([
        syncHeadhunterDataWithFirestore(),
        syncHeadhunterFinanceWithFirestore()
      ]);
      setClients(HeadhunterDataService.getClients());
      setLeads(HeadhunterDataService.getLeads());
      setProposals(HeadhunterDataService.getProposals());
      setContracts(HeadhunterDataService.getContracts());
      setCommissions(HeadhunterFinanceService.getComissoes());
      setExpenses(HeadhunterFinanceService.getDespesas());
      setJobs(recruitmentService.getJobs('headhunter'));
      setCandidates(recruitmentService.getCandidates('headhunter'));
      setInterviews(recruitmentService.getInterviews('headhunter'));
      setHirings(recruitmentService.getHirings('headhunter'));
      setAgendaEvents(recruitmentService.getAgendaEvents('headhunter'));
    }
    loadData();
  }, []);

  // AI Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiActionType, setAiActionType] = useState('resumoExecutivo');
  const [aiInitialData, setAiInitialData] = useState<any>(null);

  const handleOpenAiModal = (type: string, data?: any) => {
    setAiActionType(type);
    setAiInitialData(data);
    setAiModalOpen(true);
  };

  // State Handlers with Firestore persistence
  const handleAddClient = (cli: HeadhunterClient) => {
    setClients([cli, ...clients]);
    HeadhunterDataService.saveClient(cli);
  };

  const handleAddLead = (ld: HeadhunterLead) => {
    setLeads([ld, ...leads]);
    HeadhunterDataService.saveLead(ld);
  };

  const handleUpdateLeadStage = (id: string, stage: LeadStage) => {
    const updated = leads.map(l => l.id === id ? { ...l, etapa: stage } : l);
    setLeads(updated);
    const target = updated.find(l => l.id === id);
    if (target) HeadhunterDataService.saveLead(target);
  };

  const handleAddProposal = (prop: HeadhunterProposal) => {
    setProposals([prop, ...proposals]);
    HeadhunterDataService.saveProposal(prop);
  };

  const handleUpdateProposalStatus = (id: string, status: ProposalStatus) => {
    const updated = proposals.map(p => p.id === id ? { ...p, status } : p);
    setProposals(updated);
    const target = updated.find(p => p.id === id);
    if (target) HeadhunterDataService.saveProposal(target);
  };

  const handleAddContract = (ctr: HeadhunterContract) => {
    setContracts([ctr, ...contracts]);
    HeadhunterDataService.saveContract(ctr);
  };

  const handleUpdateContractStatus = (id: string, status: ContractStatus) => {
    const updated = contracts.map(c => c.id === id ? { ...c, status } : c);
    setContracts(updated);
    const target = updated.find(c => c.id === id);
    if (target) HeadhunterDataService.saveContract(target);
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
      {/* Subtab Navigation Header */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Visão Geral
        </button>

        <button
          onClick={() => setActiveTab('prospeccao' as any)}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === ('prospeccao' as any) || activeTab === 'candidatos'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Candidatos Prospectados
        </button>

        <button
          onClick={() => setActiveTab('vagas')}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'vagas'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Vagas Busca Ativa
        </button>

        <button
          onClick={() => setActiveTab('clientes')}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'clientes'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Clientes
        </button>

        <button
          onClick={() => setActiveTab('comercial')}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'comercial' || activeTab === 'crm' || activeTab === 'contratos'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Comercial & CRM
        </button>

        <button
          onClick={() => setActiveTab('financeiro')}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'financeiro' || activeTab === 'comissoes' || activeTab === 'despesas' || activeTab === 'relatorios'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Financeiro
        </button>

        <button
          onClick={() => setActiveTab('portal_cliente')}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'portal_cliente'
              ? 'bg-indigo-900 text-white shadow-xs'
              : 'text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100'
          }`}
        >
          <span>Portal do Cliente</span>
        </button>
      </div>

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
              else if (tab === 'candidatos') setActiveTab('prospeccao' as any);
              else setActiveTab(tab);
            }}
            onOpenAiModal={handleOpenAiModal}
          />
        )}

        {(activeTab === ('prospeccao' as any) || activeTab === 'candidatos') && (
          <HeadhunterCandidatos
            candidates={candidates as any}
            jobs={jobs as any}
            onAddCandidate={(newCand) => {
              setCandidates([newCand as any, ...candidates]);
              recruitmentService.saveCandidate(newCand as any);
            }}
            onUpdateCandidate={(updatedCand) => {
              setCandidates(candidates.map(c => c.id === updatedCand.id ? (updatedCand as any) : c));
              recruitmentService.saveCandidate(updatedCand as any);
            }}
            onDeleteCandidate={(id) => {
              setCandidates(candidates.filter(c => c.id !== id));
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
            selectedFinancialId={selectedFinancialId}
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
        {activeTab === 'portal_cliente' && (
          <HeadhunterPortalCliente
            clients={clients}
            jobs={jobs as any}
            candidates={candidates as any}
            interviews={interviews as any}
            onUpdateCandidate={updatedCand => {
              setCandidates(candidates.map(c => c.id === updatedCand.id ? (updatedCand as any) : c));
              recruitmentService.saveCandidate(updatedCand as any);
            }}
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
