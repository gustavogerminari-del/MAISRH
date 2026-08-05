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
import { normalizeJobStatus, normalizeJobOrigin, normalizeJobData } from '../utils/jobUtils';
import { JobCard } from './JobCard';
import { JobDetailModal } from './JobDetailModal';
import { JobFormModal } from './JobFormModal';
import { JobFiltersBar } from './JobFiltersBar';
import { JobCandidatesManagementView } from './JobCandidatesManagementView';
import { useAuth } from '../../auth';
import { Button, Card } from '../../shared';
import { logger } from '../../core';
import { JobService } from '../../services/JobService';
import { checkHeadhunterVisibility, sanitizeCommercialFields } from '../utils/headhunterAccess';

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
  const { user, activeModules, userPermissions, hasActionAccess } = useAuth();
  const { mostrarFiltroHeadhunter } = checkHeadhunterVisibility(user, activeModules, userPermissions);

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
          return !cId || cId === userCompanyId || cId === 'emp-001';
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
    origem: 'Todas',
    type: 'Todos',
    includeArchived: false,
  });

  const handleFilterChange = (newFilters: Partial<JobFilterParams>) => {
    setSelectedJobForCandidates(null);
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setSelectedJobForCandidates(null);
    setFilters({
      searchTerm: '',
      department: 'Todos',
      status: 'Todas',
      origem: 'Todas',
      type: 'Todos',
      includeArchived: false,
    });
  };

  // Filtered Jobs
  const filteredJobs = useMemo(() => {
    return jobs.map(j => normalizeJobData(j)).filter((job) => {
      const term = filters.searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        job.title.toLowerCase().includes(term) ||
        job.department.toLowerCase().includes(term) ||
        ((job as any).clienteNome && (job as any).clienteNome.toLowerCase().includes(term)) ||
        (job.recruiterName && job.recruiterName.toLowerCase().includes(term)) ||
        (job.requirements && job.requirements.some((r) => r.toLowerCase().includes(term)));

      const matchesDept =
        filters.department === 'Todos' || job.department === filters.department;

      const matchesType = filters.type === 'Todos' || job.type === filters.type;

      // Filter by Origem
      let matchesOrigem = true;
      const origFilter = filters.origem || 'Todas';
      const normOrigin = normalizeJobOrigin(job.origem || job.origemProcesso || job.tipoProcesso);

      if (origFilter === 'Internas') {
        matchesOrigem = normOrigin === 'interna';
      } else if (origFilter === 'Clientes') {
        matchesOrigem = normOrigin === 'cliente';
      } else if (origFilter === 'Headhunter') {
        matchesOrigem = normOrigin === 'headhunter';
      }

      // Filter by Status
      let matchesStatus = true;
      const stFilter = filters.status;
      const normStatus = normalizeJobStatus(job.status);

      if (stFilter === 'Abertas') {
        matchesStatus = normStatus === 'aberta';
      } else if (stFilter === 'Em andamento') {
        matchesStatus = normStatus === 'em_andamento';
      } else if (stFilter === 'Concluídas') {
        matchesStatus = normStatus === 'concluida';
      } else if (stFilter === 'Canceladas') {
        matchesStatus = normStatus === 'cancelada';
      } else if (stFilter !== 'Todas') {
        matchesStatus = normStatus === String(stFilter).toLowerCase();
      }

      return matchesSearch && matchesDept && matchesType && matchesOrigem && matchesStatus;
    });
  }, [jobs, filters]);

  const handleSaveJob = async (jobData: any, existingId?: string) => {
    let updatedList: Job[] = [];
    const resolvedCompanyId = userCompanyId || (user as any)?.companyId || (user as any)?.empresaId || 'emp-001';
    
    if (existingId) {
      updatedList = jobs.map((j) => (j.id === existingId ? normalizeJobData({ ...j, ...jobData }) : j));
      setJobs(updatedList);
      logger.info(`Vaga atualizada: ${existingId}`, 'JobsManagement');
    } else {
      const newJob: Job = normalizeJobData({
        ...jobData,
        id: jobData.id || `vaga-${Date.now()}`,
        companyId: resolvedCompanyId,
        empresaId: resolvedCompanyId,
        applicantsCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        publicada: true,
      });
      updatedList = [newJob, ...jobs];
      setJobs(updatedList);
      logger.info(`Nova vaga criada: ${newJob.title}`, 'JobsManagement');
    }

    // Refetch latest jobs directly from Firestore jobs collection
    try {
      const freshJobs = await JobService.list(isMaster ? undefined : userCompanyId);
      if (freshJobs && freshJobs.length > 0) {
        setJobs(freshJobs.map(j => normalizeJobData(j)));
      }
    } catch (e) {
      console.warn('Erro ao atualizar lista de vagas do Firestore:', e);
    }

    // Clear incompatible filters so new job appears immediately
    setFilters(prev => ({ ...prev, status: 'Todas', origem: 'Todas', searchTerm: '' }));

    if (onUpdateJobs) {
      onUpdateJobs(updatedList);
    }
  };

  const handleOpenDetail = (job: Job) => {
    setSelectedJob(normalizeJobData(job));
    setIsDetailOpen(true);
  };

  const handleOpenEdit = (job: Job) => {
    setEditingJob(normalizeJobData(job));
    setIsFormOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingJob(null);
    setIsFormOpen(true);
  };

  if (selectedJobForCandidates) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">Gestão da Vaga</span>
            <h3 className="text-lg font-black text-slate-900">{selectedJobForCandidates.title}</h3>
          </div>
          <Button variant="outline" size="sm" onClick={() => setSelectedJobForCandidates(null)}>
            Voltar para Vagas
          </Button>
        </div>
        <JobCandidatesManagementView jobId={selectedJobForCandidates.id} jobTitle={selectedJobForCandidates.title} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Gestão de Vagas Corporativas
            </h2>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-200">
              {jobs.length} posições
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Painel unificado para controle de vagas internas, recrutamento para clientes e busca ativa (Headhunter).
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Cadastrar Nova Vaga Corporativa</span>
        </button>
      </div>

      {/* Filters Bar */}
      <JobFiltersBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalResultsCount={filteredJobs.length}
      />

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-base font-extrabold text-slate-800">Nenhuma vaga encontrada</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Não existem vagas correspondentes aos filtros selecionados. Tente ajustar a busca ou cadastrar uma nova vaga corporativa.
          </p>
          <Button variant="outline" size="sm" onClick={handleResetFilters}>
            Limpar Filtros
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onOpenDetail={() => handleOpenDetail(job)}
              onOpenEdit={() => handleOpenEdit(job)}
              onManageCandidates={() => handleManageCandidates(job)}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          job={selectedJob}
          onEdit={() => {
            setIsDetailOpen(false);
            handleOpenEdit(selectedJob);
          }}
          onManageCandidates={() => {
            setIsDetailOpen(false);
            handleManageCandidates(selectedJob);
          }}
        />
      )}

      {/* Official Form Modal */}
      <JobFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialJob={editingJob}
        openedFromModule="recrutamento"
        onSaveJob={handleSaveJob}
      />
    </div>
  );
};
