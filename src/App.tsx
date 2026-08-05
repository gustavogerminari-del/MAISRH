import React, { useState } from 'react';
import { AuthProvider, useAuth, LoginForm, ProfileSwitchSelector, ProtectedRoute } from './auth';
import { Navbar } from './components/Navbar';
import { Sidebar, MainTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { JobsView } from './components/JobsView';
import { TalentBankView } from './components/TalentBankView';
import { InterviewsView } from './components/InterviewsView';
import { ReportsView } from './components/ReportsView';
import { CompanyView } from './components/CompanyView';
import { SettingsView } from './components/SettingsView';
import { SupportHelpView } from './support/SupportHelpView';
import { PublicJobsView } from './public-jobs';
import { HeadhunterView } from './headhunter/HeadhunterView';
import { BenefitsLeavesView } from './benefits-leaves';
import { DocumentsSignatureView } from './documents-signature';
import { PayrollView } from './payroll';
import { PontoDigitalView } from './ponto-digital';
import { AuditLogsView } from './audit-logs';
import { SubscriptionsView } from './subscriptions';
import { MasterAdminView } from './master-admin';
import { MaisRhIaView } from './ai/components/MaisRhIaView';
import { DepartamentoPessoalView, DPSubTab } from './departamento-pessoal/DepartamentoPessoalView';
import { PortalColaboradorView } from './departamento-pessoal/components/PortalColaboradorView';
import { UnifiedPipelineView, UnifiedContratacoesView, UnifiedAgendaView } from './recruitment-core';
import { JobCandidatesManagementView } from './jobs/components/JobCandidatesManagementView';

import { NewJobModal } from './components/NewJobModal';
import { NewCandidateModal } from './components/NewCandidateModal';
import { ScheduleInterviewModal } from './components/ScheduleInterviewModal';
import { FloatingAiAssistant } from './components/FloatingAiAssistant';

import { 
  INITIAL_JOBS, 
  INITIAL_CANDIDATES, 
  INITIAL_INTERVIEWS, 
  INITIAL_DEPARTMENTS, 
  INITIAL_RECRUITERS, 
  fontStages 
} from './data/initialData';

import { Job, Candidate, Interview, StageId } from './types/rh';
import { JobService } from './services/JobService';
import { CandidateService } from './services/CandidateService';
import { JobCandidateService } from './services/JobCandidateService';

function MainAppContent() {
  const { user, isAuthenticated } = useAuth();
  const [showLoginScreen, setShowLoginScreen] = useState(false);
  const [activeTab, setActiveTab] = useState<MainTab>(() => {
    return user?.role === 'Super Administrador' ? 'acesso-master' : 'dashboard';
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<string | null>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('selectedAdmissionId') || localStorage.getItem('selectedAdmissionId') || null;
    } catch {
      return null;
    }
  });
  const [selectedFinancialId, setSelectedFinancialId] = useState<string | null>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('selectedFinancialId') || urlParams.get('selectedBillingId') || localStorage.getItem('selectedFinancialId') || localStorage.getItem('selectedBillingId') || null;
    } catch {
      return null;
    }
  });

  const handleNavigateTab = (tab: string, entityId?: string) => {
    if (entityId) {
      if (tab === 'admissoes' || tab === 'colaboradores' || tab === 'equipe-interna' || tab === 'departamento-pessoal') {
        setSelectedAdmissionId(entityId);
        localStorage.setItem('selectedAdmissionId', entityId);
      } else if (tab === 'headhunter-financeiro' || tab === 'financeiro' || tab.includes('financeiro')) {
        setSelectedFinancialId(entityId);
        localStorage.setItem('selectedFinancialId', entityId);
        localStorage.setItem('selectedBillingId', entityId);
      }
    }
    if (tab === 'admissoes' || tab === 'colaboradores' || tab === 'equipe-interna' || tab === 'departamento-pessoal') {
      setActiveTab('admissoes' as MainTab);
    } else {
      setActiveTab(tab as MainTab);
    }
  };

  // Auto-switch to Master Panel when Super Admin logs in or switches profile
  React.useEffect(() => {
    if (user?.role === 'Super Administrador' && activeTab !== 'acesso-master') {
      setActiveTab('acesso-master');
    }
  }, [user?.role]);

  // Main state
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [interviews, setInterviews] = useState<Interview[]>(INITIAL_INTERVIEWS);
  const [departments] = useState(INITIAL_DEPARTMENTS);
  const [recruiters] = useState(INITIAL_RECRUITERS);
  const [companyApplicationsCount, setCompanyApplicationsCount] = useState<number>(0);

  // Load company jobs, candidates and candidatures count from Firestore
  React.useEffect(() => {
    if (!isAuthenticated) return;

    const isMaster = user?.role === 'Super Administrador' || user?.role === 'MASTER' || user?.tipoUsuario === 'MASTER' || user?.isMaster === true;
    const userCompanyId = isMaster ? undefined : (user?.empresaId || user?.companyId || user?.tenantId);

    JobService.list(userCompanyId)
      .then(loadedJobs => {
        if (loadedJobs && Array.isArray(loadedJobs)) {
          if (!isMaster && userCompanyId) {
            const filtered = loadedJobs.filter(j => {
              const cId = (j as any).companyId || (j as any).empresaId || (j as any).tenantId;
              return cId === userCompanyId;
            });
            setJobs(filtered);
          } else {
            setJobs(loadedJobs);
          }
        }
      })
      .catch(err => {
        console.warn('Erro ao carregar vagas do Firestore:', err);
      });

    CandidateService.list(userCompanyId)
      .then(loadedCands => {
        if (loadedCands && Array.isArray(loadedCands) && loadedCands.length > 0) {
          setCandidates(loadedCands);
        }
      })
      .catch(err => {
        console.warn('Erro ao carregar candidatos do Firestore:', err);
      });

    const unsubscribeApps = JobCandidateService.subscribeByCompany(
      userCompanyId || 'emp-001',
      (apps) => {
        setCompanyApplicationsCount(apps.length);
      }
    );

    return () => {
      unsubscribeApps();
    };
  }, [isAuthenticated, user?.empresaId, user?.companyId, user?.tenantId, user?.role, user?.tipoUsuario, user?.isMaster]);

  // Modals state
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handlers
  const handleAddJob = async (newJobData: Omit<Job, 'id' | 'applicantsCount' | 'createdAt'>) => {
    const empresaId = user?.empresaId || user?.companyId || user?.tenantId || user?.id || 'emp-001';
    const nomeEmpresa = user?.companyName || user?.tenantName || user?.name || 'Empresa';
    const parts = (newJobData.location || 'São Paulo - SP').split('-');
    const cidade = parts[0]?.trim() || 'São Paulo';
    const estado = parts[1]?.trim() || 'SP';
    const nowIsoDate = new Date().toISOString().split('T')[0];

    const newJob: Job = {
      ...newJobData,
      id: `vaga-${Date.now()}`,
      companyId: empresaId,
      empresaId,
      nomeEmpresa,
      titulo: newJobData.title,
      title: newJobData.title,
      descricao: newJobData.description,
      description: newJobData.description,
      requisitos: newJobData.requirements || [],
      requirements: newJobData.requirements || [],
      cidade,
      estado,
      location: newJobData.location || `${cidade} - ${estado}`,
      salario: newJobData.salaryRange || 'A combinar',
      salaryRange: newJobData.salaryRange || 'A combinar',
      tipoContrato: newJobData.type || 'CLT',
      type: newJobData.type || 'CLT',
      beneficios: ['Vale Refeição', 'Plano de Saúde', 'Seguro de Vida'],
      benefits: ['Vale Refeição', 'Plano de Saúde', 'Seguro de Vida'],
      quantidadeVagas: newJobData.openings || 1,
      openings: newJobData.openings || 1,
      dataCriacao: nowIsoDate,
      createdAt: nowIsoDate,
      status: 'Aberta',
      publicada: true,
      applicantsCount: 0,
    };

    try {
      await JobService.create(newJob);
      const isMaster = user?.role === 'Super Administrador' || user?.role === 'MASTER' || user?.tipoUsuario === 'MASTER' || user?.isMaster === true;
      const userCompanyId = isMaster ? undefined : (user?.empresaId || user?.companyId || user?.tenantId);
      const reloaded = await JobService.list(userCompanyId);
      if (reloaded && reloaded.length > 0) {
        setJobs(reloaded);
        return;
      }
    } catch (err) {
      console.warn('Erro ao salvar nova vaga no Firestore:', err);
    }

    setJobs(prev => [newJob, ...prev]);
  };

  const handleAddCandidate = async (newCandData: Omit<Candidate, 'id' | 'appliedDate'>) => {
    const userCompanyId = user?.empresaId || user?.companyId || user?.tenantId || 'emp-001';
    const nowIsoDate = new Date().toISOString().split('T')[0];

    let savedCand;
    try {
      savedCand = await CandidateService.create({
        ...newCandData,
        companyId: userCompanyId,
        appliedDate: nowIsoDate
      });
    } catch (err) {
      console.warn('Erro ao salvar candidato no Firestore:', err);
    }

    const candidateId = savedCand?.id || `cand-${Date.now()}`;
    const newCandidate: Candidate = savedCand || {
      ...newCandData,
      id: candidateId,
      appliedDate: nowIsoDate,
    };

    setCandidates(prev => [newCandidate, ...prev]);

    // If candidate assigned to a job, create application document too
    if (newCandData.currentJobId) {
      try {
        await JobCandidateService.create({
          jobId: newCandData.currentJobId,
          companyId: userCompanyId,
          candidateId: candidateId,
          name: newCandData.name,
          email: newCandData.email,
          phone: newCandData.phone,
          role: newCandData.role || 'Candidato',
          city: newCandData.location?.split('-')[0]?.trim() || 'São Paulo',
          state: newCandData.location?.split('-')[1]?.trim() || 'SP',
          status: 'Novos',
          resumeUrl: newCandData.resumeUrl || '',
          experienceYears: newCandData.experienceYears || 1,
          salaryExpectation: newCandData.salaryExpectation || 'A combinar',
          notes: newCandData.notes ? [newCandData.notes] : []
        });
      } catch (err) {
        console.warn('Erro ao criar candidatura no Firestore:', err);
      }

      setJobs(prev => prev.map(j => {
        if (j.id === newCandData.currentJobId) {
          return { ...j, applicantsCount: (j.applicantsCount || 0) + 1 };
        }
        return j;
      }));
    }
  };

  // If user is not logged in, show Public Job Site as initial page, or LoginForm when requested
  if (!isAuthenticated) {
    if (showLoginScreen) {
      return <LoginForm onBackToJobs={() => setShowLoginScreen(false)} />;
    }
    return (
      <PublicJobsView
        jobs={jobs}
        onApplyCandidate={handleAddCandidate}
        onGoToLogin={() => setShowLoginScreen(true)}
      />
    );
  }

  const handleScheduleInterview = (newInterviewData: Omit<Interview, 'id' | 'status'>) => {
    const newInterview: Interview = {
      ...newInterviewData,
      id: `int-${Date.now()}`,
      status: 'Agendada',
    };
    setInterviews(prev => [newInterview, ...prev]);
  };

  const handleMoveCandidateStage = (candidateId: string, newStageId: StageId) => {
    setCandidates(prev => prev.map(c => {
      if (c.id === candidateId) {
        return {
          ...c,
          currentStageId: newStageId,
          status: newStageId === 'contratado' ? 'Contratado' : 'Em Processo'
        };
      }
      return c;
    }));
  };

  const handleAssignCandidateToJob = (candidateId: string, jobId: string) => {
    setCandidates(prev => prev.map(c => {
      if (c.id === candidateId) {
        return {
          ...c,
          currentJobId: jobId,
          currentStageId: 'triagem',
          status: 'Em Processo'
        };
      }
      return c;
    }));

    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return { ...j, applicantsCount: j.applicantsCount + 1 };
      }
      return j;
    }));
  };

  const handleUpdateInterviewFeedback = (interviewId: string, feedback: Interview['feedback']) => {
    setInterviews(prev => prev.map(i => {
      if (i.id === interviewId) {
        return {
          ...i,
          status: 'Concluída',
          feedback,
        };
      }
      return i;
    }));
  };

  const departmentNames = departments.map(d => d.name);

  const isColaborador = user?.role === 'Colaborador' || user?.tipoUsuario === 'COLABORADOR';

  if (isColaborador) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] text-[#0F172A] flex flex-col font-sans">
        <ProfileSwitchSelector />
        <PortalColaboradorView />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#0F172A] flex flex-col font-sans antialiased">
      {/* Top Profile Switch Bar */}
      <ProfileSwitchSelector />

      {/* Navbar Header */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        openNewCandidateModal={() => setIsCandidateModalOpen(true)}
        openScheduleInterviewModal={() => setIsInterviewModalOpen(true)}
        openNewJobModal={() => setIsJobModalOpen(true)}
        onOpenMasterPanel={() => setActiveTab('acesso-master')}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Operational Sidebar (hidden when in Master Admin mode) */}
        {activeTab !== 'acesso-master' && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openNewJobModal={() => setIsJobModalOpen(true)}
            openNewCandidateModal={() => setIsCandidateModalOpen(true)}
            openScheduleInterviewModal={() => setIsInterviewModalOpen(true)}
            jobsCount={jobs.length}
            candidatesCount={companyApplicationsCount || candidates.length}
            interviewsCount={interviews.length}
            isOpenMobile={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* View Router Protected by Role */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F7F9FC]">

          <ProtectedRoute screenKey={activeTab as any}>
            {activeTab === 'dashboard' && (
              <DashboardView
                jobs={jobs}
                candidates={candidates}
                interviews={interviews}
                stages={fontStages}
                onNavigateToJobs={() => setActiveTab('vagas')}
                onNavigateToCandidates={() => setActiveTab('candidatos')}
                onNavigateToInterviews={() => setActiveTab('entrevistas')}
                openNewJobModal={() => setIsJobModalOpen(true)}
                openNewCandidateModal={() => setIsCandidateModalOpen(true)}
              />
            )}

            {activeTab === 'mais-rh-ia' && <MaisRhIaView />}

            {activeTab === 'vagas' && (
              <JobsView
                key={activeTab}
                jobs={jobs}
                candidates={candidates}
                stages={fontStages}
                openNewJobModal={() => setIsJobModalOpen(true)}
                onMoveCandidateStage={handleMoveCandidateStage}
                searchTerm={searchTerm}
                onUpdateJobs={setJobs}
              />
            )}

            {activeTab === 'banco-talentos' && (
              <TalentBankView
                candidates={candidates}
                jobs={jobs}
                openNewCandidateModal={() => setIsCandidateModalOpen(true)}
                onAssignCandidateToJob={handleAssignCandidateToJob}
                searchTerm={searchTerm}
              />
            )}

            {activeTab === 'candidatos' && (
              <JobCandidatesManagementView openNewJobModal={() => setIsJobModalOpen(true)} />
            )}

            {activeTab === 'entrevistas' && (
              <InterviewsView
                interviews={interviews}
                openScheduleInterviewModal={() => setIsInterviewModalOpen(true)}
                onUpdateInterviewFeedback={handleUpdateInterviewFeedback}
              />
            )}

            {activeTab === 'contratacoes' && (
              <UnifiedContratacoesView
                origemProcesso="recrutamento_interno"
                companyId={user?.empresaId || user?.companyId || 'emp-001'}
                onNavigateToTab={handleNavigateTab}
              />
            )}

            {activeTab === 'agenda' && (
              <UnifiedAgendaView
                origemProcesso="interno"
                events={[]}
              />
            )}

            {activeTab === 'relatorios' && <ReportsView />}

            {activeTab === 'empresa' && (
              <CompanyView departments={departments} recruiters={recruiters} />
            )}

            {activeTab === 'equipe-interna' && (
              <DepartamentoPessoalView initialSubTab="colaboradores" selectedAdmissionId={selectedAdmissionId} />
            )}

            {activeTab === 'site-vagas' && (
              <PublicJobsView
                jobs={jobs}
                onApplyCandidate={handleAddCandidate}
                isInternalView={true}
              />
            )}

            {(activeTab === 'headhunter' || activeTab === 'consultor-rh' || activeTab.startsWith('headhunter-')) && (
              <HeadhunterView 
                initialSubTab={
                  activeTab === 'headhunter' || activeTab === 'consultor-rh' 
                    ? 'dashboard' 
                    : (activeTab.replace('headhunter-', '') as any)
                } 
                selectedFinancialId={selectedFinancialId}
              />
            )}

            {/* Departamento Pessoal Master Submenu Routing */}
            {['departamento-pessoal', 'colaboradores', 'admissoes', 'ponto-digital', 'jornada', 'beneficios', 'ferias', 'rescisao', 'documentos', 'afastamentos', 'sst', 'relatorios-dp', 'configuracoes-trabalhistas'].includes(activeTab) && (
              <DepartamentoPessoalView 
                initialSubTab={activeTab === 'jornada' ? 'ponto-digital' : (activeTab as DPSubTab)} 
                selectedAdmissionId={selectedAdmissionId}
              />
            )}

            {activeTab === 'folha-pagamento' && (
              <DepartamentoPessoalView initialSubTab="folha-pagamento" />
            )}

            {activeTab === 'documentos' && (
              <DepartamentoPessoalView initialSubTab="documentos" />
            )}

            {activeTab === 'ferias-beneficios' && (
              <DepartamentoPessoalView initialSubTab="beneficios" />
            )}

            {activeTab === 'auditoria' && <AuditLogsView />}

            {activeTab === 'planos-saas' && <SubscriptionsView />}

            {(activeTab === 'acesso-master' || activeTab.startsWith('master-')) && <MasterAdminView />}

            {activeTab === 'configuracoes' && <SettingsView stages={fontStages} />}

            {activeTab === 'suporte-ajuda' && <SupportHelpView />}
          </ProtectedRoute>
        </main>
      </div>

      {/* Creation & Action Modals */}
      <NewJobModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        onSubmit={handleAddJob}
        departments={departmentNames}
      />

      <NewCandidateModal
        isOpen={isCandidateModalOpen}
        onClose={() => setIsCandidateModalOpen(false)}
        onSubmit={handleAddCandidate}
        jobs={jobs}
      />

      <ScheduleInterviewModal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        onSubmit={handleScheduleInterview}
        candidates={candidates}
        jobs={jobs}
      />

      {/* Assistente IA Flutuante Global */}
      <FloatingAiAssistant
        activeTab={activeTab}
        onNavigateToTab={(tab) => setActiveTab(tab as MainTab)}
      />
    </div>
  );
}

import { 
  CompanyProvider, 
  PermissionProvider, 
  ModuleProvider, 
  SubscriptionProvider, 
  NotificationProvider, 
  SettingsProvider 
} from './contexts';
import { VisualBuilderProvider } from './visual-builder/context/VisualBuilderRuntimeContext';

export default function App() {
  return (
    <AuthProvider>
      <CompanyProvider>
        <PermissionProvider>
          <ModuleProvider>
            <SubscriptionProvider>
              <NotificationProvider>
                <SettingsProvider>
                  <VisualBuilderProvider>
                    <MainAppContent />
                  </VisualBuilderProvider>
                </SettingsProvider>
              </NotificationProvider>
            </SubscriptionProvider>
          </ModuleProvider>
        </PermissionProvider>
      </CompanyProvider>
    </AuthProvider>
  );
}
