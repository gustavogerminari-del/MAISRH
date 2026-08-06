import React, { useState, useMemo, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  Calendar,
  Clock,
  Plus,
  Video,
  CheckCircle2,
  AlertCircle,
  FileText,
  Bell,
  Award,
  Users,
  Briefcase,
  ShieldAlert,
} from 'lucide-react';
import { Interview, InterviewFilterParams, InterviewStatus } from '../types/interview';
import { normalizeInterviewStatus } from '../utils/interviewUtils';
import { InterviewCard } from './InterviewCard';
import { InterviewScheduleModal } from './InterviewScheduleModal';
import { InterviewFeedbackModal } from './InterviewFeedbackModal';
import { InterviewFiltersBar } from './InterviewFiltersBar';
import { Candidate } from '../../talent-bank';
import { Job } from '../../jobs';
import { useAuth } from '../../auth';
import { Button, Card } from '../../shared';
import { logger } from '../../core';
import { JobCandidateService } from '../../services/JobCandidateService';
import { RecruitmentService } from '../../recruitment-core/services/recruitmentService';

export interface InterviewsManagementViewProps {
  initialInterviewsList?: Interview[];
  candidatesList?: Candidate[];
  jobsList?: Job[];
  onScheduleInterviewExternal?: () => void;
  onUpdateFeedbackExternal?: (
    interviewId: string,
    feedback: NonNullable<Interview['feedback']>
  ) => void;
}

