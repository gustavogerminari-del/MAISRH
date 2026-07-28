import React, { useState } from 'react';
import { 
  Users, 
  Sparkles, 
  FileText, 
  Award, 
  Clock, 
  Search, 
  CheckCircle2, 
  Briefcase,
  UserCheck,
  Plus,
  MapPin,
  Calendar,
  X,
  Filter,
  DollarSign,
  Building2,
  ChevronRight,
  Send,
  MessageSquare,
  FileCheck,
  Layers,
  History,
  Info
} from 'lucide-react';
import { HeadhunterCandidate, HeadhunterJob, HeadhunterClient, CandidateClassification } from '../types';

interface HeadhunterCandidatosProps {
  candidates: HeadhunterCandidate[];
  jobs: HeadhunterJob[];
  clients?: HeadhunterClient[];
  selectedJobId?: string | null;
  onClearSelectedJob?: () => void;
  onAddCandidate: (candidate: HeadhunterCandidate) => void;
  onOpenAiModal: (type: string, data?: any) => void;
}

export const HeadhunterCandidatos: React.FC<HeadhunterCandidatosProps> = ({
  candidates,
  jobs,
  clients = [],
  selectedJobId,
  onClearSelectedJob,
  onAddCandidate,
  onOpenAiModal
}) => {
  const selectedJob = selectedJobId ? jobs.find(j => j.id === selectedJobId) : null;

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState('Todas');
  const [selectedClassificationFilter, setSelectedClassificationFilter] = useState<string>('Todos');
  const [selectedClientFilter, setSelectedClientFilter] = useState('Todos');
  const [selectedJobFilter, setSelectedJobFilter] = useState(selectedJob ? selectedJob.cargo : 'Todas');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('Todos');

  // Side Drawer / Full Profile State
  const [profileDrawerCandidate, setProfileDrawerCandidate] = useState<HeadhunterCandidate | null>(null);
  const [profileActiveTab, setProfileActiveTab] = useState<number>(0);

  // New Candidate Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cargoAtual, setCargoAtual] = useState('');
  const [cargoPretendido, setCargoPretendido] = useState('');
  const [cidade, setCidade] = useState('São Paulo - SP');
  const [salarioAtual, setSalarioAtual] = useState(18000);
  const [pretensaoSalarial, setPretensaoSalarial] = useState(25000);
  const [disponibilidade, setDisponibilidade] = useState('Imediata');
  const [experienciaAnos, setExperienciaAnos] = useState(10);
  const [classificacao, setClassificacao] = useState<CandidateClassification>('Recomendado');
  const [vagaId, setVagaId] = useState(selectedJobId || '');
  const [curriculoTexto, setCurriculoTexto] = useState('');

  // Filtering candidates
  const filteredCandidates = candidates.filter(c => {
    const matchesJobId = selectedJobId ? (c.vagaId === selectedJobId || c.vagaTitulo === selectedJob?.cargo) : true;

    const matchesSearch = c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.cargoAtual.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.cidade && c.cidade.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (c.competencias && c.competencias.some(comp => comp.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesClass = selectedClassificationFilter === 'Todos' || c.classificacao === selectedClassificationFilter;
    const matchesJobTitle = selectedJobFilter === 'Todas' || c.vagaTitulo === selectedJobFilter;
    const matchesClient = selectedClientFilter === 'Todos' || c.clienteNome === selectedClientFilter;

    return matchesJobId && matchesSearch && matchesClass && matchesJobTitle && matchesClient;
  });

  // Key Indicators
  const totalNoBanco = candidates.length;
  const recomendados = candidates.filter(c => c.classificacao === 'Recomendado' || c.compatibilidadePercent >= 85).length;
  const altoPotencial = candidates.filter(c => c.classificacao === 'Alto potencial' || c.triagemIaScore >= 90).length;
  const emProcesso = candidates.filter(c => c.etapaPipeline !== 'Contratado' && c.etapaPipeline !== 'Reprovado').length;

  const handleCreateCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    const targetJob = jobs.find(j => j.id === vagaId);

    const newCand: HeadhunterCandidate = {
      id: `cand-${Date.now()}`,
      empresaId: 'emp-001',
      criadoPor: 'Headhunter MAIS RH',
      criadoEm: new Date().toISOString().split('T')[0],
      status: 'Ativo',
      nome,
      email,
      telefone,
      cidade,
      fotoUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      cargoAtual,
      cargoPretendido: cargoPretendido || cargoAtual,
      area: 'Executiva',
      salarioAtual,
      pretensaoSalarial,
      disponibilidade,
      experienciaAnos,
      competencias: ['Liderança', 'Visão Estratégica', 'Gestão de Pessoas', 'Inglês Fluente'],
      classificacao,
      vagaId: targetJob?.id,
      vagaTitulo: targetJob?.cargo,
      clienteNome: targetJob?.clienteNome,
      curriculoTexto: curriculoTexto || 'Currículo e histórico profissional enviado pelo candidato.',
      compatibilidadePercent: 88,
      triagemIaScore: 88,
      triagemIaParecer: 'Perfil com forte alinhamento de senioridade e competências executivas.',
      triagemRhStatus: 'Aprovado',
      parecerTecnico: 'Candidato demonstrando maturidade em gestão e aderência ao perfil corporativo.',
      etapaPipeline: 'Triagem',
      historico: [{ data: new Date().toISOString().split('T')[0], evento: 'Cadastrado no Banco de Talentos.' }],
      linhaDoTempo: [{ data: new Date().toISOString().split('T')[0], titulo: 'Cadastro', detalhe: 'Inserido no banco de dados.' }]
    };

    onAddCandidate(newCand);
    setShowAddModal(false);
  };

  const drawerTabs = [
    'Resumo',
    'Currículo',
    'Experiências',
    'Formação',
    'Competências',
    'Triagem IA',
    'Triagem RH',
    'Entrevistas',
    'Anotações',
    'Documentos',
    'Histórico',
    'Linha do Tempo',
    'Parecer Final'
  ];

  return (
    <div className="space-y-6">
      {/* Contextual Banner if Selected Job filtering */}
      {selectedJob && (
        <div className="bg-indigo-900 text-white p-5 rounded-3xl shadow-md flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="bg-indigo-700 text-indigo-100 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-500">
              Candidatos Mapeados para a Vaga
            </span>
            <h3 className="text-lg font-black">{selectedJob.cargo}</h3>
            <p className="text-xs text-indigo-200">
              Cliente: <strong>{selectedJob.clienteNome}</strong> • Posições: {selectedJob.posicoesPreenchidas || 0}/{selectedJob.qtdVagas} • SLA: {selectedJob.slaDias} dias
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAiModal('encontrarCandidatosIdeais', selectedJob)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Match de Talentos com IA</span>
            </button>
            {onClearSelectedJob && (
              <button
                onClick={onClearSelectedJob}
                className="px-3 py-2 bg-indigo-800 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Ver Todo o Banco
              </button>
            )}
          </div>
        </div>
      )}

      {/* Requirement Header */}
      {!selectedJob && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Banco de Talentos Mapeados</h2>
              <span className="bg-indigo-100 text-indigo-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-200">
                {totalNoBanco} talentos
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Mapeamento estratégico de profissionais de alto impacto, executivos e especialistas para atração ativa.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenAiModal('encontrarCandidatosIdeais')}
              className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl border border-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Match com IA</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Cadastrar Talento</span>
            </button>
          </div>
        </div>
      )}

      {/* Key Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Total no Banco</span>
          <p className="text-2xl font-black text-slate-900">{totalNoBanco}</p>
          <span className="text-[10px] text-slate-400 font-medium">Talentos executivos</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Recomendados</span>
          <p className="text-2xl font-black text-emerald-600">{recomendados}</p>
          <span className="text-[10px] text-emerald-600 font-bold">Alta aderência</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Alto Potencial</span>
          <p className="text-2xl font-black text-indigo-600">{altoPotencial}</p>
          <span className="text-[10px] text-indigo-600 font-bold">Score IA &gt; 90</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Em Processo Seletivo</span>
          <p className="text-2xl font-black text-amber-600">{emProcesso}</p>
          <span className="text-[10px] text-amber-600 font-bold">Ativos em pipeline</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, cargo, habilidade ou cidade..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Classificação */}
          <select
            value={selectedClassificationFilter}
            onChange={e => setSelectedClassificationFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
          >
            <option value="Todos">Classificação: Todas</option>
            <option value="Recomendado">Recomendado</option>
            <option value="Alto potencial">Alto potencial</option>
            <option value="Pendente">Pendente</option>
            <option value="Arquivado">Arquivado</option>
          </select>

          {/* Vaga Vinculada */}
          <select
            value={selectedJobFilter}
            onChange={e => setSelectedJobFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
          >
            <option value="Todas">Vaga: Todas</option>
            {jobs.map(j => (
              <option key={j.id} value={j.cargo}>{j.cargo}</option>
            ))}
          </select>

          {/* Cliente */}
          <select
            value={selectedClientFilter}
            onChange={e => setSelectedClientFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
          >
            <option value="Todos">Cliente: Todos</option>
            {clients.map(c => (
              <option key={c.id} value={c.nomeFantasia}>{c.nomeFantasia}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCandidates.map(c => (
          <div
            key={c.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-sm shrink-0 border border-indigo-200 overflow-hidden">
                    {c.fotoUrl ? (
                      <img src={c.fotoUrl} alt={c.nome} className="w-full h-full object-cover" />
                    ) : (
                      c.nome.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{c.nome}</h4>
                    <p className="text-xs text-slate-600 font-bold">{c.cargoAtual}</p>
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {c.cidade || 'São Paulo - SP'}
                    </span>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full shrink-0 ${
                  c.classificacao === 'Recomendado' ? 'bg-emerald-100 text-emerald-800' :
                  c.classificacao === 'Alto potencial' ? 'bg-indigo-100 text-indigo-800' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {c.classificacao || 'Recomendado'}
                </span>
              </div>

              {/* Spec row */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl text-[11px] border border-slate-100">
                <div>
                  <span className="text-slate-400 font-medium block">Pretensão Salarial</span>
                  <strong className="text-slate-800">R$ {c.pretensaoSalarial?.toLocaleString('pt-BR')}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Disponibilidade</span>
                  <strong className="text-slate-800">{c.disponibilidade || 'Imediata'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Experiência</span>
                  <strong className="text-slate-800">{c.experienciaAnos || 8} anos</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Match Vaga</span>
                  <strong className="text-indigo-600 font-extrabold">{c.compatibilidadePercent}% Match</strong>
                </div>
              </div>

              {/* Competencies Tags */}
              <div className="flex flex-wrap gap-1">
                {(c.competencias || ['Liderança Executiva', 'Inglês Fluente', 'Gestão Estratégica']).map((comp, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded-md">
                    {comp}
                  </span>
                ))}
              </div>

              {/* Linked Job / Client */}
              {c.vagaTitulo && (
                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>Vaga: <strong className="text-slate-800">{c.vagaTitulo}</strong> ({c.clienteNome || 'Cliente Corporativo'})</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setProfileDrawerCandidate(c);
                  setProfileActiveTab(0);
                }}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer text-center"
              >
                Perfil Completo
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Side Drawer Panel for Full Candidate Profile */}
      {profileDrawerCandidate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white w-full max-w-3xl h-full shadow-2xl flex flex-col border-l border-slate-200">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-black text-base flex items-center justify-center overflow-hidden">
                  {profileDrawerCandidate.fotoUrl ? (
                    <img src={profileDrawerCandidate.fotoUrl} alt={profileDrawerCandidate.nome} className="w-full h-full object-cover" />
                  ) : (
                    profileDrawerCandidate.nome.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{profileDrawerCandidate.nome}</h3>
                  <p className="text-xs text-slate-500 font-bold">{profileDrawerCandidate.cargoAtual} • {profileDrawerCandidate.cidade || 'São Paulo - SP'}</p>
                </div>
              </div>

              <button
                onClick={() => setProfileDrawerCandidate(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 13 Navigation Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto p-2 bg-white border-b border-slate-200 shrink-0">
              {drawerTabs.map((tab, idx) => (
                <button
                  key={tab}
                  onClick={() => setProfileActiveTab(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                    profileActiveTab === idx
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {profileActiveTab === 0 && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 font-medium block">Pretensão Salarial</span>
                      <strong className="text-slate-900 text-sm">R$ {profileDrawerCandidate.pretensaoSalarial?.toLocaleString('pt-BR')}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Salário Atual</span>
                      <strong className="text-slate-900 text-sm">R$ {profileDrawerCandidate.salarioAtual?.toLocaleString('pt-BR')}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Disponibilidade</span>
                      <strong className="text-slate-900 text-sm">{profileDrawerCandidate.disponibilidade || 'Imediata'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Score IA</span>
                      <strong className="text-indigo-600 text-sm font-black">{profileDrawerCandidate.triagemIaScore}/100</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Etapa do Pipeline</span>
                      <strong className="text-slate-900 text-sm">{profileDrawerCandidate.etapaPipeline}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Vaga Associada</span>
                      <strong className="text-slate-900 text-sm">{profileDrawerCandidate.vagaTitulo || 'Nenhuma'}</strong>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px]">Resumo do Perfil Executivo</h4>
                    <p className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 leading-relaxed font-medium">
                      {profileDrawerCandidate.curriculoTexto || 'Profissional com mais de 10 anos de vivência em liderança corporativa, gestão de equipes de alta performance e implementação de projetos de grande impacto estratégico.'}
                    </p>
                  </div>
                </div>
              )}

              {profileActiveTab === 1 && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-800">
                  {profileDrawerCandidate.curriculoTexto || 'Curriculo completo anexado no sistema.'}
                </div>
              )}

              {profileActiveTab === 5 && (
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-200 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-900 font-black text-xs">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Parecer Automatizado de Triagem IA</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {profileDrawerCandidate.triagemIaParecer}
                  </p>
                </div>
              )}

              {profileActiveTab === 12 && (
                <div className="space-y-3">
                  <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">Parecer Final do Headhunter</h4>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
                    {profileDrawerCandidate.parecerTecnico || 'Parecer técnico final em elaboração pelo consultor responsável.'}
                  </div>
                </div>
              )}

              {profileActiveTab !== 0 && profileActiveTab !== 1 && profileActiveTab !== 5 && profileActiveTab !== 12 && (
                <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                  Conteúdo detalhado de <strong>{drawerTabs[profileActiveTab]}</strong> disponível no dossiê completo.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Candidate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Cadastrar Novo Talento Executivo</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateCandidate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome Completo</label>
                <input required type="text" placeholder="Ex: Roberto Alcantara" value={nome} onChange={e => setNome(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">E-mail</label>
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefone / WhatsApp</label>
                  <input required type="text" value={telefone} onChange={e => setTelefone(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cargo Atual</label>
                  <input required type="text" value={cargoAtual} onChange={e => setCargoAtual(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cidade / Estado</label>
                  <input required type="text" value={cidade} onChange={e => setCidade(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pretensão Salarial (R$)</label>
                  <input required type="number" value={pretensaoSalarial} onChange={e => setPretensaoSalarial(Number(e.target.value))} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Classificação</label>
                  <select value={classificacao} onChange={e => setClassificacao(e.target.value as any)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="Recomendado">Recomendado</option>
                    <option value="Alto potencial">Alto potencial</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vaga de Destino (Opcional)</label>
                <select value={vagaId} onChange={e => setVagaId(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <option value="">Nenhuma (Apenas Banco de Talentos)</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.cargo} ({j.clienteNome})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Resumo do Currículo</label>
                <textarea rows={3} value={curriculoTexto} onChange={e => setCurriculoTexto(e.target.value)} placeholder="Principais realizações e histórico profissional..." className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl cursor-pointer hover:bg-indigo-700">Cadastrar Talento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
