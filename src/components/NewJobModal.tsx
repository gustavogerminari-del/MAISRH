import React, { useState } from 'react';
import { X, Plus, FileText } from 'lucide-react';
import { Job, JobType, JobLocationType } from '../types/rh';

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (job: Omit<Job, 'id' | 'applicantsCount' | 'createdAt'>) => void;
  departments: string[];
}

export const NewJobModal: React.FC<NewJobModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  departments,
}) => {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState(departments[0] || 'Tecnologia');
  const [location, setLocation] = useState('São Paulo - SP');
  const [locationType, setLocationType] = useState<JobLocationType>('Híbrido');
  const [type, setType] = useState<JobType>('CLT');
  const [salaryRange, setSalaryRange] = useState('R$ 8.000 - R$ 12.000');
  const [openings, setOpenings] = useState(1);
  const [deadline, setDeadline] = useState('2026-08-30');
  const [description, setDescription] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [recruiterName, setRecruiterName] = useState('Luciana Mello');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requirements = requirementsText.split('\n').filter(r => r.trim().length > 0);

    onSubmit({
      title,
      department,
      location,
      locationType,
      type,
      status: 'ativa',
      publicada: true,
      salaryRange,
      openings,
      deadline,
      description,
      requirements,
      recruiterName,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          <h3 className="text-xl font-extrabold text-slate-900">Cadastrar Nova Vaga</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2 space-y-1">
            <label className="font-bold text-slate-700">Título da Vaga *</label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Desenvolvedor Senior React / TypeScript"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-xl font-medium outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Departamento *</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-xl font-medium outline-none focus:border-indigo-500"
            >
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Modelo de Trabalho *</label>
            <select
              value={locationType}
              onChange={(e) => setLocationType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-xl font-medium outline-none focus:border-indigo-500"
            >
              <option value="Remoto">Remoto</option>
              <option value="Híbrido">Híbrido</option>
              <option value="Presencial">Presencial</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Localização Cidade/UF</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-xl font-medium outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Faixa Salarial</label>
            <input
              type="text"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
              placeholder="Ex: R$ 8.000 - R$ 12.000"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-xl font-medium outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Quantidade de Vagas</label>
            <input
              type="number"
              min={1}
              value={openings}
              onChange={(e) => setOpenings(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-xl font-medium outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Data Limite de Seleção</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-xl font-medium outline-none focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="font-bold text-slate-700">Descrição do Cargo & Responsabilidades *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva as principais atividades do cargo..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-xl font-medium outline-none focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="font-bold text-slate-700">Requisitos (um por linha)</label>
            <textarea
              rows={3}
              value={requirementsText}
              onChange={(e) => setRequirementsText(e.target.value)}
              placeholder="Ex: 3+ anos em React&#10;Inglês avançado&#10;Conhecimento em Docker"
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
            Publicar Vaga
          </button>
        </div>
      </form>
    </div>
  );
};
