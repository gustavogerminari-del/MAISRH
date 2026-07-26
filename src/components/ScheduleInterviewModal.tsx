import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { Interview, Candidate, Job } from '../types/rh';

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (interview: Omit<Interview, 'id' | 'status'>) => void;
  candidates: Candidate[];
  jobs: Job[];
}

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  candidates,
  jobs,
}) => {
  const [candidateId, setCandidateId] = useState(candidates[0]?.id || '');
  const [jobId, setJobId] = useState(jobs[0]?.id || '');
  const [interviewerName, setInterviewerName] = useState('Luciana Mello (Gestora)');
  const [date, setDate] = useState('2026-07-28');
  const [time, setTime] = useState('15:00');
  const [type, setType] = useState<'Entrevista RH' | 'Teste Técnico' | 'Entrevista com Gestor' | 'Fit Cultural'>('Entrevista com Gestor');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cand = candidates.find(c => c.id === candidateId) || candidates[0];
    const job = jobs.find(j => j.id === jobId) || jobs[0];

    onSubmit({
      candidateId: cand.id,
      candidateName: cand.name,
      candidateRole: cand.role,
      jobId: job.id,
      jobTitle: job.title,
      interviewerName,
      date,
      time,
      type,
      locationUrl: 'https://meet.google.com/mais-rh-interview',
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <h3 className="text-xl font-extrabold text-slate-900">Agendar Entrevista</h3>
        </div>

        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Selecione o Candidato *</label>
            <select
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-xl font-medium outline-none focus:border-indigo-500"
            >
              {candidates.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Vaga Correspondente *</label>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-xl font-medium outline-none focus:border-indigo-500"
            >
              {jobs.map(j => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Data *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-xl font-medium outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Horário *</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-xl font-medium outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Tipo de Avaliação *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-xl font-medium outline-none focus:border-indigo-500"
            >
              <option value="Entrevista RH">Entrevista RH</option>
              <option value="Teste Técnico">Teste Técnico</option>
              <option value="Entrevista com Gestor">Entrevista com Gestor</option>
              <option value="Fit Cultural">Fit Cultural</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Entrevistador / Avaliador *</label>
            <input
              type="text"
              required
              value={interviewerName}
              onChange={(e) => setInterviewerName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-xl font-medium outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Observações para a Reunião</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instruções para o candidato ou pauta de perguntas..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-xl font-medium outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-xs cursor-pointer"
          >
            Confirmar Agendamento
          </button>
        </div>
      </form>
    </div>
  );
};
