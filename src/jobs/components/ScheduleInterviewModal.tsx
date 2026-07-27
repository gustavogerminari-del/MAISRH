import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Video, Phone, User, FileText } from 'lucide-react';
import { Button } from '../../shared';
import { InterviewData } from '../../services/JobCandidateService';

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  onSave: (interviewData: InterviewData) => Promise<void>;
  initialData?: InterviewData;
}

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  isOpen,
  onClose,
  candidateName,
  onSave,
  initialData,
}) => {
  const [type, setType] = useState<'Presencial' | 'Online' | 'Telefone'>(initialData?.type || 'Online');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(initialData?.time || '10:00');
  const [interviewer, setInterviewer] = useState(initialData?.interviewer || 'Recrutador RH');
  const [location, setLocation] = useState(initialData?.location || 'Sede da Empresa - Sala 3B');
  const [meetingLink, setMeetingLink] = useState(initialData?.meetingLink || 'https://meet.google.com/mais-rh-entrevista');
  const [notes, setNotes] = useState(initialData?.notes || 'Entrevista por competências e alinhamento de expectativas.');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        type,
        date,
        time,
        interviewer,
        location: type === 'Presencial' ? location : undefined,
        meetingLink: type === 'Online' ? meetingLink : undefined,
        notes,
        status: 'Agendada'
      });
      onClose();
    } catch (err) {
      console.error('Erro ao agendar entrevista:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Agendar Entrevista</h3>
            <p className="text-xs text-slate-500 font-medium">
              Candidato: <span className="font-bold text-slate-700">{candidateName}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Entrevista */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Tipo de Reunião
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('Online')}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  type === 'Online'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Video className="w-4 h-4" />
                Online
              </button>

              <button
                type="button"
                onClick={() => setType('Presencial')}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  type === 'Presencial'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <MapPin className="w-4 h-4" />
                Presencial
              </button>

              <button
                type="button"
                onClick={() => setType('Telefone')}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  type === 'Telefone'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Phone className="w-4 h-4" />
                Telefone
              </button>
            </div>
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Data
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Horário
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Entrevistador */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Entrevistador / Responsável
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={interviewer}
                onChange={(e) => setInterviewer(e.target.value)}
                placeholder="Ex: Carla Dias (RH) / Gestor da vaga"
                className="w-full text-xs font-semibold pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Link da Reunião se Online */}
          {type === 'Online' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Link da Reunião (Google Meet / Teams / Zoom)
              </label>
              <div className="relative">
                <Video className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full text-xs font-semibold pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Local se Presencial */}
          {type === 'Presencial' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Local / Endereço / Sala
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Av. Paulista 1000 - Sala 302"
                  className="w-full text-xs font-semibold pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Observações */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Observações / Pauta
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Ex: Foco em avaliação de competências técnicas e alinhamento de pretensão salarial."
                className="w-full text-xs font-semibold pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar e Agendar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
