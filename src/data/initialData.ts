import { Job, Candidate, Interview, Department, Recruiter, Stage } from '../types/rh';

export const fontStages: Stage[] = [
  { id: 'inscritos', name: 'Inscritos', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  { id: 'triagem', name: 'Triagem', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'entrevista_rh', name: 'Entrevista RH', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'teste_tecnico', name: 'Teste Técnico', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'entrevista_gestor', name: 'Entrevista Gestor', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'proposta', name: 'Proposta', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'contratado', name: 'Contratado', color: 'bg-teal-50 text-teal-800 border-teal-200' },
];

export const INITIAL_JOBS: Job[] = [];

export const INITIAL_CANDIDATES: Candidate[] = [];

export const INITIAL_INTERVIEWS: Interview[] = [];

export const INITIAL_DEPARTMENTS: Department[] = [];

export const INITIAL_RECRUITERS: Recruiter[] = [];
