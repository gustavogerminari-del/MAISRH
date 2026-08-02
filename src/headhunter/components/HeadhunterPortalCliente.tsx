import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Briefcase, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare, 
  Calendar, 
  Sparkles, 
  Send, 
  ShieldAlert, 
  Eye, 
  Award,
  ChevronRight,
  Filter,
  UserCheck,
  UserX,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { HeadhunterClient, HeadhunterJob, HeadhunterCandidate, HeadhunterInterview } from '../types';
import { HeadhunterDataService } from '../services/headhunterDataService';

interface HeadhunterPortalClienteProps {
  clients: HeadhunterClient[];
  jobs: HeadhunterJob[];
  candidates: HeadhunterCandidate[];
  interviews: HeadhunterInterview[];
  onUpdateCandidate: (updated: HeadhunterCandidate) => void;
  onOpenAiModal?: (type: string, data?: any) => void;
}

export interface ClientFeedback {
  feedbackId: string;
  candidateId: string;
  jobId: string;
  clientId: string;
  companyId: string;
  decisao: 'Aprovado para Entrevista' | 'Reprovado' | 'Solicitar mais informações' | 'Solicitar novo candidato' | 'Finalista' | 'Aprovado para Contratação';
  comentario: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export const HeadhunterPortalCliente: React.FC<HeadhunterPortalClienteProps> = ({
  clients = [],
  jobs = [],
  candidates = [],
  interviews = [],
  onUpdateCandidate,
  onOpenAiModal
}) => {
  // Selected Client context
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [selectedJobId, setSelectedJobId] = useState<string>('TODAS');
  const [activeTab, setActiveTab] = useState<'candidatos' | 'vagas' | 'entrevistas' | 'feedback_historico'>('candidatos');

  // Selected candidate detail drawer/modal in portal
  const [selectedCandidate, setSelectedCandidate] = useState<HeadhunterCandidate | null>(null);

  // Feedback Form State
  const [decisao, setDecisao] = useState<ClientFeedback['decisao']>('Aprovado para Entrevista');
  const [comentario, setComentario] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Filter Data by selected Client ONLY (Strict Multi-Client Isolation)
  const currentClient = clients.find(c => c.id === selectedClientId);

  const clientJobs = jobs.filter(j => j.clienteId === selectedClientId || j.clienteNome === currentClient?.nomeFantasia);

  const clientCandidates = candidates.filter(c => {
    const isJobMatch = selectedJobId === 'TODAS' 
      ? clientJobs.some(j => j.id === c.vagaId) 
      : c.vagaId === selectedJobId;
    
    const isPresented = 
      c.etapaHeadhunter === 'Vinculado à vaga' ||
      c.etapaHeadhunter === 'Entrevista' ||
      c.etapaHeadhunter === 'Contratado' ||
      c.etapaPipeline === 'Entrevista Cliente' ||
      c.etapaPipeline === 'Triagem' ||
      c.conviteEnviado ||
      c.convertidoCandidatoOficial;

    return isJobMatch && isPresented;
  });

  const clientInterviews = interviews.filter(i => i.clienteNome === currentClient?.nomeFantasia || clientJobs.some(j => j.id === i.vagaId));

  const handleSendFeedback = async (candidate: HeadhunterCandidate) => {
    if (!comentario.trim()) {
      alert('Por favor, informe uma observação ou comentário sobre o parecer.');
      return;
    }

    setSubmittingFeedback(true);
    const feedbackData: ClientFeedback = {
      feedbackId: `fb-${Date.now()}`,
      candidateId: candidate.id,
      jobId: candidate.vagaId || '',
      clientId: selectedClientId,
      companyId: candidate.empresaId || 'emp-001',
      decisao,
      comentario: comentario.trim(),
      userId: currentClient?.responsavel || 'Cliente Corporativo',
      userName: currentClient?.responsavel || 'Cliente',
      createdAt: new Date().toISOString()
    };

    // Determine new stage based on client decision
    let newStage = candidate.etapaHeadhunter;
    if (decisao === 'Aprovado para Entrevista') newStage = 'Entrevista';
    if (decisao === 'Reprovado') newStage = 'Recusado';
    if (decisao === 'Aprovado para Contratação') newStage = 'Contratado';

    const updatedCandidate: HeadhunterCandidate = {
      ...candidate,
      etapaHeadhunter: newStage,
      etapaPipeline: newStage,
      historico: [
        {
          data: new Date().toISOString().split('T')[0],
          evento: `Retorno do Cliente (${currentClient?.nomeFantasia || 'Cliente'}): ${decisao} - "${comentario.trim()}"`
        },
        ...candidate.historico
      ]
    };

    onUpdateCandidate(updatedCandidate);
    if (selectedCandidate?.id === candidate.id) {
      setSelectedCandidate(updatedCandidate);
    }

    setSubmittingFeedback(false);
    setComentario('');
    setFeedbackSuccess(`Feedback "${decisao}" registrado com sucesso para o consultor!`);
    setTimeout(() => setFeedbackSuccess(null), 4000);
  };

  if (clients.length === 0) {
    return (
      <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 space-y-3">
        <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Nenhum cliente cadastrado</h3>
        <p className="text-xs text-slate-500">Cadastre o primeiro cliente no módulo Headhunter para ativar a simulação do Portal do Cliente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Restrict Portal Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                  Portal Restrito do Cliente
                </span>
                <span className="text-slate-400 text-xs font-mono">Acesso Seguro SSL</span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                {currentClient?.nomeFantasia || 'Selecione um Cliente'}
              </h2>
            </div>
          </div>

          {/* Client Selection Switcher for Headhunter Admin */}
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/10 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 pl-2">Visão do Cliente:</span>
            <select
              value={selectedClientId}
              onChange={(e) => {
                setSelectedClientId(e.target.value);
                setSelectedJobId('TODAS');
                setSelectedCandidate(null);
              }}
              className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 outline-none cursor-pointer"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.nomeFantasia || c.razaoSocial}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Client Metadata Header */}
        {currentClient && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-xs text-slate-300">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Responsável RH</span>
              <strong className="text-white font-semibold">{currentClient.responsavel} ({currentClient.cargoResponsavel})</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">E-mail Corporativo</span>
              <strong className="text-white font-semibold">{currentClient.email}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Vagas Abertas</span>
              <strong className="text-indigo-300 font-extrabold">{clientJobs.length} Posições em Seleção</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Candidatos Apresentados</span>
              <strong className="text-emerald-400 font-extrabold">{clientCandidates.length} Finalistas En enviados</strong>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Subtabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2">
        <button
          onClick={() => setActiveTab('candidatos')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'candidatos' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Candidatos Apresentados ({clientCandidates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vagas')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'vagas' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Suas Vagas Ativas ({clientJobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('entrevistas')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'entrevistas' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Entrevistas Agendadas ({clientInterviews.length})</span>
        </button>
      </div>

      {feedbackSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-extrabold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{feedbackSuccess}</span>
          </div>
        </div>
      )}

      {/* CONTENT: TAB CANDIDATOS APRESENTADOS */}
      {activeTab === 'candidatos' && (
        <div className="space-y-4">
          {/* Job Filter Selector */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700">Filtrar por Vaga:</span>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl outline-none cursor-pointer"
              >
                <option value="TODAS">Todas as Vagas Ativas ({clientJobs.length})</option>
                {clientJobs.map(j => (
                  <option key={j.id} value={j.id}>{j.cargo || j.titulo}</option>
                ))}
              </select>
            </div>

            <span className="text-xs font-medium text-slate-500">
              Exibindo apenas currículos e pareceres técnicos autorizados.
            </span>
          </div>

          {/* Candidates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientCandidates.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Nenhum candidato apresentado ainda para esta vaga.</p>
                <p className="text-[11px] text-slate-400">A equipe de Headhunting está realizando a triagem e enviará em breve os perfis pré-qualificados.</p>
              </div>
            ) : (
              clientCandidates.map(cand => (
                <div
                  key={cand.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-800 font-extrabold flex items-center justify-center text-xs shrink-0">
                          {cand.nome.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 leading-tight">{cand.nome}</h4>
                          <span className="text-[11px] font-semibold text-slate-500 block">{cand.cargoAtual}</span>
                        </div>
                      </div>

                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                        {cand.compatibilidadePercent || 85}% Match
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-bold">Localização:</span>
                        <span className="font-semibold text-slate-800">{cand.cidade || 'São Paulo, SP'}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-bold">Pretensão Salarial:</span>
                        <span className="font-extrabold text-emerald-700">
                          R$ {(cand.pretensaoSalarial || 15000).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      {cand.vagaTitulo && (
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                          <span className="text-slate-400 font-bold">Vaga Referência:</span>
                          <span className="font-extrabold text-indigo-600 truncate max-w-[140px]">{cand.vagaTitulo}</span>
                        </div>
                      )}
                    </div>

                    {/* Technical Opinion preview */}
                    {cand.triagemIaParecer && (
                      <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 text-xs space-y-1">
                        <div className="flex items-center gap-1 text-indigo-900 font-extrabold">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Parecer Técnico do Consultor</span>
                        </div>
                        <p className="text-[11px] text-slate-700 font-medium line-clamp-3 leading-relaxed">
                          {cand.triagemIaParecer}
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedCandidate(cand)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver Currículo & Dar Retorno</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CONTENT: TAB SUAS VAGAS */}
      {activeTab === 'vagas' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">Vagas em Seleção para {currentClient?.nomeFantasia}</h3>
            <span className="text-xs font-bold text-slate-500">{clientJobs.length} Processos Ativos</span>
          </div>

          <div className="divide-y divide-slate-100">
            {clientJobs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">Nenhuma vaga ativa para este cliente.</div>
            ) : (
              clientJobs.map(j => (
                <div key={j.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900">{j.titulo || j.cargo}</h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {j.status}
                      </span>
                    </div>
                    <p className="text-slate-500 mt-1">{j.local} • SLA: {j.slaDias || 15} dias • Posições: {j.qtdVagas || 1}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-slate-400 font-medium block">Consultor Responsável</span>
                      <strong className="text-slate-800">{j.consultorResponsavel || 'Consultor Headhunter'}</strong>
                    </div>

                    <button
                      onClick={() => { setSelectedJobId(j.id); setActiveTab('candidatos'); }}
                      className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Ver Candidatos ({clientCandidates.filter(c => c.vagaId === j.id).length})
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CONTENT: TAB ENTREVISTAS */}
      {activeTab === 'entrevistas' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900">Agenda de Entrevistas com o Cliente</h3>
            <span className="text-xs font-semibold text-slate-500">{clientInterviews.length} Agendadas</span>
          </div>

          <div className="space-y-3">
            {clientInterviews.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">Nenhuma entrevista agendada até o momento.</p>
            ) : (
              clientInterviews.map((int, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <strong className="text-slate-900 font-bold block">{int.candidatoNome} — Vaga: {int.vagaTitulo}</strong>
                    <span className="text-slate-500">{int.dataHora} • Modalidade: {int.modalidade}</span>
                  </div>

                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 font-bold rounded-lg self-start sm:self-auto">
                    {int.resultado || 'Confirmada'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: DETALHES DO CANDIDATO E REGISTRO DE RETORNO DO CLIENTE */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 max-h-[90vh] overflow-y-auto scrollbar-thin my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                  {selectedCandidate.nome.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{selectedCandidate.nome}</h3>
                  <p className="text-xs text-slate-500">{selectedCandidate.cargoAtual} • {selectedCandidate.cidade}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer">✕</button>
            </div>

            {/* Candidate Resume Text */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Resumo do Perfil & Currículo Autorizado</span>
              <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-200 whitespace-pre-line max-h-48 overflow-y-auto">
                {selectedCandidate.curriculoTexto || 'Perfil pré-avaliado e pré-qualificado para a posição.'}
              </div>
            </div>

            {/* Consultant Technical Report */}
            {selectedCandidate.triagemIaParecer && (
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1.5 text-xs">
                <span className="font-bold text-indigo-900 block">Parecer Técnico da Consultoria</span>
                <p className="text-slate-700 leading-relaxed">{selectedCandidate.triagemIaParecer}</p>
              </div>
            )}

            {/* Client Return / Feedback Form */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-black text-slate-900">Registrar Retorno do Cliente (Decisão)</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sua Decisão *</label>
                  <select
                    value={decisao}
                    onChange={(e) => setDecisao(e.target.value as any)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none"
                  >
                    <option value="Aprovado para Entrevista">Aprovar para Entrevista</option>
                    <option value="Solicitar mais informações">Solicitar mais informações</option>
                    <option value="Solicitar novo candidato">Solicitar novo candidato</option>
                    <option value="Finalista">Definir como Finalista</option>
                    <option value="Aprovado para Contratação">Aprovar para Contratação</option>
                    <option value="Reprovado">Reprovar Candidato</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Anotação / Comentário *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Gostamos do perfil, agendar entrevista para quarta às 14h."
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={submittingFeedback}
                onClick={() => handleSendFeedback(selectedCandidate)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Retorno para a Consultoria Headhunter</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
