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
import { normalizeJobStatus, normalizeJobData } from '../utils/jobUtils';
import { INITIAL_JOBS_DATA } from '../data/mockJobsData';
import { JobCard } from './JobCard';
import { JobDetailModal } from './JobDetailModal';
import { JobFormModal } from './JobFormModal';
import { JobFiltersBar } from './JobFiltersBar';
import { JobCandidatesManagementView } from './JobCandidatesManagementView';
import { useAuth } from '../../auth';
import { Button, Card } from '../../shared';
import { logger } from '../../core';
import { JobService } from '../../services/JobService';

export interface JobsManagementViewProps {
  initialJobsList?: Job[];
  onOpenCandidatesForJob?: (jobId: string) => void;
  onUpdateJobs?: (updatedJobs: Job[]) => void;
}

export const JobsManagementView: React.FC<JobsManagementViewProps> = ({
  initialJobsList,
  onOpenCandidatesForJob,
  onUpdateJobs,
}) => {
  const { user, hasActionAccess } = useAuth();

  const canCreate = hasActionAccess('create_job');
  const canEdit = hasActionAccess('edit_job');
  const canClose = hasActionAccess('close_job');

  const userCompanyId = user?.empresaId || user?.companyId || user?.tenantId;
  const isMaster = user?.role === 'Super Administrador' || user?.role === 'MASTER' || user?.tipoUsuario === 'MASTER' || user?.isMaster === true;

  const rawJobs = initialJobsList !== undefined ? initialJobsList : [];

  const companyJobs = useMemo(() => {
    const list = isMaster || !userCompanyId
      ? rawJobs
      : rawJobs.filter((j: any) => {
          const cId = j.companyId || j.empresaId || j.tenantId;
          return !cId || cId === userCompanyId;
        });

    return list.map(j => normalizeJobData(j));
  }, [rawJobs, isMaster, userCompanyId]);

  const [jobs, setJobs] = useState<Job[]>(companyJobs);

  React.useEffect(() => {
    setJobs(companyJobs);
  }, [companyJobs]);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedJobForCandidates, setSelectedJobForCandidates] = useState<Job | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const handleManageCandidates = (job: Job) => {
    setSelectedJobForCandidates(normalizeJobData(job));
    if (onOpenCandidatesForJob) {
      onOpenCandidatesForJob(job.id);
    }
  };

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
    jobs.forEach((raw) => {
      const j = normalizeJobData(raw);
      if (j.status === 'Aberta' && !j.archived) {
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

  // Filtered Jobs with strict normalize status logic
  const filteredJobs = useMemo(() => {
    return jobs.map(j => normalizeJobData(j)).filter((job) => {
      const term = filters.searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        job.title.toLowerCase().includes(term) ||
        job.department.toLowerCase().includes(term) ||
        (job.recruiterName && job.recruiterName.toLowerCase().includes(term)) ||
        (job.requirements && job.requirements.some((r) => r.toLowerCase().includes(term)));

      const matchesDept =
        filters.department === 'Todos' || job.department === filters.department;

      const matchesType = filters.type === 'Todos' || job.type === filters.type;

      let matchesStatus = false;
      const normFilterStatus = normalizeJobStatus(filters.status);

      if (filters.status === 'Todas') {
        matchesStatus = filters.includeArchived ? true : job.status !== 'Arquivada' && !job.archived;
      } else if (filters.status === 'Arquivada' || normFilterStatus === 'Arquivada') {
        matchesStatus = job.status === 'Arquivada' || job.archived === true || (job as any).isArchived === true;
      } else {
        matchesStatus = job.status === normFilterStatus;
      }

      return matchesSearch && matchesDept && matchesType && matchesStatus;
    });
  }, [jobs, filters]);

  const handleSaveJob = async (
    jobData: Omit<Job, 'id' | 'applicantsCount' | 'createdAt'>,
    existingId?: string
  ) => {
    let updatedList: Job[] = [];
    const resolvedCompanyId = userCompanyId || (user as any)?.companyId || (user as any)?.empresaId || 'emp-001';
    
    if (existingId) {
      updatedList = jobs.map((j) => (j.id === existingId ? normalizeJobData({ ...j, ...jobData }) : j));
      setJobs(updatedList);
      logger.info(`Vaga atualizada: ${existingId}`, 'JobsManagement');
      try {
        await JobService.update(existingId, jobData);
      } catch (err) {
        console.error('Erro ao atualizar vaga no Firestore:', err);
      }
    } else {
      const newJob: Job = normalizeJobData({
        ...jobData,
        id: `vaga-${Date.now()}`,
        companyId: resolvedCompanyId,
        empresaId: resolvedCompanyId,
        applicantsCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        publicada: true,
      });
      updatedList = [newJob, ...jobs];
      setJobs(updatedList);
      logger.info(`Nova vaga criada: ${newJob.title}`, 'JobsManagement');
      try {
        await JobService.create(newJob);
      } catch (err) {
        console.error('Erro ao criar vaga no Firestore:', err);
      }
    }
    if (onUpdateJobs) {
      onUpdateJobs(updatedList);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    const isArchiving = newStatus === 'Arquivada';
    const isRestoring = newStatus === 'Fechada' || newStatus === 'Aberta';

    const updatedList = jobs.map((j) => {
      if (j.id === jobId) {
        return normalizeJobData({
          ...j,
          status: newStatus,
          archived: isArchiving ? true : isRestoring ? false : j.archived,
          isArchived: isArchiving ? true : isRestoring ? false : (j as any).isArchived,
          archivedAt: isArchiving ? new Date().toISOString() : isRestoring ? null : (j as any).archivedAt,
          updatedAt: new Date().toISOString()
        });
      }
      return j;
    });

    setJobs(updatedList);
    if (selectedJob?.id === jobId) {
      setSelectedJob(updatedList.find(j => j.id === jobId) || null);
    }
    if (onUpdateJobs) {
      onUpdateJobs(updatedList);
    }

    logger.info(`Status da vaga ${jobId} alterado para ${newStatus}`, 'JobsManagement');

    try {
      if (isArchiving) {
        await JobService.update(jobId, {
          status: 'arquivada',
          archived: true,
          isArchived: true,
          archivedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else if (isRestoring) {
        await JobService.update(jobId, {
          status: newStatus.toLowerCase(),
          archived: false,
          isArchived: false,
          archivedAt: null,
          updatedAt: new Date().toISOString()
        });
      } else {
        await JobService.update(jobId, {
          status: newStatus,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Erro ao atualizar status no Firestore:', err);
    }
  };

  const handleArchiveJob = (jobId: string) => {
    handleStatusChange(jobId, 'Arquivada');
  };

  const handleRestoreJob = (jobId: string) => {
    handleStatusChange(jobId, 'Fechada');
  };

  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (job: Job) => {
    setEditingJob(normalizeJobData(job));
    setIsFormOpen(true);
  };

  const handleViewDetails = (job: Job) => {
    setSelectedJob(normalizeJobData(job));
    setIsDetailOpen(true);
  };

  if (selectedJobForCandidates) {
    return (
      <JobCandidatesManagementView
        job={selectedJobForCandidates}
        onBack={() => setSelectedJobForCandidates(null)}
      />
    );
  }

  const openJobsCount = jobs.filter((j) => {
    const norm = normalizeJobData(j);
    return norm.status === 'Aberta' && !norm.archived;
  }).length;

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
              {openJobsCount} abertas
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
              onManageCandidates={handleManageCandidates}
              onEditJob={handleOpenEditModal}
              onArchiveJob={handleArchiveJob}
              onRestoreJob={handleRestoreJob}
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
        onManageCandidates={handleManageCandidates}
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

