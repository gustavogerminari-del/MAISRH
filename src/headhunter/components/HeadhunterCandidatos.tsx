import React, { useState } from 'react';
import { 
  Users, 
  Sparkles, 
  FileText, 
  Award, 
  Clock, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Briefcase,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { HeadhunterCandidate, HeadhunterJob } from '../types';

interface HeadhunterCandidatosProps {
  candidates: HeadhunterCandidate[];
  jobs: HeadhunterJob[];
  onAddCandidate: (candidate: HeadhunterCandidate) => void;
  onOpenAiModal: (type: string, data?: any) => void;
}

export const HeadhunterCandidatos: React.FC<HeadhunterCandidatosProps> = ({
  candidates,
  jobs,
  onAddCandidate,
  onOpenAiModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobFilter, setSelectedJobFilter] = useState('Todas');
  const [selectedCandidate, setSelectedCandidate] = useState<HeadhunterCandidate | null>(candidates[0] || null);

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.cargoAtual.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJob = selectedJobFilter === 'Todas' || c.vagaTitulo === selectedJobFilter;
    return matchesSearch && matchesJob;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Banco & Avaliação de Executivos</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Análise de currículos, triagem inteligente por IA, histórico de carreira e emissão de pareceres técnicos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAiModal('encontrarCandidatosIdeais')}
            className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Encontrar Candidatos Ideais com IA</span>
          </button>
        </div>
      </div>

      {/* Main split view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
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
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredCandidates.map(c => (
              <div
                key={c.id}
                onClick={() => setSelectedCandidate(c)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedCandidate?.id === c.id
                    ? 'bg-indigo-50/50 border-indigo-600 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{c.nome}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">{c.cargoAtual}</p>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-100 text-emerald-800">
                    {c.compatibilidadePercent}% Match
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-medium">Pretensão Salarial:</span>
                    <p className="font-bold text-slate-800">R$ {c.pretensaoSalarial.toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Etapa Actual:</span>
                    <p className="font-bold text-indigo-600">{c.etapaPipeline}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Candidate Profile */}
        <div className="lg:col-span-7">
          {selectedCandidate ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-black text-slate-900">{selectedCandidate.nome}</h3>
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                      Score IA: {selectedCandidate.triagemIaScore}/100
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedCandidate.cargoAtual} • Vaga: <strong className="text-slate-800">{selectedCandidate.vagaTitulo || 'Banco Geral'}</strong>
                  </p>
                </div>

                <button
                  onClick={() => onOpenAiModal('parecerTecnico', { candidateName: selectedCandidate.nome, currentRole: selectedCandidate.cargoAtual, jobTitle: selectedCandidate.vagaTitulo })}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Gerar Parecer Técnico IA</span>
                </button>
              </div>

              {/* TRIAGEM IA PARECER */}
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Análise Automatizada de Triagem por IA</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {selectedCandidate.triagemIaParecer}
                </p>
              </div>

              {/* PARECER TÉCNICO REGISTRADO */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Parecer Técnico do Headhunter</h4>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 font-medium leading-relaxed">
                  {selectedCandidate.parecerTecnico || 'Parecer em elaboração pelo consultor responsável.'}
                </div>
              </div>

              {/* LINHA DO TEMPO */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Linha do Tempo de Avaliação</h4>
                <div className="space-y-2">
                  {selectedCandidate.linhaDoTempo.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{item.titulo}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{item.data}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.detalhe}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
              Selecione um candidato para visualizar o perfil completo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
