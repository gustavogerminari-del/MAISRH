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
  FileText
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
  const [showModal, setShowModal] = useState(false);
  const [vagaTitulo, setVagaTitulo] = useState(jobs[0]?.cargo || 'Head of Growth');
  const [clienteNome, setClienteNome] = useState(clients[0]?.nomeFantasia || 'Grupo Nexus Tech');
  const [candidatoNome, setCandidatoNome] = useState('');
  const [consultorNome, setConsultorNome] = useState('Carlos Headhunter');
  const [recrutadorNome, setRecrutadorNome] = useState('Ana Clara Recrutadora');
  const [dataHora, setDataHora] = useState('2026-03-25T14:00');
  const [modalidade, setModalidade] = useState<'Presencial' | 'Online (Meet)' | 'Online (Teams)' | 'Telefone'>('Online (Meet)');
  const [linkModalidade, setLinkModalidade] = useState('https://meet.google.com/xyz-123');
  const [pauta, setPauta] = useState('Avaliação de fit cultural, pretensão salarial e aderência técnica.');

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
      parecer: 'Aguardando parecer.',
      resultado: 'Em Avaliação',
      proximaEtapa: 'Devolutiva ao Cliente'
    };

    onAddInterview(newInterview);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Agenda & Registro de Entrevistas Executivas</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Agendamento de sessões com candidatos, links de videochamada, pautas, pareceres e feedbacks automáticos.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Nova Entrevista</span>
        </button>
      </div>

      {/* INTERVIEWS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {interviews.map(int => (
          <div key={int.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  {int.modalidade}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">{int.candidatoNome}</h3>
                <p className="text-xs text-slate-500 font-medium">{int.vagaTitulo} • <strong className="text-slate-800">{int.clienteNome}</strong></p>
              </div>

              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800">
                {new Date(int.dataHora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <p><strong>Pauta:</strong> {int.pauta}</p>
              <p><strong>Feedback:</strong> {int.feedback}</p>
              <p><strong>Resultado:</strong> <span className="font-extrabold text-emerald-600">{int.resultado}</span></p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Consultor: {int.consultorNome}</span>
              <button
                onClick={() => onOpenAiModal('feedbackEntrevista', { candidateName: int.candidatoNome, jobTitle: int.vagaTitulo })}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Gerar Feedback IA</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Interview Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Agendar Entrevista com Executivo</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateInterview} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome do Candidato Executivo</label>
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
                    <option value="Presencial">Presencial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Link ou Endereço</label>
                <input required type="text" value={linkModalidade} onChange={e => setLinkModalidade(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
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
