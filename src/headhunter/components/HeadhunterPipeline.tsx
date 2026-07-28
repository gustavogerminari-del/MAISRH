import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Briefcase, 
  Sparkles,
  List,
  Columns,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Building2
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
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedJobFilter, setSelectedJobFilter] = useState('Todas');
  const [selectedClientFilter, setSelectedClientFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const pipelineStages = [
    'Mapeado',
    'Abordado',
    'Interessado',
    'Triagem',
    'Entrevista Headhunter',
    'Apresentado ao Cliente',
    'Entrevista Cliente',
    'Referências',
    'Proposta',
    'Contratado',
    'Reprovado',
    'Desistiu'
  ];

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.cargoAtual.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJob = selectedJobFilter === 'Todas' || c.vagaTitulo === selectedJobFilter;
    const matchesClient = selectedClientFilter === 'Todos' || c.clienteNome === selectedClientFilter;
    return matchesSearch && matchesJob && matchesClient;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Processos Seletivos & Pipeline Kanban</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Acompanhe a movimentação de candidatos executivos por vaga e cliente através das etapas operacionais.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                viewMode === 'kanban' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                viewMode === 'list' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista por Vaga</span>
            </button>
          </div>

          <button
            onClick={() => onOpenAiModal('alertarVagasParadas')}
            className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Alertar Parados IA</span>
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por candidato ou cargo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <select
          value={selectedJobFilter}
          onChange={e => setSelectedJobFilter(e.target.value)}
          className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
        >
          <option value="Todas">Filtrar por Vaga: Todas</option>
          {jobs.map(j => (
            <option key={j.id} value={j.cargo}>{j.cargo}</option>
          ))}
        </select>

        <select
          value={selectedClientFilter}
          onChange={e => setSelectedClientFilter(e.target.value)}
          className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
        >
          <option value="Todos">Filtrar por Cliente: Todos</option>
          {clients.map(c => (
            <option key={c.id} value={c.nomeFantasia}>{c.nomeFantasia}</option>
          ))}
        </select>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
          {pipelineStages.map(stage => {
            const stageCandidates = filteredCandidates.filter(c => (c.etapaPipeline || 'Mapeado') === stage);

            return (
              <div key={stage} className="w-72 shrink-0 bg-slate-100/70 p-3 rounded-2xl border border-slate-200 flex flex-col max-h-[700px]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{stage}</h4>
                  <span className="bg-white px-2 py-0.5 rounded-full text-[11px] font-black text-indigo-600 border border-slate-200">
                    {stageCandidates.length}
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                  {stageCandidates.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-[11px] border border-dashed border-slate-300 rounded-xl">
                      Nenhum candidato
                    </div>
                  ) : (
                    stageCandidates.map(c => (
                      <div key={c.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2 hover:border-slate-300 transition-all">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="text-xs font-black text-slate-900">{c.nome}</h5>
                            <p className="text-[11px] text-slate-500 font-bold">{c.cargoAtual}</p>
                          </div>
                          <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                            {c.compatibilidadePercent}% Match
                          </span>
                        </div>

                        {c.vagaTitulo && (
                          <div className="text-[10px] font-bold text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            Vaga: {c.vagaTitulo}
                            <span className="block text-slate-400 font-medium">{c.clienteNome}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                          <span>Salário: R$ {(c.pretensaoSalarial / 1000).toFixed(0)}k</span>
                          <span className="font-bold text-emerald-600">{c.classificacao || 'Ativo'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List Mode */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {jobs.map(job => {
            const jobCandidates = filteredCandidates.filter(c => c.vagaId === job.id || c.vagaTitulo === job.cargo);

            return (
              <div key={job.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-base font-black text-slate-900">{job.cargo}</h3>
                      <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-indigo-100 text-indigo-800">
                        {job.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Cliente: <strong className="text-slate-800">{job.clienteNome}</strong> • Consultor: {job.consultorResponsavel}
                    </p>
                  </div>

                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
                    Comissão Estimada: R$ {job.comissaoCalculada.toLocaleString('pt-BR')}
                  </span>
                </div>

                {/* Candidate list for this job */}
                <div className="space-y-2">
                  {jobCandidates.length === 0 ? (
                    <p className="text-xs text-slate-400 p-3 bg-slate-50 rounded-xl">Sem candidatos vinculados a esta vaga.</p>
                  ) : (
                    jobCandidates.map(c => (
                      <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-3">
                        <div>
                          <strong className="text-slate-900 font-bold">{c.nome}</strong>
                          <span className="text-slate-500 text-[11px] block">{c.cargoAtual}</span>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 font-extrabold text-[10px] rounded-lg">
                            Etapa: {c.etapaPipeline}
                          </span>
                          <span className="font-extrabold text-emerald-600">
                            {c.compatibilidadePercent}% Match
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
