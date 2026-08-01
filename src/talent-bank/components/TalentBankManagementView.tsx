import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Award,
  Star,
  CheckCircle2,
  Lock,
  Search,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { Candidate, CandidateFilterParams } from '../types/candidate';
import { CandidateCard } from './CandidateCard';
import { CandidateDetailModal } from './CandidateDetailModal';
import { CandidateFormModal } from './CandidateFormModal';
import { CandidateFiltersBar } from './CandidateFiltersBar';
import { Job } from '../../jobs';
import { useAuth } from '../../auth';
import { Button, Card } from '../../shared';
import { logger } from '../../core';
import { ContextualAiModal } from '../../ai/components/ContextualAiModal';
import { talentBankAiService } from '../../ai/services/aiService';

export interface TalentBankManagementViewProps {
  initialCandidatesList?: Candidate[];
  jobsList?: Job[];
  onAssignCandidateToJob?: (candidateId: string, jobId: string) => void;
  searchTermExternal?: string;
}

export const TalentBankManagementView: React.FC<TalentBankManagementViewProps> = ({
  initialCandidatesList,
  jobsList,
  onAssignCandidateToJob,
  searchTermExternal,
}) => {
  const { user, hasActionAccess } = useAuth();

  const canDeleteCandidate = hasActionAccess('delete_candidate');
  // General edit permission for candidate management
  const canEditCandidate = true; // All authenticated HR users can manage profiles

  const userCompanyId = user?.empresaId || user?.companyId || user?.tenantId;
  const isMaster = user?.role === 'Super Administrador' || user?.role === 'MASTER' || user?.tipoUsuario === 'MASTER' || user?.isMaster === true;

  const [candidates, setCandidates] = useState<Candidate[]>(
    initialCandidatesList || []
  );

  const rawJobs = jobsList !== undefined ? jobsList : [];
  const jobs = useMemo(() => {
    if (isMaster || !userCompanyId) return rawJobs;
    return rawJobs.filter((j: any) => {
      const cId = j.companyId || j.empresaId || j.tenantId;
      return !cId || cId === userCompanyId;
    });
  }, [rawJobs, isMaster, userCompanyId]);

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);

  const [filters, setFilters] = useState<CandidateFilterParams>({
    searchTerm: searchTermExternal || '',
    departmentArea: 'Todas',
    classification: 'Todas',
    status: 'Todos',
    skill: 'Todas',
    availability: 'Todas',
    includeArchived: false,
  });

  const handleFilterChange = (newFilters: Partial<CandidateFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchTerm: '',
      departmentArea: 'Todas',
      classification: 'Todas',
      status: 'Todos',
      skill: 'Todas',
      availability: 'Todas',
      includeArchived: false,
    });
  };

  // Filtered Candidate List
  const filteredCandidates = useMemo(() => {
    return candidates.filter((cand) => {
      const term = (filters.searchTerm || searchTermExternal || '').toLowerCase().trim();
      const matchesSearch =
        !term ||
        cand.name.toLowerCase().includes(term) ||
        cand.role.toLowerCase().includes(term) ||
        cand.location.toLowerCase().includes(term) ||
        cand.skills.some((s) => s.toLowerCase().includes(term));

      const matchesArea =
        filters.departmentArea === 'Todas' || cand.departmentArea === filters.departmentArea;

      const matchesClassification =
        filters.classification === 'Todas' || cand.classification === filters.classification;

      const matchesStatus =
        filters.status === 'Todos' || cand.status === filters.status;

      const matchesSkill =
        filters.skill === 'Todas' || cand.skills.includes(filters.skill);

      const matchesArchive =
        filters.includeArchived || cand.classification !== 'Arquivado';

      return (
        matchesSearch &&
        matchesArea &&
        matchesClassification &&
        matchesStatus &&
        matchesSkill &&
        matchesArchive
      );
    });
  }, [candidates, filters, searchTermExternal]);

  // Stat Counters
  const totalCount = candidates.length;
  const recommendedCount = candidates.filter((c) => c.classification === 'Recomendado').length;
  const highPotentialCount = candidates.filter((c) => c.classification === 'Alto Potencial').length;
  const inProcessCount = candidates.filter((c) => c.status === 'Em Processo').length;

  const handleSaveCandidate = (
    candidateData: Omit<Candidate, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === existingId
            ? { ...c, ...candidateData, updatedAt: new Date().toISOString().split('T')[0] }
            : c
        )
      );
      logger.info(`Perfil de candidato atualizado: ${existingId}`, 'TalentBank');
    } else {
      const newCand: Candidate = {
        ...candidateData,
        id: `cand-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCandidates((prev) => [newCand, ...prev]);
      logger.info(`Novo candidato cadastrado: ${newCand.name}`, 'TalentBank');
    }
  };

  const handleDeleteCandidate = (candidateId: string) => {
    if (!canDeleteCandidate) {
      alert('Ação não autorizada: Seu perfil de usuário não permite exclusão de registros.');
      return;
    }
    if (confirm('Tem certeza de que deseja remover este talento do Banco de Talentos?')) {
      setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
      logger.info(`Candidato excluído: ${candidateId}`, 'TalentBank');
    }
  };

  const handleAssignToJob = (candidateId: string, jobId: string) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId
          ? { ...c, currentJobId: jobId, status: 'Em Processo' }
          : c
      )
    );
    if (onAssignCandidateToJob) {
      onAssignCandidateToJob(candidateId, jobId);
    }
    const targetJob = jobs.find((j) => j.id === jobId);
    logger.info(
      `Candidato ${candidateId} vinculado à vaga ${targetJob?.title || jobId}`,
      'TalentBank'
    );
  };

  const handleOpenCreateModal = () => {
    setEditingCandidate(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setIsFormOpen(true);
  };

  const handleViewDetails = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Banco de Talentos Mapeados
            </h2>
            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-200">
              {totalCount} profissionais
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Mapeamento contínuo de currículos, histórico profissional, qualificações e preferências.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAiModal(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Match de Talentos com IA</span>
          </button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Cadastrar Talento
          </Button>
        </div>
      </div>

      {/* Top Stat Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total no Banco</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-slate-900">{totalCount}</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">Recomendados</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-emerald-700">{recommendedCount}</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">Alto Potencial</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-indigo-700">{highPotentialCount}</span>
            <Star className="w-4 h-4 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">Em Processo Seletivo</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-amber-700">{inProcessCount}</span>
            <UserCheck className="w-4 h-4 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <CandidateFiltersBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalResultsCount={filteredCandidates.length}
      />

      {/* Candidate Grid */}
      {filteredCandidates.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-800">
            Nenhum talento encontrado com os critérios selecionados
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tente redefinir a busca por palavras-chave ou remover filtros de habilidades e status.
          </p>
          <Button variant="outline" size="sm" onClick={handleResetFilters}>
            Resetar Filtros
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCandidates.map((cand) => {
            const linkedJob = jobs.find((j) => j.id === cand.currentJobId);
            return (
              <CandidateCard
                key={cand.id}
                candidate={cand}
                linkedJob={linkedJob}
                onViewDetails={handleViewDetails}
                onEditCandidate={handleOpenEditModal}
                onDeleteCandidate={handleDeleteCandidate}
                canEdit={canEditCandidate}
                canDelete={canDeleteCandidate}
              />
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <CandidateDetailModal
        candidate={selectedCandidate}
        jobs={jobs}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={handleOpenEditModal}
        onAssignToJob={handleAssignToJob}
        canEdit={canEditCandidate}
      />

      {/* Form Modal */}
      <CandidateFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaveCandidate={handleSaveCandidate}
        initialCandidate={editingCandidate}
      />

      <ContextualAiModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        title="Análise Inteligente de Compatibilidade e Ranking de Talentos"
        subtitle="Cruzamento automatizado entre o banco de talentos e as posições em aberto no sistema"
        onExecute={() => talentBankAiService.findMatchingCandidates({ job: jobs[0], candidates })}
        confirmText="Anotar Compatibilidade"
      />
    </div>
  );
};
