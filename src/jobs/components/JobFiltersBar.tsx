import React from 'react';
import { Filter, Search, RotateCcw, Building2, Briefcase } from 'lucide-react';
import { JobFilterParams } from '../types/job';
import {
  JOB_STATUS_OPTIONS,
  JOB_TYPE_OPTIONS,
  CORPORATE_DEPARTMENTS,
} from '../constants/jobOptions';
import { SearchBar } from '../../shared';

export interface JobFiltersBarProps {
  filters: JobFilterParams;
  onFilterChange: (newFilters: Partial<JobFilterParams>) => void;
  onResetFilters: () => void;
  totalResultsCount: number;
}

export const JobFiltersBar: React.FC<JobFiltersBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResultsCount,
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="flex-1">
          <SearchBar
            value={filters.searchTerm}
            onChange={(val) => onFilterChange({ searchTerm: val })}
            placeholder="Buscar por cargo, palavra-chave ou recrutador..."
          />
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2">
          <select
            value={filters.department}
            onChange={(e) => onFilterChange({ department: e.target.value })}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="Todos">Todos os Departamentos</option>
            {CORPORATE_DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Contract Type Filter */}
          <select
            value={filters.type}
            onChange={(e) => onFilterChange({ type: e.target.value })}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="Todos">Todos os Contratos</option>
            {JOB_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Bar Tabs & Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-extrabold uppercase text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-indigo-600" /> Status:
          </span>

          {['Todas', ...JOB_STATUS_OPTIONS].map((st) => (
            <button
              key={st}
              onClick={() => onFilterChange({ status: st })}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filters.status === st
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="font-bold text-slate-700">
            {totalResultsCount} vaga(s) encontrada(s)
          </span>

          <button
            onClick={onResetFilters}
            className="text-indigo-600 hover:text-indigo-800 font-extrabold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Limpar
          </button>
        </div>
      </div>
    </div>
  );
};
