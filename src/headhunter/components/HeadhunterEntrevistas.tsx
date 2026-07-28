import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  Video, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  FileText,
  UserCheck,
  X,
  RotateCcw,
  Building2,
  Phone
} from 'lucide-react';
import { HeadhunterInterview, HeadhunterJob, HeadhunterClient } from '../types';

interface HeadhunterEntrevistasProps {
  interviews: HeadhunterInterview[];
  jobs: HeadhunterJob[];
  clients: HeadhunterClient[];
  onAddInterview: (interview: HeadhunterInterview) => void;
  onOpenAiModal: (type: string, data?: any) => void;
}

export const HeadhunterEntrevistas: React.FC<HeadhunterEntrevistasProps> = ({
  interviews,
  jobs,
  clients,
  onAddInterview,
  onOpenAiModal
}) => {
  const [selectedTabFilter, setSelectedTabFilter] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [vagaTitulo, setVagaTitulo] = useState(jobs[0]?.cargo || 'Head of Growth');
  const [clienteNome, setClienteNome] = useState(clients[0]?.nomeFantasia || 'Grupo Nexus Tech');
  const [candidatoNome, setCandidatoNome] = useState('');
  const [consultorNome, setConsultorNome] = useState('Carlos Headhunter');
  const [recrutadorNome, setRecrutadorNome] = useState('Ana Clara Recrutadora');
  const [dataHora, setDataHora] = useState('2026-03-28T14:00');
  const [tipoEntrevista, setTipoEntrevista] = useState('Entrevista Headhunter');
  const [modalidade, setModalidade] = useState<'Presencial' | 'Online (Meet)' | 'Online (Teams)' | 'Telefone'>('Online (Meet)');
  const [linkModalidade, setLinkModalidade] = useState('https://meet.google.com/xyz-123');
  const [pauta, setPauta] = useState('Avaliação de fit cultural, pretensão salarial e aderência técnica.');

  // Modal Parecer
  const [interviewForParecer, setInterviewForParecer] = useState<HeadhunterInterview | null>(null);
  const [parecerTexto, setParecerTexto] = useState('');

  // Calculations
  const total = interviews.length;
  const realizadas = interviews.filter(i => i.status === 'Realizada').length;
  const agendadas = interviews.filter(i => i.status === 'Agendada').length;
  const canceladas = interviews.filter(i => i.status === 'Cancelada').length;
  const aprovadas = interviews.filter(i => i.resultado === 'Aprovado' || i.resultado === 'Aprovado pelo Cliente').length;
  const taxaAprovacao = realizadas > 0 ? Math.round((aprovadas / realizadas) * 100) : 100;

  const filteredInterviews = interviews.filter(i => {
    const matchesSearch = i.candidatoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          i.vagaTitulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          i.clienteNome.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = selectedTabFilter === 'Todas' ? true :
                       selectedTabFilter === 'Pendentes de parecer' ? (!i.parecer || i.parecer.includes('Aguardando')) :
                       selectedTabFilter === 'Realizadas' ? i.status === 'Realizada' :
                       selectedTabFilter === 'Canceladas' ? i.status === 'Cancelada' : true;

    return matchesSearch && matchesTab;
  });

  const handleCreateInterview = (e: React.FormEvent) => {
    e.preventDefault();
    const newInterview: HeadhunterInterview = {
      id: `int-${Date.now()}`,
      empresaId: 'emp-001',
      criadoPor: consultorNome,
      criadoEm: new Date().toISOString().split('T')[0],
      status: 'Agendada',
      clienteNome,
      vagaTitulo,
      consultorNome,
      recrutadorNome,
      candidatoNome,
      dataHora,
      modalidade,
      linkModalidade,
      pauta,
      feedback: 'Aguardando sessão.',
      parecer: 'Aguardando parecer técnico pós-entrevista.',
      resultado: 'Em Avaliação',
      proximaEtapa: 'Devolutiva ao Cliente'
    };

    onAddInterview(newInterview);
    setShowModal(false);
  };

  const handleSaveParecer = () => {
    if (interviewForParecer) {
      interviewForParecer.parecer = parecerTexto;
      interviewForParecer.status = 'Realizada';
      setInterviewForParecer(null);
    }
  };

  const filterTabs = ['Todas', 'Hoje', 'Esta semana', 'Pendentes de parecer', 'Realizadas', 'Canceladas'];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Gestão de Entrevistas Executivas</h2>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-200">
              {agendadas} agendadas
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Agende, registre pareceres e envie convites para reuniões de avaliação técnica e executiva.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Agendar Entrevista</span>
        </button>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Realizadas</span>
          <p className="text-2xl font-black text-slate-900">{realizadas}</p>
          <span className="text-[10px] text-slate-400 font-medium">Sessões concluídas</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Agendadas</span>
          <p className="text-2xl font-black text-indigo-600">{agendadas}</p>
          <span className="text-[10px] text-indigo-600 font-bold">Próximas sessões</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Canceladas</span>
          <p className="text-2xl font-black text-rose-600">{canceladas}</p>
          <span className="text-[10px] text-rose-600 font-bold">Não realizadas</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Aprovadas</span>
          <p className="text-2xl font-black text-emerald-600">{aprovadas}</p>
          <span className="text-[10px] text-emerald-600 font-bold">Aprovadas no processo</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Taxa Aprovação</span>
          <p className="text-2xl font-black text-amber-600">{taxaAprovacao}%</p>
          <span className="text-[10px] text-amber-600 font-bold">Eficiência da banca</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar entrevista por candidato, vaga ou cliente..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pt-2 border-t border-slate-100">
          {filterTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTabFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                selectedTabFilter === tab
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Interview Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredInterviews.map(int => (
          <div key={int.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3 gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {int.modalidade}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                      int.status === 'Realizada' ? 'bg-emerald-100 text-emerald-800' :
                      int.status === 'Agendada' ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {int.status}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1">{int.candidatoNome}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {int.vagaTitulo} • <strong className="text-slate-800">{int.clienteNome}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-slate-900 block bg-slate-100 px-2.5 py-1 rounded-xl">
                    {new Date(int.dataHora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                <p className="text-slate-700"><strong>Pauta:</strong> {int.pauta}</p>
                <p className="text-slate-700"><strong>Entrevistador:</strong> {int.consultorNome}</p>
                <p className="text-slate-700"><strong>Parecer:</strong> <span className="font-medium text-slate-600">{int.parecer}</span></p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setInterviewForParecer(int);
                  setParecerTexto(int.parecer || '');
                }}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl cursor-pointer transition-all"
              >
                Registrar Parecer
              </button>

              <button
                onClick={() => onOpenAiModal('feedbackEntrevista', { candidateName: int.candidatoNome, jobTitle: int.vagaTitulo })}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Gerar Parecer IA</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Registrar Parecer */}
      {interviewForParecer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Registrar Parecer da Entrevista</h3>
              <button onClick={() => setInterviewForParecer(null)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Candidato: <strong>{interviewForParecer.candidatoNome}</strong> • Vaga: <strong>{interviewForParecer.vagaTitulo}</strong>
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Parecer Técnico e Executivo</label>
                <textarea
                  rows={4}
                  value={parecerTexto}
                  onChange={e => setParecerTexto(e.target.value)}
                  placeholder="Escreva a avaliação sobre o comportamento, experiência e alinhamento do candidato..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button onClick={() => setInterviewForParecer(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancelar</button>
                <button onClick={handleSaveParecer} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl cursor-pointer hover:bg-indigo-700">Salvar Parecer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Entrevista */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Agendar Nova Entrevista</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateInterview} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome do Candidato</label>
                <input required type="text" value={candidatoNome} onChange={e => setCandidatoNome(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vaga / Mandato</label>
                  <input required type="text" value={vagaTitulo} onChange={e => setVagaTitulo(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cliente Corporativo</label>
                  <input required type="text" value={clienteNome} onChange={e => setClienteNome(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data e Hora</label>
                  <input required type="datetime-local" value={dataHora} onChange={e => setDataHora(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Modalidade</label>
                  <select value={modalidade} onChange={e => setModalidade(e.target.value as any)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="Online (Meet)">Online (Google Meet)</option>
                    <option value="Online (Teams)">Online (MS Teams)</option>
                    <option value="Presencial">Presencial no Cliente</option>
                    <option value="Telefone">Telefone</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pauta da Entrevista</label>
                <textarea rows={2} value={pauta} onChange={e => setPauta(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl cursor-pointer hover:bg-indigo-700">Agendar Entrevista</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