export const InterviewsManagementView: React.FC<InterviewsManagementViewProps> = ({
  initialInterviewsList,
  candidatesList,
  jobsList,
  onScheduleInterviewExternal,
  onUpdateFeedbackExternal,
}) => {
  const { user, hasActionAccess } = useAuth();

  const userCompanyId = user?.empresaId || user?.companyId || user?.tenantId;
  const isMaster = user?.role === 'Super Administrador' || user?.role === 'MASTER' || user?.tipoUsuario === 'MASTER' || user?.isMaster === true;

  const [interviews, setInterviews] = useState<Interview[]>(
    initialInterviewsList || []
  );
  const [candidates] = useState<Candidate[]>(
    candidatesList || []
  );

  const rawJobs = jobsList !== undefined ? jobsList : [];
  const jobs = useMemo(() => {
    if (isMaster || !userCompanyId) return rawJobs;
    return rawJobs.filter((j: any) => {
      const cId = j.companyId || j.empresaId || j.tenantId;
      return !cId || cId === userCompanyId;
    });
  }, [rawJobs, isMaster, userCompanyId]);

  useEffect(() => {
    let isMounted = true;

    // Real-time listener for entrevistas collection
    const qEntrevistas = query(collection(db, 'entrevistas'));
    const unsubscribeFirestore = onSnapshot(
      qEntrevistas,
      (snapshot) => {
        if (!isMounted) return;
        const firestoreList: Interview[] = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data();
            const rawStatus = data.status || data.interviewStatus;
            const normStatus = normalizeInterviewStatus(rawStatus);

            return {
              id: docSnap.id,
              candidateId: data.candidateId || data.candidatoId || data.applicationId,
              candidateName: data.candidateName || data.candidatoNome || 'Candidato',
              candidateRole: data.jobTitle || data.vagaTitulo || 'Vaga Selecionada',
              jobId: data.jobId || data.vagaId || '',
              jobTitle: data.jobTitle || data.vagaTitulo || 'Vaga Selecionada',
              interviewerName: data.interviewer || data.entrevistador || 'Recrutador RH',
              date: data.date || data.data || new Date().toISOString().split('T')[0],
              time: data.time || data.horario || '10:00',
              type: (data.type === 'Presencial' || data.modalidade === 'Presencial' ? 'Presencial' : data.type === 'Telefone' || data.modalidade === 'Telefone' ? 'Entrevista por Telefone' : 'Online (Google Meet)') as any,
              meetingLink: data.meetingLink || data.localOuLink || '',
              location: data.location || '',
              status: normStatus,
              feedback: data.feedback,
              notes: data.notes || '',
              companyId: data.companyId || data.empresaId
            } as any;
          })
          .filter((item: any) => {
            if (isMaster || !userCompanyId) return true;
            return (
              item.companyId === userCompanyId ||
              item.empresaId === userCompanyId ||
              (!item.companyId && !item.empresaId)
            );
          });

        setInterviews((prev) => {
          const map = new Map<string, Interview>();
          (initialInterviewsList || []).forEach((i) => map.set(i.id, i));
          prev.forEach((i) => map.set(i.id, i));
          firestoreList.forEach((i) => map.set(i.id, i));
          return Array.from(map.values());
        });
      },
      (err) => {
        console.warn('Aviso ao escutar entrevistas no Firestore:', err);
      }
    );

    async function loadAllInterviews() {
      try {
        const apps = await JobCandidateService.listAll(userCompanyId);
        const interviewsFromApps: Interview[] = apps
          .filter(a => a.interview && a.interview.date)
          .map(a => {
            const rawStatus = a.interviewStatus || a.interview!.status || a.status;
            const normStatus = normalizeInterviewStatus(rawStatus);

            let feedbackObj = a.interview!.feedback;
            if (!feedbackObj && a.evaluations && a.evaluations.length > 0) {
              const lastEval = a.evaluations[a.evaluations.length - 1];
              feedbackObj = {
                rating: lastEval.overallScore || 5,
                strengths: lastEval.parecerRH || '',
                weaknesses: lastEval.notes || '',
                recommendation: lastEval.finalOpinion === 'Aprovado' ? 'Aprovar' : lastEval.finalOpinion === 'Reprovado' ? 'Reprovar' : 'Em Dúvida',
                evaluatedBy: lastEval.evaluatedBy,
                evaluatedAt: lastEval.evaluatedAt,
              };
            }

            return {
              id: `int-app-${a.id}`,
              candidateId: a.candidateId || a.id,
              candidateName: a.name,
              candidateRole: a.role,
              jobId: a.jobId,
              jobTitle: a.role || 'Vaga Selecionada',
              interviewerName: a.interview!.interviewer || 'Recrutador RH',
              date: a.interview!.date,
              time: a.interview!.time || '10:00',
              type: (a.interview!.type === 'Presencial' ? 'Presencial' : a.interview!.type === 'Telefone' ? 'Entrevista por Telefone' : 'Online (Google Meet)') as any,
              meetingLink: a.interview!.meetingLink,
              location: a.interview!.location,
              status: normStatus,
              feedback: feedbackObj,
              notes: a.interview!.notes
            };
          });

        const recInterviews = RecruitmentService.getInterviews(userCompanyId);
        const mappedRec: Interview[] = recInterviews.map(r => ({
          id: r.id,
          candidateId: r.candidatoId,
          candidateName: r.candidatoNome,
          candidateRole: r.candidateRole,
          jobId: r.vagaId,
          jobTitle: r.vagaTitulo,
          interviewerName: r.entrevistadorNome || r.interviewerName || 'Recrutador RH',
          date: r.date || (r.dataHora ? r.dataHora.split('T')[0] : new Date().toISOString().split('T')[0]),
          time: r.time || (r.dataHora && r.dataHora.includes('T') ? r.dataHora.split('T')[1].substring(0, 5) : '10:00'),
          type: (r.modalidade === 'Presencial' ? 'Presencial' : 'Online (Google Meet)') as any,
          meetingLink: r.salaVirtualUrl,
          status: normalizeInterviewStatus(r.status),
          feedback: r.feedback,
          notes: r.pauta
        }));

        if (isMounted) {
          setInterviews((prev) => {
            const combinedMap = new Map<string, Interview>();
            (initialInterviewsList || []).forEach(i => combinedMap.set(i.id, i));
            prev.forEach(i => combinedMap.set(i.id, i));
            interviewsFromApps.forEach(i => combinedMap.set(i.id, i));
            mappedRec.forEach(i => combinedMap.set(i.id, i));
            return Array.from(combinedMap.values());
          });
        }
      } catch (err) {
        console.warn('Erro ao carregar lista unificada de entrevistas:', err);
      }
    }

    loadAllInterviews();
    return () => {
      isMounted = false;
      unsubscribeFirestore();
    };
  }, [userCompanyId, isMaster, initialInterviewsList]);

  // Modals state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedForFeedback, setSelectedForFeedback] = useState<Interview | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<InterviewFilterParams>({
    searchTerm: '',
    status: 'Todas',
    type: 'Todas',
    jobId: 'Todas',
    dateRange: 'Todos',
  });

  const handleFilterChange = (newFilters: Partial<InterviewFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchTerm: '',
      status: 'Todas',
      type: 'Todas',
      jobId: 'Todas',
      dateRange: 'Todos',
    });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtered List
  const filteredInterviews = useMemo(() => {
    return interviews.filter((item) => {
      const term = (filters.searchTerm || '').toLowerCase().trim();
      const matchesSearch =
        !term ||
        item.candidateName.toLowerCase().includes(term) ||
        item.jobTitle.toLowerCase().includes(term) ||
        item.interviewerName.toLowerCase().includes(term);

      const normItemStatus = normalizeInterviewStatus(item.status);
      const matchesStatus =
        !filters.status ||
        filters.status === 'Todas' ||
        normItemStatus === normalizeInterviewStatus(filters.status);

      const matchesType =
        !filters.type || filters.type === 'Todas' || item.type === filters.type;

      const matchesJob =
        !filters.jobId || filters.jobId === 'Todas' || item.jobId === filters.jobId;

      let matchesDate = true;
      if (filters.dateRange === 'Hoje') {
        matchesDate = item.date === todayStr;
      } else if (filters.dateRange === 'Próximos Dias') {
        matchesDate = item.date >= todayStr;
      }

      return matchesSearch && matchesStatus && matchesType && matchesJob && matchesDate;
    });
  }, [interviews, filters, todayStr]);

  // Stats Counters
  const totalCount = interviews.length;
  const scheduledCount = interviews.filter((i) => normalizeInterviewStatus(i.status) === 'Agendada').length;
  const todayCount = interviews.filter((i) => i.date === todayStr && normalizeInterviewStatus(i.status) === 'Agendada').length;
  const inAnalysisCount = interviews.filter((i) => {
    const norm = normalizeInterviewStatus(i.status);
    return norm === 'Em Análise' || (norm === 'Realizada' && !i.feedback);
  }).length;
  const approvedCount = interviews.filter((i) => normalizeInterviewStatus(i.status) === 'Aprovada').length;

  const handleAddSchedule = (newInterviewData: Omit<Interview, 'id' | 'status'>) => {
    const newInterview: Interview = {
      ...newInterviewData,
      id: `int-${Date.now()}`,
      status: 'Agendada',
    };
    setInterviews((prev) => [newInterview, ...prev]);
    logger.info(`Entrevista agendada para ${newInterview.candidateName}`, 'Interviews');
  };

  const handleSubmitFeedback = async (
    interviewId: string,
    feedback: NonNullable<Interview['feedback']>,
    newStatus: InterviewStatus
  ) => {
    const normNewStatus = normalizeInterviewStatus(
      newStatus || (feedback.recommendation === 'Aprovar' ? 'Aprovada' : feedback.recommendation === 'Reprovar' ? 'Reprovada' : 'Em Análise')
    );

    // Update state immediately for instant real-time UI refresh
    setInterviews((prev) =>
      prev.map((i) =>
        i.id === interviewId
          ? {
              ...i,
              status: normNewStatus,
              feedback: {
                ...feedback,
                recommendation: feedback.recommendation || (normNewStatus === 'Aprovada' ? 'Aprovar' : 'Reprovar')
              }
            }
          : i
      )
    );

    try {
      await JobCandidateService.saveInterviewFeedback(interviewId, feedback, normNewStatus);
    } catch (err) {
      console.error('Erro ao salvar feedback da entrevista no Firestore:', err);
    }

    if (onUpdateFeedbackExternal) {
      onUpdateFeedbackExternal(interviewId, feedback, normNewStatus);
    }
    logger.info(`Feedback salvo para entrevista ${interviewId} (${normNewStatus})`, 'Interviews');
  };

  const handleDeleteInterview = (interviewId: string) => {
    if (confirm('Deseja realmente cancelar este agendamento de entrevista?')) {
      setInterviews((prev) =>
        prev.map((i) => (i.id === interviewId ? { ...i, status: 'Cancelada' } : i))
      );
      logger.info(`Entrevista ${interviewId} cancelada`, 'Interviews');
    }
  };

  const handleOpenFeedback = (interview: Interview) => {
    setSelectedForFeedback(interview);
    setIsFeedbackModalOpen(true);
  };

  const handleOpenSchedule = () => {
    if (onScheduleInterviewExternal) {
      onScheduleInterviewExternal();
    } else {
      setIsScheduleModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Gestão de Entrevistas & Processos Seletivos
            </h2>
            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-200">
              {totalCount} agendamentos
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Agendamentos, salas virtuais, atribuição de avaliadores e parecer de candidatos por etapa.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenSchedule}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shrink-0"
        >
          Agendar Entrevista
        </Button>
      </div>

      {/* Reminder Notification Banner for Today's Interviews */}
      {todayCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-bold">
            <Bell className="w-5 h-5 text-amber-600 shrink-0 animate-bounce" />
            <span>
              Lembrete: Você possui <strong>{todayCount} entrevista(s) agendada(s) para hoje ({todayStr})</strong>.
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterChange({ dateRange: 'Hoje', status: 'Agendada' })}
            className="border-amber-300 text-amber-900 hover:bg-amber-100 shrink-0"
          >
            Ver Agendamentos de Hoje
          </Button>
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Agendado</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-slate-900">{scheduledCount}</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">Agendadas para Hoje</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-amber-700">{todayCount}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">Em Análise / Pendente</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-indigo-700">{inAnalysisCount}</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">Aprovados nas Etapas</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-emerald-700">{approvedCount}</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <InterviewFiltersBar
        filters={filters}
        jobs={jobs}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalResultsCount={filteredInterviews.length}
      />

      {/* List or Grid */}
      {filteredInterviews.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-800">
            Nenhuma entrevista encontrada
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Não existem agendamentos para o filtro selecionado. Tente alterar o status ou buscar por outro candidato.
          </p>
          <Button variant="outline" size="sm" onClick={handleResetFilters}>
            Limpar Filtros
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInterviews.map((item) => (
            <InterviewCard
              key={item.id}
              interview={item}
              onOpenFeedbackModal={handleOpenFeedback}
              onDeleteInterview={handleDeleteInterview}
              canManageInterview={
                user?.role === 'Administrador' ||
                user?.role === 'Gestor de Seleção' ||
                user?.role === 'Recrutador Sênior' ||
                hasActionAccess('schedule_interview') ||
                user?.name?.toLowerCase() === item.interviewerName.toLowerCase()
              }
            />
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      <InterviewScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onScheduleInterview={handleAddSchedule}
        candidates={candidates}
        jobs={jobs}
      />

      {/* Feedback Modal */}
      <InterviewFeedbackModal
        interview={selectedForFeedback}
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmitFeedback={handleSubmitFeedback}
      />
    </div>
  );
};
