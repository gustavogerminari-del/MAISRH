import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Users, 
  Sparkles, 
  UserCheck, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Briefcase, 
  MapPin, 
  Building2, 
  Clock, 
  MoreVertical, 
  FileText, 
  Phone, 
  Mail, 
  MessageCircle, 
  Download, 
  Plus, 
  Star, 
  ChevronRight,
  TrendingUp,
  Award,
  DollarSign
} from 'lucide-react';
import { 
  UnifiedJob, 
  UnifiedCandidate, 
  UnifiedCandidateProcess, 
  OrigemProcesso, 
  ProcessStage 
} from '../../types/recruitment';

interface UnifiedPipelineViewProps {
  job: UnifiedJob;
  candidates: UnifiedCandidate[];
  origemProcesso: OrigemProcesso;
  onBack: () => void;
  onSelectCandidate?: (candidate: UnifiedCandidate) => void;
  onScheduleInterview?: (candidate: UnifiedCandidate, job: UnifiedJob) => void;
  onOpenAiModal?: (type: string, data?: any) => void;
}

const STAGES: ProcessStage[] = [
  'Inscrito',
  'Triagem',
  'Entrevista RH',
  'Teste Técnico',
  'Entrevista Gestor',
  'Entrevista Headhunter',
  'Apresentado ao cliente',
  'Entrevista com cliente',
  'Proposta',
  'Contratado',
  'Reprovado',
  'Desistiu'
];

export const UnifiedPipelineView: React.FC<UnifiedPipelineViewProps> = ({
  job,
  candidates,
  origemProcesso,
  onBack,
  onSelectCandidate,
  onScheduleInterview,
  onOpenAiModal
}) => {
  const isHeadhunter = origemProcesso === 'headhunter';
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('Todos');

  // Filter candidates
  const filteredCandidates = candidates.filter(c => {
    const term = searchTerm.toLowerCase().trim();
    const candidateName = c.nome || (c as any).name || '';
    const emailStr = c.email || '';
    const cargoStr = c.cargoAtual || (c as any).cargo || '';
    const cidadeStr = c.cidade || '';

    const matchesSearch = !term || 
      candidateName.toLowerCase().includes(term) ||
      emailStr.toLowerCase().includes(term) ||
      cargoStr.toLowerCase().includes(term) ||
      cidadeStr.toLowerCase().includes(term);

    const candidateStage = c.currentStageId || 'Triagem';
    const matchesStage = selectedStage === 'Todos' || candidateStage === selectedStage;

    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  isHeadhunter ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800'
                }`}>
                  {isHeadhunter ? 'Pipeline Headhunter' : 'Pipeline Interno'}
                </span>
                {job.clienteNome && (
                  <span className="text-xs font-bold text-slate-500">
                    Cliente: <strong className="text-slate-800">{job.clienteNome}</strong>
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-slate-900">{job.titulo || job.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Lista
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Kanban
              </button>
            </div>

            {onOpenAiModal && (
              <button
                onClick={() => onOpenAiModal('compararCandidato', { jobTitle: job.titulo })}
                className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Triagem IA</span>
              </button>
            )}
          </div>
        </div>

        {/* Headhunter Specific Commercial Summary */}
        {isHeadhunter && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 text-xs">
            <div>
              <span className="text-indigo-600 font-bold block">Honorário Vaga</span>
              <strong className="text-indigo-950 font-black text-sm">
                R$ {(job.valorNegociado || job.valorCobrado || 0).toLocaleString('pt-BR')}
              </strong>
            </div>
            <div>
              <span className="text-indigo-600 font-bold block">Comissão Est.</span>
              <strong className="text-emerald-700 font-black text-sm">
                R$ {(job.comissaoCalculada || 0).toLocaleString('pt-BR')}
              </strong>
            </div>
            <div>
              <span className="text-indigo-600 font-bold block">Apresentação ao Cliente</span>
              <strong className="text-indigo-900 font-extrabold">Prazo SLA: {job.slaDias || 15} dias</strong>
            </div>
            <div>
              <span className="text-indigo-600 font-bold block">Candidatos no Funil</span>
              <strong className="text-indigo-950 font-black">{filteredCandidates.length} inscritos</strong>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, cargo ou cidade..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500">Etapa:</span>
            <select
              value={selectedStage}
              onChange={e => setSelectedStage(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
            >
              <option value="Todos">Todas as etapas ({candidates.length})</option>
              {STAGES.map(stg => (
                <option key={stg} value={stg}>{stg}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Candidates Content Area */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredCandidates.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
              Nenhum candidato encontrado nesta etapa.
            </div>
          ) : (
            filteredCandidates.map(c => (
              <div
                key={c.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-800 font-black text-sm flex items-center justify-center shrink-0 border border-indigo-200">
                    {(c.nome || (c as any).name || 'C').substring(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900">{c.nome || (c as any).name || 'Candidato Sem Nome'}</h4>
                      {c.compatibilidadePercent && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          {c.compatibilidadePercent}% IA Match
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      {c.cargoAtual} • <strong className="text-slate-700">{c.cidade || 'São Paulo'}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-xs">
                    <span className="text-slate-400 block font-medium">Etapa Atual</span>
                    <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100 inline-block">
                      {c.currentStageId || 'Triagem'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onScheduleInterview && (
                      <button
                        onClick={() => onScheduleInterview(c, job)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Agendar Entrevista
                      </button>
                    )}
                    {onSelectCandidate && (
                      <button
                        onClick={() => onSelectCandidate(c)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-2xs cursor-pointer"
                      >
                        Ver Perfil
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* KANBAN BOARD VIEW */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map(stg => {
            const stageCandidates = filteredCandidates.filter(c => (c.currentStageId || 'Triagem') === stg);
            return (
              <div key={stg} className="w-72 shrink-0 bg-slate-100/70 p-3 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-black text-slate-800">{stg}</h4>
                  <span className="bg-slate-200 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {stageCandidates.length}
                  </span>
                </div>

                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {stageCandidates.map(c => (
                    <div
                      key={c.id}
                      onClick={() => onSelectCandidate && onSelectCandidate(c)}
                      className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{c.nome || (c as any).name || 'Candidato Sem Nome'}</span>
                        {c.compatibilidadePercent && (
                          <span className="text-[10px] font-bold text-emerald-600">
                            {c.compatibilidadePercent}%
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium line-clamp-1">{c.cargoAtual}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
