import React, { useState } from 'react';
import { 
  Briefcase, 
  Users, 
  DollarSign, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  AlertCircle,
  UserCheck,
  RotateCcw,
  Layers,
  MapPin,
  X
} from 'lucide-react';
import { HeadhunterJob, HeadhunterClient, HeadhunterCandidate } from '../types';

interface HeadhunterVagasProps {
  jobs: HeadhunterJob[];
  clients: HeadhunterClient[];
  candidates?: HeadhunterCandidate[];
  onAddJob: (job: HeadhunterJob) => void;
  onFinalizeJob: (jobId: string) => void;
  onOpenCandidates?: (jobId: string) => void;
  onOpenAiModal: (type: string, data?: any) => void;
}

export const HeadhunterVagas: React.FC<HeadhunterVagasProps> = ({
  jobs,
  clients,
  candidates = [],
  onAddJob,
  onFinalizeJob,
  onOpenCandidates,
  onOpenAiModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todas');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('Todos');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('Todos');
  const [selectedContractFilter, setSelectedContractFilter] = useState<string>('Todos');
  const [selectedResponsibleFilter, setSelectedResponsibleFilter] = useState<string>('Todos');
  const [selectedSlaFilter, setSelectedSlaFilter] = useState<string>('Todos');

  const [selectedJob, setSelectedJob] = useState<HeadhunterJob | null>(jobs[0] || null);
  const [jobToFinalize, setJobToFinalize] = useState<HeadhunterJob | null>(null);

  // New Job Modal State
  const [showModal, setShowModal] = useState(false);
  const [cargo, setCargo] = useState('');
  const [departamento, setDepartamento] = useState('Tecnologia');
  const [clienteId, setClienteId] = useState(clients[0]?.id || '');
  const [consultorResponsavel, setConsultorResponsavel] = useState('Carlos Headhunter');
  const [recrutador, setRecrutador] = useState('Ana Clara Recrutadora');
  const [salario, setSalario] = useState('R$ 25.000/mês');
  const [salarioValor, setSalarioValor] = useState(25000);
  const [tipoContratacao, setTipoContratacao] = useState<'CLT' | 'PJ' | 'Executive' | 'Temporário'>('Executive');
  const [cidadeModalidade, setCidadeModalidade] = useState('São Paulo - SP (Híbrido)');
  const [prioridade, setPrioridade] = useState<'Baixa' | 'Média' | 'Alta' | 'Urgente'>('Alta');
  const [slaDias, setSlaDias] = useState(45);
  const [qtdVagas, setQtdVagas] = useState(1);
  const [descricao, setDescricao] = useState('');

  // Department Statistics
  const departmentsList = ['Tecnologia', 'Recursos Humanos', 'Comercial', 'Financeiro', 'Outros'];
  const departmentCounts = departmentsList.map(dept => {
    const count = jobs.filter(j => {
      const jDept = j.departamento || (
        j.cargo.toLowerCase().includes('cto') || j.cargo.toLowerCase().includes('dev') || j.cargo.toLowerCase().includes('tech') ? 'Tecnologia' :
        j.cargo.toLowerCase().includes('rh') || j.cargo.toLowerCase().includes('pessoas') ? 'Recursos Humanos' :
        j.cargo.toLowerCase().includes('vendas') || j.cargo.toLowerCase().includes('comercial') ? 'Comercial' :
        j.cargo.toLowerCase().includes('cfo') || j.cargo.toLowerCase().includes('financeiro') ? 'Financeiro' : 'Outros'
      );
      return jDept === dept;
    }).length;
    return { name: dept, count };
  });

  const totalDepartmentJobs = jobs.length || 1;

  // Filtered jobs
  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          j.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          j.consultorResponsavel.toLowerCase().includes(searchTerm.toLowerCase());
    
    const jDept = j.departamento || (
      j.cargo.toLowerCase().includes('cto') || j.cargo.toLowerCase().includes('tech') ? 'Tecnologia' :
      j.cargo.toLowerCase().includes('rh') ? 'Recursos Humanos' :
      j.cargo.toLowerCase().includes('vendas') ? 'Comercial' :
      j.cargo.toLowerCase().includes('financeiro') ? 'Financeiro' : 'Outros'
    );

    const matchesDept = selectedDepartmentFilter === 'Todos' || jDept === selectedDepartmentFilter;
    const matchesStatus = selectedStatus === 'Todas' || j.status === selectedStatus;
    const matchesClient = selectedClientFilter === 'Todos' || j.clienteNome === selectedClientFilter;
    const matchesContract = selectedContractFilter === 'Todos' || j.tipoContratacao === selectedContractFilter;
    const matchesResp = selectedResponsibleFilter === 'Todos' || j.consultorResponsavel === selectedResponsibleFilter;
    
    const matchesSla = selectedSlaFilter === 'Todos' ? true :
                       selectedSlaFilter === 'no_prazo' ? (j.slaDias || 30) >= 30 :
                       selectedSlaFilter === 'critico' ? (j.slaDias || 30) < 30 : true;

    return matchesSearch && matchesDept && matchesStatus && matchesClient && matchesContract && matchesResp && matchesSla;
  });

  const openCount = jobs.filter(j => j.status === 'Aberta' || j.status === 'Busca ativa' || j.status === 'Em Andamento').length;

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('Todas');
    setSelectedDepartmentFilter('Todos');
    setSelectedClientFilter('Todos');
    setSelectedContractFilter('Todos');
    setSelectedResponsibleFilter('Todos');
    setSelectedSlaFilter('Todos');
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    const cli = clients.find(c => c.id === clienteId);
    const cliNome = cli?.nomeFantasia || 'Cliente Corporativo';
    const percent = cli?.comissaoNegociadaPercent || 20;
    const comissaoCalc = (salarioValor * 12 * (percent / 100));

    const newJob: HeadhunterJob = {
      id: `job-${Date.now()}`,
      empresaId: 'emp-001',
      criadoPor: consultorResponsavel,
      criadoEm: new Date().toISOString().split('T')[0],
      status: 'Aberta',
      clienteId,
      clienteNome: cliNome,
      consultorResponsavel,
      recrutador,
      departamento,
      cargo,
      resumo: descricao.substring(0, 120) + '...',
      descricao: descricao || 'Descrição executiva da posição.',
      requisitos: ['Inglês Fluente', 'Experiência prévia comprovada na área'],
      salario,
      salarioValor,
      tipoContratacao,
      local: cidadeModalidade,
      cidadeModalidade,
      dataAbertura: new Date().toISOString().split('T')[0],
      dataPrevista: new Date(Date.now() + slaDias * 86400000).toISOString().split('T')[0],
      slaDias,
      diasEmAberto: 1,
      prioridade,
      valorNegociado: salarioValor,
      valorVaga: salarioValor,
      valorCobrado: comissaoCalc,
      regraCobranca: `${percent}% da remuneração anual`,
      percentualComissao: percent,
      comissaoCalculada: comissaoCalc,
      qtdVagas,
      posicoesPreenchidas: 0,
      candidatosIds: [],
      candidatosCount: 0,
      documentosCount: 1,
      historico: [{ data: new Date().toISOString().split('T')[0], evento: 'Vaga cadastrada no sistema.', autor: consultorResponsavel }]
    };

    onAddJob(newJob);
    setShowModal(false);
    setSelectedJob(newJob);
  };

  const confirmFinalizeJob = () => {
    if (!jobToFinalize) return;
    onFinalizeJob(jobToFinalize.id);
    setJobToFinalize(null);
  };

  const statusTabs = [
    'Todas',
    'Rascunho',
    'Aberta',
    'Busca ativa',
    'Triagem',
    'Entrevistas',
    'Aguardando cliente',
    'Fechada',
    'Pausada',
    'Cancelada',
    'Arquivada'
  ];

  return (
    <div className="space-y-6">
      {/* Requirement Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Gestão de Vagas Corporativas</h2>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-200">
              {openCount} abertas
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Cadastre, controle o SLA, vincule orçamentos e acompanhe requisições por cliente.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nova Vaga</span>
          </button>
        </div>
      </div>

      {/* Department Indicator Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
          Distribuição de Vagas por Departamento
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {departmentCounts.map(d => {
            const isSelected = selectedDepartmentFilter === d.name;
            const pct = Math.round((d.count / totalDepartmentJobs) * 100);
            return (
              <button
                key={d.name}
                onClick={() => setSelectedDepartmentFilter(isSelected ? 'Todos' : d.name)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{d.name}</span>
                  <span className="text-xs font-black text-indigo-600">{d.count}</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-indigo-600 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters Bar & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cargo, palavra-chave ou recrutador..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

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

          {/* Tipo de contrato */}
          <select
            value={selectedContractFilter}
            onChange={e => setSelectedContractFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
          >
            <option value="Todos">Contrato: Todos</option>
            <option value="Executive">Executive</option>
            <option value="CLT">CLT</option>
            <option value="PJ">PJ</option>
            <option value="Temporário">Temporário</option>
          </select>

          {/* Responsável */}
          <select
            value={selectedResponsibleFilter}
            onChange={e => setSelectedResponsibleFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
          >
            <option value="Todos">Headhunter: Todos</option>
            <option value="Carlos Headhunter">Carlos Headhunter</option>
            <option value="Mariana Souza">Mariana Souza</option>
            <option value="Ana Clara Recrutadora">Ana Clara Recrutadora</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={handleClearFilters}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar</span>
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pt-2 border-t border-slate-100">
          <span className="text-[11px] font-extrabold text-slate-400 shrink-0 mr-1 uppercase">Status:</span>
          {statusTabs.map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedStatus === st
                  ? 'bg-indigo-600 text-white shadow-2xs font-extrabold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Jobs List */}
        <div className="lg:col-span-5 space-y-3 max-h-[680px] overflow-y-auto pr-1">
          {filteredJobs.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
              Nenhuma vaga encontrada para os filtros selecionados.
            </div>
          ) : (
            filteredJobs.map(j => {
              const candidateCount = candidates.filter(c => c.vagaId === j.id || c.vagaTitulo === j.cargo).length || (j.candidatosCount || 0);
              const filledPos = j.posicoesPreenchidas || 0;
              const totalPos = j.qtdVagas || 1;

              return (
                <div
                  key={j.id}
                  onClick={() => setSelectedJob(j)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    selectedJob?.id === j.id
                      ? 'bg-indigo-50/40 border-indigo-600 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {j.departamento || 'Tecnologia'}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          j.status === 'Fechada' ? 'bg-emerald-100 text-emerald-800' :
                          j.status === 'Aberta' || j.status === 'Em Andamento' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {j.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 mt-1">{j.cargo}</h4>
                      <p className="text-xs text-slate-500 font-bold">{j.clienteNome}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-extrabold text-slate-400 block">SLA</span>
                      <span className="text-xs font-black text-indigo-600">{j.slaDias}d</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {j.resumo || j.descricao}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 font-medium">Posições:</span>{' '}
                      <strong className="text-slate-800">{filledPos}/{totalPos} preenchidas</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Candidatos:</span>{' '}
                      <strong className="text-indigo-600">{candidateCount} vinculados</strong>
                    </div>
                  </div>

                  {/* Buttons on card */}
                  <div className="flex items-center justify-between pt-1 gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAiModal('gerarDescricaoVaga', j);
                      }}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      <span>Gerar Descrição IA</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {onOpenCandidates && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenCandidates(j.id);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1"
                        >
                          <Users className="w-3 h-3" />
                          <span>Candidatos</span>
                        </button>
                      )}

                      {j.status !== 'Fechada' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setJobToFinalize(j);
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-all"
                        >
                          Encerrar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Job Details View */}
        <div className="lg:col-span-7">
          {selectedJob ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-black text-slate-900">{selectedJob.cargo}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cliente: <strong className="text-slate-800">{selectedJob.clienteNome}</strong> • Local: {selectedJob.cidadeModalidade || selectedJob.local}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {onOpenCandidates && (
                    <button
                      onClick={() => onOpenCandidates(selectedJob.id)}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Users className="w-4 h-4" />
                      <span>Ver Candidatos da Vaga</span>
                    </button>
                  )}

                  {selectedJob.status !== 'Fechada' && (
                    <button
                      onClick={() => setJobToFinalize(selectedJob)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Contratar & Encerrar</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Specification Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Headhunter Responsável</span>
                  <strong className="text-slate-800">{selectedJob.consultorResponsavel}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Recrutador Atribuído</span>
                  <strong className="text-slate-800">{selectedJob.recrutador}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Tipo Contratação</span>
                  <strong className="text-slate-800">{selectedJob.tipoContratacao}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Faixa Salarial</span>
                  <strong className="text-slate-800">{selectedJob.salario}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Percentual Comissão</span>
                  <strong className="text-indigo-700">{selectedJob.percentualComissao}%</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Comissão Estimada</span>
                  <strong className="text-emerald-700 font-black">R$ {selectedJob.comissaoCalculada.toLocaleString('pt-BR')}</strong>
                </div>
              </div>

              {/* Mandate description */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Descrição & Requisitos da Vaga</h4>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  {selectedJob.descricao}
                </div>
              </div>

              {/* History */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Histórico da Vaga</h4>
                <div className="space-y-2">
                  {selectedJob.historico.map((h, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800">{h.evento}</span>
                        <p className="text-[10px] text-slate-400 font-medium">Autor: {h.autor}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">{h.data}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 text-xs">
              Selecione uma vaga para visualizar os detalhes completos.
            </div>
          )}
        </div>
      </div>

      {/* Finalize Confirmation Modal */}
      {jobToFinalize && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-black text-slate-900">Encerrar e Faturar Vaga?</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Ao confirmar a finalização da vaga <strong>"{jobToFinalize.cargo}"</strong> para o cliente <strong>{jobToFinalize.clienteNome}</strong>:
            </p>

            <ul className="text-xs text-slate-700 font-medium space-y-1.5 list-disc pl-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <li>Status da vaga será alterado para <strong>Fechada</strong></li>
              <li>Será gerado faturamento de <strong>R$ {jobToFinalize.comissaoCalculada.toLocaleString('pt-BR')}</strong></li>
              <li>A comissão do headhunter será registrada em Comissões</li>
              <li>Lançamento no Contas a Receber no Financeiro</li>
            </ul>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setJobToFinalize(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmFinalizeJob}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-emerald-700 shadow-xs"
              >
                Confirmar & Encerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Job Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Cadastrar Nova Vaga Corporativa</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Título do Cargo</label>
                <input required type="text" placeholder="Ex: Diretor de Tecnologia (CTO)" value={cargo} onChange={e => setCargo(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cliente Corporativo</label>
                  <select value={clienteId} onChange={e => setClienteId(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.nomeFantasia}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Departamento</label>
                  <select value={departamento} onChange={e => setDepartamento(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="Tecnologia">Tecnologia</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo Contratação</label>
                  <select value={tipoContratacao} onChange={e => setTipoContratacao(e.target.value as any)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="Executive">Executive Search</option>
                    <option value="CLT">CLT Mensal</option>
                    <option value="PJ">PJ Mensal</option>
                    <option value="Temporário">Temporário</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Qtd. de Posições</label>
                  <input required type="number" min={1} value={qtdVagas} onChange={e => setQtdVagas(Number(e.target.value))} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Remuneração Mensal (R$)</label>
                  <input required type="number" value={salarioValor} onChange={e => { setSalarioValor(Number(e.target.value)); setSalario(`R$ ${Number(e.target.value).toLocaleString('pt-BR')}/mês`); }} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SLA Entrega (Dias)</label>
                  <input required type="number" value={slaDias} onChange={e => setSlaDias(Number(e.target.value))} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cidade e Modalidade</label>
                <input required type="text" placeholder="Ex: São Paulo - SP (Híbrido)" value={cidadeModalidade} onChange={e => setCidadeModalidade(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição do Cargo / Mandato</label>
                <textarea rows={3} value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descreva os desafios da posição e pré-requisitos principais..." className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl cursor-pointer hover:bg-indigo-700">Cadastrar Vaga</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
