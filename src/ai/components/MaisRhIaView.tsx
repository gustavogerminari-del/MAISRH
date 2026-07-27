import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  FileText,
  UserCheck,
  Trophy,
  MessageSquare,
  Database,
  Plus,
  BarChart2,
  Wand2,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  Award,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

import { IaAnalise } from '../types';
import { getIaAnalises } from '../aiAnalysesStore';
import { JobGeneratorModal } from './JobGeneratorModal';
import { CandidateScreeningModal } from './CandidateScreeningModal';
import { InterviewAssistantModal } from './InterviewAssistantModal';
import { CandidateRankingView } from './CandidateRankingView';
import { MaisRhIaChatModal } from './MaisRhIaChatModal';

export const MaisRhIaView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'banco_analises' | 'gerador_vagas' | 'triagem' | 'ranking' | 'entrevista' | 'chat'>('overview');
  const [analises, setAnalises] = useState<IaAnalise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [showJobGenModal, setShowJobGenModal] = useState(false);
  const [showScreeningModal, setShowScreeningModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  useEffect(() => {
    loadAnalises();
  }, []);

  const loadAnalises = () => {
    const list = getIaAnalises();
    setAnalises(list);
  };

  const filteredAnalises = analises.filter(a =>
    a.candidatoNome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.vagaTitulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.analise?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const averageScore = analises.length > 0
    ? Math.round(analises.reduce((acc, curr) => acc + curr.pontuacao, 0) / analises.length)
    : 85;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Module Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-8 border border-emerald-800/40 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Módulo Oficial MAIS RH IA
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px]">
                NOVO
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              🤖 MAIS RH IA
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
              Plataforma de inteligência artificial preditiva para atração, recrutamento e seleção de talentos com triagem automatizada, gerador de vagas e assistente de entrevistas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowChatModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-amber-300" />
              <span>Abrir Chat IA</span>
            </button>

            <button
              onClick={() => setShowJobGenModal(true)}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-2xl transition-all cursor-pointer"
            >
              <Wand2 className="w-4 h-4 text-amber-300" />
              <span>Criar Vaga IA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none gap-2 pb-1">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'overview'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Visão Geral & Indicadores</span>
        </button>

        <button
          onClick={() => setActiveSubTab('banco_analises')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'banco_analises'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Database className="w-4 h-4 text-amber-300" />
          <span>Banco ia_analises ({analises.length})</span>
        </button>

        <button
          onClick={() => setShowJobGenModal(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-black bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer"
        >
          <Wand2 className="w-4 h-4 text-emerald-600" />
          <span>1. Gerador de Vagas</span>
        </button>

        <button
          onClick={() => {
            setSelectedCandidate({
              id: 'cand-001',
              name: 'Lucas Andrade Ferreira',
              role: 'Dev Full Stack',
              summary: 'Experiência prévia com React, Node.js e TypeScript em projetos corporativos de grande porte.'
            });
            setShowScreeningModal(true);
          }}
          className="px-4 py-2.5 rounded-xl text-xs font-black bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer"
        >
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>2. Triagem de Currículos</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ranking')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'ranking'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-300" />
          <span>4. Ranking de Candidatos</span>
        </button>

        <button
          onClick={() => setShowInterviewModal(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-black bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span>3. Assistente de Entrevista</span>
        </button>
      </div>

      {/* TAB CONTENT: Overview */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Total de Análises
                </span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Database className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{analises.length}</p>
              <p className="text-xs text-slate-500 mt-1">Registros na tabela ia_analises</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Média de Aderência %
                </span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{averageScore}%</p>
              <p className="text-xs text-emerald-600 font-bold mt-1">Compatibilidade geral excelente</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Recomendados
                </span>
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {analises.filter(a => a.recomendacao.includes('Recomendado')).length}
              </p>
              <p className="text-xs text-slate-500 mt-1">Prontos para contratação</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Assistente IA
                </span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Bot className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">Ativo</p>
              <p className="text-xs text-slate-500 mt-1">Pronto para atendimento em tempo real</p>
            </div>
          </div>

          {/* Quick Action Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 hover:border-emerald-300 transition-all">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <Wand2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">1. Gerador de Vagas</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Crie títulos profissionais, resumos executivos, requisitos técnicos e pacotes de benefícios em segundos com IA.
              </p>
              <button
                onClick={() => setShowJobGenModal(true)}
                className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Gerar Descrição de Vaga →
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 hover:border-emerald-300 transition-all">
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">2. Triagem de Currículos</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Extraia experiências, identifique pontos fortes/fracos e gere nota de compatibilidade % automática.
              </p>
              <button
                onClick={() => {
                  setSelectedCandidate({
                    id: 'cand-001',
                    name: 'Lucas Andrade Ferreira',
                    role: 'Dev Full Stack',
                    summary: 'Perfil especialista em TypeScript, React e NodeJS.'
                  });
                  setShowScreeningModal(true);
                }}
                className="w-full py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Fazer Triagem com IA →
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 hover:border-emerald-300 transition-all">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">3. Assistente de Entrevista</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Gere roteiros customizados por cargo e pareceres conclusivos de avaliação pós-entrevista.
              </p>
              <button
                onClick={() => setShowInterviewModal(true)}
                className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Abrir Roteiro de Entrevista →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Banco ia_analises */}
      {activeSubTab === 'banco_analises' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-black text-slate-900">Banco de Dados: ia_analises</h2>
              </div>
              <p className="text-xs text-slate-500">
                Histórico de avaliações, pareceres e pontuações % registradas no sistema.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por candidato ou vaga..."
                  className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden"
                />
              </div>
              <button
                onClick={loadAnalises}
                className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Candidato</th>
                  <th className="py-3 px-4">Vaga</th>
                  <th className="py-3 px-4">Pontuação %</th>
                  <th className="py-3 px-4">Recomendação</th>
                  <th className="py-3 px-4">Data Análise</th>
                  <th className="py-3 px-4">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredAnalises.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{item.candidatoNome || item.candidatoId}</td>
                    <td className="py-3 px-4 font-medium text-slate-600">{item.vagaTitulo || item.vagaId}</td>
                    <td className="py-3 px-4">
                      <span className="font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        {item.pontuacao}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800">{item.recomendacao}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(item.dataCriacao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          setSelectedCandidate({
                            id: item.candidatoId,
                            name: item.candidatoNome,
                            appliedJobTitle: item.vagaTitulo,
                          });
                          setShowScreeningModal(true);
                        }}
                        className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Ranking */}
      {activeSubTab === 'ranking' && <CandidateRankingView />}

      {/* Modals */}
      <JobGeneratorModal
        isOpen={showJobGenModal}
        onClose={() => setShowJobGenModal(false)}
      />

      <CandidateScreeningModal
        isOpen={showScreeningModal}
        onClose={() => setShowScreeningModal(false)}
        candidate={selectedCandidate}
        onAnaliseSaved={loadAnalises}
      />

      <InterviewAssistantModal
        isOpen={showInterviewModal}
        onClose={() => setShowInterviewModal(false)}
      />

      <MaisRhIaChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
      />
    </div>
  );
};
