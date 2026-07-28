import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle2, 
  Phone, 
  Users, 
  MapPin, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { HeadhunterEvent } from '../types';

interface HeadhunterAgendaProps {
  events: HeadhunterEvent[];
  onAddEvent: (event: HeadhunterEvent) => void;
}

export const HeadhunterAgenda: React.FC<HeadhunterAgendaProps> = ({
  events,
  onAddEvent
}) => {
  const [showModal, setShowModal] = useState(false);
  const [tipo, setTipo] = useState<HeadhunterEvent['tipo']>('Reunião');
  const [titulo, setTitulo] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [candidatoNome, setCandidatoNome] = useState('');
  const [dataHora, setDataHora] = useState('2026-03-26T10:00');
  const [consultorNome, setConsultorNome] = useState('Carlos Headhunter');
  const [descricao, setDescricao] = useState('');

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: HeadhunterEvent = {
      id: `evt-${Date.now()}`,
      empresaId: 'emp-001',
      criadoPor: consultorNome,
      criadoEm: new Date().toISOString().split('T')[0],
      status: 'Agendado',
      tipo,
      titulo,
      clienteNome,
      candidatoNome,
      dataHora,
      consultorNome,
      descricao,
      concluido: false
    };

    onAddEvent(newEvent);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Agenda Executive Search & Compromissos</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Controle unificado de reuniões, entrevistas, reuniões com clientes, retornos e ligações.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Compromisso na Agenda</span>
        </button>
      </div>

      {/* AGENDA EVENTS LIST */}
      <div className="space-y-3">
        {events.map(evt => (
          <div key={evt.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {evt.tipo}
                  </span>
                  <h4 className="text-sm font-black text-slate-900">{evt.titulo}</h4>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  {evt.clienteNome && <span>Cliente: <strong>{evt.clienteNome}</strong> • </span>}
                  Consultor: {evt.consultorNome}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs font-black text-slate-900 block">
                {new Date(evt.dataHora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">{evt.descricao}</span>
            </div>
          </div>
        ))}
      </div>

      {/* New Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Novo Compromisso na Agenda</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Título do Compromisso</label>
                <input required type="text" value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Evento</label>
                  <select value={tipo} onChange={e => setTipo(e.target.value as any)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="Reunião">Reunião</option>
                    <option value="Entrevista">Entrevista</option>
                    <option value="Visita">Visita</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Pendência">Pendência</option>
                    <option value="Retorno">Retorno</option>
                    <option value="Ligação">Ligação</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data e Hora</label>
                  <input required type="datetime-local" value={dataHora} onChange={e => setDataHora(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Empresa / Cliente (Opcional)</label>
                <input type="text" value={clienteNome} onChange={e => setClienteNome(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição</label>
                <input required type="text" value={descricao} onChange={e => setDescricao(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl cursor-pointer hover:bg-indigo-700">Agendar Compromisso</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
