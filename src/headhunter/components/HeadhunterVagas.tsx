import React, { useState } from 'react';
import { 
  Briefcase, 
  Users, 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Building2, 
  AlertCircle,
  FileText,
  UserCheck
} from 'lucide-react';
import { HeadhunterJob, HeadhunterClient } from '../types';

interface HeadhunterVagasProps {
  jobs: HeadhunterJob[];
  clients: HeadhunterClient[];
  onAddJob: (job: HeadhunterJob) => void;
  onFinalizeJob: (jobId: string) => void;
  onOpenAiModal: (type: string, data?: any) => void;
}

export const HeadhunterVagas: React.FC<HeadhunterVagasProps> = ({
  jobs,
  clients,
  onAddJob,
  onFinalizeJob,
  onOpenAiModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [selectedJob, setSelectedJob] = useState<HeadhunterJob | null>(jobs[0] || null);

  // Finalize confirmation modal
  const [jobToFinalize, setJobToFinalize] = useState<HeadhunterJob | null>(null);

  // New Job Modal State
  const [showModal, setShowModal] = useState(false);
  const [cargo, setCargo] = useState('');
  const [clienteId, setClienteId] = useState(clients[0]?.id || '');
  const [consultorResponsavel, setConsultorResponsavel] = useState('Carlos Headhunter');
  const [recrutador, setRecrutador] = useState('Ana Clara Recrutadora');
  const [salario, setSalario] = useState('R$ 25.000/mês');
  const [salarioValor, setSalarioValor] = useState(25000);
  const [tipoContratacao, setTipoContratacao] = useState<'CLT' | 'PJ' | 'Executive' | 'Temporário'>('Executive');
  const [local, setLocal] = useState('São Paulo - SP (Híbrido)');
  const [prioridade, setPrioridade] = useState<'Baixa' | 'Média' | 'Alta' | 'Urgente'>('Alta');
  const [slaDias, setSlaDias] = useState(45);
  const [descricao, setDescricao] = useState('');

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          j.clienteNome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'Todos' || j.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    const cli = clients.find(c => c.id === clienteId);
    const cliNome = cli?.nomeFantasia || 'Cliente Corporativo';
    const percent = cli?.comissaoNegociadaPercent || 20;
    const comissaoCalc = (salarioValor * 12 * (percent / 100)); // Anualizado ou comissão calculada

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
      cargo,
      descricao: descricao || 'Descrição executiva a ser gerada via IA.',
      requisitos: ['Inglês Fluente', 'Experiência Executiva prévia no setor'],
      salario,
      salarioValor,
      tipoContratacao,
      local,
      dataAbertura: new Date().toISOString().split('T')[0],
      dataPrevista: new Date(Date.now() + slaDias * 86400000).toISOString().split('T')[0],
      slaDias,
      prioridade,
      valorNegociado: salarioValor,
      valorVaga: salarioValor,
      percentualComissao: percent,
      comissaoCalculada: comissaoCalc,
      qtdVagas: 1,
      candidatosIds: [],
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

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Gestão de Vagas Executivas & Mandatos</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Controle de SLAs de entrega, honorários negociados, comissão devida e encerramento com faturamento automático.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAiModal('gerarDescricaoVaga')}
            className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Criar / Melhorar Descrição com IA</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Vaga de Executive Search</span>
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
                placeholder="Buscar por cargo ou cliente..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[11px] font-bold text-slate-500 shrink-0">Status:</span>
              {['Todos', 'Aberta', 'Em Andamento', 'Fechada', 'Cancelada'].map(st => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedStatus === st
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredJobs.map(j => (
              <div
                key={j.id}
                onClick={() => setSelectedJob(j)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedJob?.id === j.id
                    ? 'bg-indigo-50/50 border-indigo-600 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{j.cargo}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">{j.clienteNome}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                    j.status === 'Fechada' ? 'bg-emerald-100 text-emerald-800' :
                    j.status === 'Em Andamento' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {j.status}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-medium">Salário Vaga:</span>
                    <p className="font-bold text-slate-800">{j.salario}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Comissão Devida:</span>
                    <p className="font-bold text-emerald-600">R$ {(j.comissaoCalculada / 1000).toFixed(0)}k</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Job Details */}
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
                    Cliente: <strong className="text-slate-800">{selectedJob.clienteNome}</strong> • SLA: {selectedJob.slaDias} dias (Abertura: {selectedJob.dataAbertura})
                  </p>
                </div>

                {selectedJob.status !== 'Fechada' && (
                  <button
                    onClick={() => setJobToFinalize(selectedJob)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Contratar & Finalizar Vaga</span>
                  </button>
                )}
              </div>

              {/* SPEC GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Consultor Responsável</span>
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
                  <span className="text-slate-400 font-medium block">Remuneração Média</span>
                  <strong className="text-slate-800">{selectedJob.salario}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Percentual Comissão</span>
                  <strong className="text-indigo-700">{selectedJob.percentualComissao}%</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Valor Comissão</span>
                  <strong className="text-emerald-700 font-black">R$ {selectedJob.comissaoCalculada.toLocaleString('pt-BR')}</strong>
                </div>
              </div>

              {/* DESCRICAO DA VAGA */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Descrição Executiva do Cargo</h4>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  {selectedJob.descricao}
                </div>
              </div>

              {/* HISTÓRICO DA VAGA */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Histórico de Eventos da Vaga</h4>
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
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
              Selecione uma vaga para visualizar os detalhes.
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Finalizing Job */}
      {jobToFinalize && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-black text-slate-900">Deseja finalizar esta vaga?</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Ao confirmar a finalização da vaga <strong>"{jobToFinalize.cargo}"</strong> para o cliente <strong>{jobToFinalize.clienteNome}</strong>:
            </p>

            <ul className="text-xs text-slate-700 font-medium space-y-1.5 list-disc pl-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <li>Status da vaga será alterado para <strong>Fechada</strong></li>
              <li>Será gerado faturamento de <strong>R$ {jobToFinalize.comissaoCalculada.toLocaleString('pt-BR')}</strong></li>
              <li>A comissão do consultor será registrada automaticamente</li>
              <li>Será criado lançamento no Contas a Receber no Financeiro</li>
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
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-emerald-700 shadow-sm"
              >
                Confirmar & Finalizar Vaga
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
              <h3 className="text-base font-black text-slate-900">Nova Vaga Executive Search</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Título do Cargo Executivo</label>
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
                  <label className="block font-bold text-slate-700 mb-1">Tipo Contratação</label>
                  <select value={tipoContratacao} onChange={e => setTipoContratacao(e.target.value as any)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="Executive">Executive Search</option>
                    <option value="CLT">CLT Mensal</option>
                    <option value="PJ">PJ Mensal</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Salário Mensal Média (R$)</label>
                  <input required type="number" value={salarioValor} onChange={e => { setSalarioValor(Number(e.target.value)); setSalario(`R$ ${Number(e.target.value).toLocaleString('pt-BR')}/mês`); }} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SLA Entrega (Dias)</label>
                  <input required type="number" value={slaDias} onChange={e => setSlaDias(Number(e.target.value))} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição do Mandato</label>
                <textarea rows={3} value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Principais desafios executivos e escopo do papel..." className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl cursor-pointer hover:bg-indigo-700">Abrir Vaga Executiva</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
