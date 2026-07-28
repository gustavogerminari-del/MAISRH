import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Briefcase, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles,
  List
} from 'lucide-react';
import { HeadhunterJob, HeadhunterCandidate, HeadhunterClient } from '../types';

interface HeadhunterPipelineProps {
  jobs: HeadhunterJob[];
  candidates: HeadhunterCandidate[];
  clients: HeadhunterClient[];
  onOpenAiModal: (type: string, data?: any) => void;
}

export const HeadhunterPipeline: React.FC<HeadhunterPipelineProps> = ({
  jobs,
  candidates,
  clients,
  onOpenAiModal
}) => {
  const [selectedClientFilter, setSelectedClientFilter] = useState('Todos');
  const [selectedConsultantFilter, setSelectedConsultantFilter] = useState('Todos');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('Todos');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('Todas');

  const filteredJobs = jobs.filter(j => {
    const matchClient = selectedClientFilter === 'Todos' || j.clienteNome === selectedClientFilter;
    const matchConsultant = selectedConsultantFilter === 'Todos' || j.consultorResponsavel === selectedConsultantFilter;
    const matchStatus = selectedStatusFilter === 'Todos' || j.status === selectedStatusFilter;
    const matchPriority = selectedPriorityFilter === 'Todas' || j.prioridade === selectedPriorityFilter;
    return matchClient && matchConsultant && matchStatus && matchPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
            <List className="w-3.5 h-3.5" />
            Visualização Padrão em Lista de Vagas & Funil
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Pipeline de Vagas & Candidatos em Acompanhamento</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidado por vaga listada: total de candidatos, triagem, entrevistas agendadas, propostas ativas e contratados.
          </p>
        </div>

        <button
          onClick={() => onOpenAiModal('alertarVagasParadas')}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Alertar Vagas Paradas IA</span>
        </button>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-medium">
        <div>
          <label className="block text-slate-500 font-bold mb-1">Filtrar Cliente</label>
          <select
            value={selectedClientFilter}
            onChange={e => setSelectedClientFilter(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
          >
            <option value="Todos">Todos os Clientes</option>
            {clients.map(c => (
              <option key={c.id} value={c.nomeFantasia}>{c.nomeFantasia}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-500 font-bold mb-1">Consultor Responsável</label>
          <select
            value={selectedConsultantFilter}
            onChange={e => setSelectedConsultantFilter(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
          >
            <option value="Todos">Todos os Consultores</option>
            <option value="Carlos Headhunter">Carlos Headhunter</option>
            <option value="Mariana Souza">Mariana Souza</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-500 font-bold mb-1">Status da Vaga</label>
          <select
            value={selectedStatusFilter}
            onChange={e => setSelectedStatusFilter(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Aberta">Aberta</option>
            <option value="Em Andamento">Em Andamento</option>
            <option value="Fechada">Fechada</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-500 font-bold mb-1">Prioridade</label>
          <select
            value={selectedPriorityFilter}
            onChange={e => setSelectedPriorityFilter(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
          >
            <option value="Todas">Todas as Prioridades</option>
            <option value="Urgente">Urgente</option>
            <option value="Alta">Alta</option>
            <option value="Média">Média</option>
            <option value="Baixa">Baixa</option>
          </select>
        </div>
      </div>

      {/* PIPELINE LIST TABLE / CARDS */}
      <div className="space-y-4">
        {filteredJobs.map(job => {
          const jobCandidates = candidates.filter(c => c.vagaId === job.id || c.vagaTitulo === job.cargo);
          const inTriagem = jobCandidates.filter(c => c.etapaPipeline === 'Triagem').length;
          const inEntrevistas = jobCandidates.filter(c => c.etapaPipeline === 'Entrevista Headhunter' || c.etapaPipeline === 'Entrevista Cliente').length;
          const inPropostas = jobCandidates.filter(c => c.etapaPipeline === 'Proposta').length;
          const inContratados = jobCandidates.filter(c => c.etapaPipeline === 'Contratado').length;
          const inReprovados = jobCandidates.filter(c => c.etapaPipeline === 'Reprovado').length;

          return (
            <div key={job.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-base font-black text-slate-900">{job.cargo}</h3>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-slate-100 text-slate-700">
                      {job.prioridade}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cliente: <strong className="text-slate-800">{job.clienteNome}</strong> • Consultor: {job.consultorResponsavel} • Abertura: {job.dataAbertura}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
                    Comissão: R$ {job.comissaoCalculada.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              {/* STAGE BREAKDOWN METRICS */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-extrabold block uppercase">Total Candidatos</span>
                  <strong className="text-base text-slate-900 font-black">{jobCandidates.length}</strong>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-amber-900">
                  <span className="text-[10px] font-extrabold block uppercase">Triagem</span>
                  <strong className="text-base font-black">{inTriagem}</strong>
                </div>
                <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-indigo-900">
                  <span className="text-[10px] font-extrabold block uppercase">Entrevistas</span>
                  <strong className="text-base font-black">{inEntrevistas}</strong>
                </div>
                <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 text-purple-900">
                  <span className="text-[10px] font-extrabold block uppercase">Propostas</span>
                  <strong className="text-base font-black">{inPropostas}</strong>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-emerald-900">
                  <span className="text-[10px] font-extrabold block uppercase">Contratados</span>
                  <strong className="text-base font-black">{inContratados}</strong>
                </div>
                <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 text-rose-900">
                  <span className="text-[10px] font-extrabold block uppercase">Reprovados</span>
                  <strong className="text-base font-black">{inReprovados}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
