import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Plus,
  Kanban,
  List,
  Building2,
  Users,
  CheckCircle2,
  Archive,
  Lock,
} from 'lucide-react';
import { Job, JobFilterParams, JobStatus } from '../types/job';
import { INITIAL_JOBS_DATA } from '../data/mockJobsData';
import { JobCard } from './JobCard';
import { JobDetailModal } from './JobDetailModal';
import { JobFormModal } from './JobFormModal';
import { JobFiltersBar } from './JobFiltersBar';
import { useAuth } from '../../auth';
import { Button, Card } from '../../shared';
import { logger } from '../../core';

export interface JobsManagementViewProps {
  initialJobsList?: Job[];
  onOpenCandidatesForJob?: (jobId: string) => void;
}

export const JobsManagementView: React.FC<JobsManagementViewProps> = ({
  initialJobsList,
  onOpenCandidatesForJob,
}) => {
  const { user, hasActionAccess } = useAuth();

  const canCreate = hasActionAccess('create_job');
  const canEdit = hasActionAccess('edit_job');
  const canClose = hasActionAccess('close_job');

  const [jobs, setJobs] = useState<Job[]>(initialJobsList || INITIAL_JOBS_DATA);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [filters, setFilters] = useState<JobFilterParams>({
    searchTerm: '',
    department: 'Todos',
    status: 'Todas',
    type: 'Todos',
    includeArchived: false,
  });

  // Calculate per-department open job count
  const departmentCounts = useMemo(() => {
    const map: Record<string, number> = {};
    jobs.forEach((j) => {
      if (j.status === 'Aberta') {
        map[j.department] = (map[j.department] || 0) + j.openings;
      }
    });
    return map;
  }, [jobs]);

  const handleFilterChange = (newFilters: Partial<JobFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchTerm: '',
      department: 'Todos',
      status: 'Todas',
      type: 'Todos',
      includeArchived: false,
    });
  };

  // Filtered Jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const term = filters.searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        job.title.toLowerCase().includes(term) ||
        job.department.toLowerCase().includes(term) ||
        job.recruiterName.toLowerCase().includes(term) ||
        job.requirements.some((r) => r.toLowerCase().includes(term));

      const matchesDept =
        filters.department === 'Todos' || job.department === filters.department;

      const matchesStatus =
        filters.status === 'Todas' || job.status === filters.status;

      const matchesType = filters.type === 'Todos' || job.type === filters.type;

      const matchesArchive = filters.includeArchived || job.status !== 'Arquivada';

      return (
        matchesSearch && matchesDept && matchesStatus && matchesType && matchesArchive
      );
    });
  }, [jobs, filters]);

  const handleSaveJob = (
    jobData: Omit<Job, 'id' | 'applicantsCount' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === existingId
            ? { ...j, ...jobData }
            : j
        )
      );
      logger.info(`Vaga atualizada: ${existingId}`, 'JobsManagement');
    } else {
      const newJob: Job = {
        ...jobData,
        id: `job-${Date.now()}`,
        applicantsCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setJobs((prev) => [newJob, ...prev]);
      logger.info(`Nova vaga criada: ${newJob.title}`, 'JobsManagement');
    }
  };

  const handleStatusChange = (jobId: string, newStatus: JobStatus) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
    );
    if (selectedJob?.id === jobId) {
      setSelectedJob((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    logger.info(`Status da vaga ${jobId} alterado para ${newStatus}`, 'JobsManagement');
  };

  const handleArchiveJob = (jobId: string) => {
    handleStatusChange(jobId, 'Arquivada');
  };

  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (job: Job) => {
    setEditingJob(job);
    setIsFormOpen(true);
  };

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Gestão de Vagas Corporativas
            </h2>
            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-200">
              {jobs.filter((j) => j.status === 'Aberta').length} abertas
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Cadastre, controle o SLA, vincule orçamentos e acompanhe requisições por departamento.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canCreate ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreateModal}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Nova Vaga
            </Button>
          ) : (
            <div className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" /> Apenas Líderes Criam Vagas
            </div>
          )}
        </div>
      </div>

      {/* Department Open Jobs Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(departmentCounts).map(([deptName, openCount]) => (
          <div
            key={deptName}
            className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1"
          >
            <p className="text-[10px] uppercase font-bold text-slate-400 truncate">{deptName}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-slate-900">{openCount} vaga(s)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <JobFiltersBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalResultsCount={filteredJobs.length}
      />

      {/* Jobs Grid Display */}
      {filteredJobs.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-800">
            Nenhuma vaga encontrada para os filtros aplicados
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tente ajustar a busca ou limpar os filtros para visualizar os registros cadastrados.
          </p>
          <Button variant="outline" size="sm" onClick={handleResetFilters}>
            Resetar Filtros
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onViewDetails={handleViewDetails}
              onEditJob={handleOpenEditModal}
              onArchiveJob={handleArchiveJob}
              canEdit={canEdit}
              canArchive={canClose}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <JobDetailModal
        job={selectedJob}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={handleOpenEditModal}
        onStatusChange={handleStatusChange}
        canEdit={canEdit}
      />

      {/* Form Modal (Create / Edit) */}
      <JobFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaveJob={handleSaveJob}
        initialJob={editingJob}
      />
    </div>
  );
};
