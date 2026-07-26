import React from 'react';
import { JobStatus } from '../types/job';

export interface JobStatusBadgeProps {
  status: JobStatus;
  size?: 'sm' | 'md';
}

export const JobStatusBadge: React.FC<JobStatusBadgeProps> = ({ status, size = 'sm' }) => {
  const stylesMap: Record<JobStatus, string> = {
    'Aberta': 'bg-emerald-50 text-emerald-800 border-emerald-200',
    'Pausada': 'bg-amber-50 text-amber-800 border-amber-200',
    'Fechada': 'bg-slate-100 text-slate-700 border-slate-200',
    'Arquivada': 'bg-rose-50 text-rose-800 border-rose-200',
    'Rascunho': 'bg-indigo-50 text-indigo-800 border-indigo-200',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 rounded-md font-extrabold',
    md: 'text-xs px-2.5 py-1 rounded-lg font-extrabold',
  };

  return (
    <span className={`border ${stylesMap[status]} ${sizeStyles[size]} inline-flex items-center gap-1 shrink-0`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {status}
    </span>
  );
};
