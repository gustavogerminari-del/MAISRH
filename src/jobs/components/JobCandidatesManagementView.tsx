import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Users, 
  Sparkles, 
  UserCheck, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Briefcase, 
  MapPin, 
  Building2, 
  Clock, 
  MoreVertical, 
  FileText, 
  Phone, 
  Mail, 
  MessageCircle, 
  Download, 
  RefreshCw,
  Plus,
  Star,
  History,
  Award,
  Zap,
  ChevronDown,
  ChevronUp,
  Layers
} from 'lucide-react';
import { Job } from '../types/job';
import { JobService } from '../../services/JobService';
import { 
  JobCandidateApplication, 
  JobCandidateService, 
  ApplicationStatus 
} from '../../services/JobCandidateService';
import { CandidateDrawerPanel } from './CandidateDrawerPanel';
import { JobTalentBankAiTab } from './JobTalentBankAiTab';
import { Button, Card } from '../../shared';
import { useAuth } from '../../auth';
import { formatFirestoreDate } from '../../lib/firestoreUtils';

export type JobViewTab = 'inscritos' | 'banco_ia' | 'entrevistas' | 'avaliacoes' | 'historico';

interface JobCandidatesManagementViewProps {
  job?: Job | null;
  onBack?: () => void;
}

export const JobCandidatesManagementView: React.FC<JobCandidatesManagementViewProps> = ({
  job,
  onBack,
}) => {
  const { user } = useAuth();
  const companyId = user?.empresaId || user?.companyId || user?.tenantId;

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<JobViewTab>('inscritos');

  const [candidates, setCandidates] = useState<JobCandidateApplication[]>([]);
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected candidate for Drawer
  const [selectedCandidate, setSelectedCandidate] = useState<JobCandidateApplication | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('Todas');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [cityFilter, setCityFilter] = useState<string>('Todas');
  const [educationFilter, setEducationFilter] = useState<string>('Todas');
  const [experienceFilter, setExperienceFilter] = useState<string>('Todas');
  const [salaryFilter, setSalaryFilter] = useState<string>('Todos');
  const [pcdFilter, setPcdFilter] = useState<string>('Todos');
  const [iaFilter, setIaFilter] = useState<string>('Todas');

  // Accordion collapsed state per group
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (jobId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  // Load company jobs
  useEffect(() => {
    if (!companyId) return;
    JobService.listByCompany(companyId)
      .then(list => setCompanyJobs(list))
      .catch(err => console.warn('Erro ao carregar vagas da empresa:', err));
  }, [companyId]);

  const handleRefresh = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      if (job?.id) {
        const list = await JobCandidateService.listByJob(job.id, companyId);
        setCandidates(list);
      } else {
        const list = await JobCandidateService.listAll(companyId);
        setCandidates(list);
      }
      const jobsList = await JobService.listByCompany(companyId);
      setCompanyJobs(jobsList);
    } catch (err) {
      console.error('Erro ao recarregar candidatos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!companyId) {
      setCandidates([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let unsubscribe: () => void;

    if (job?.id) {
      unsubscribe = JobCandidateService.subscribeByJob(
        job.id,
        companyId,
        (list) => {
          setCandidates(list);
          setLoading(false);
        },
        (err) => {
          console.error('Erro na assinatura de candidatos da vaga:', err);
          setCandidates([]);
          setLoading(false);
        }
      );
    } else {
      unsubscribe = JobCandidateService.subscribeByCompany(
        companyId,
        (list) => {
          setCandidates(list);
          setLoading(false);
        },
        (err) => {
          console.error('Erro na assinatura de candidaturas:', err);
          setCandidates([]);
          setLoading(false);
        }
      );
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [job?.id, companyId]);

  // Sync selectedCandidate when candidates update
  useEffect(() => {
    if (selectedCandidate) {
      const updated = candidates.find(c => c.id === selectedCandidate.id);
      if (updated) setSelectedCandidate(updated);
    }
  }, [candidates]);

  // Metric Indicators Counts
  const counts = useMemo(() => {
    const targetCandidates = selectedJobFilter !== 'Todas' 
      ? candidates.filter(c => c.jobId === selectedJobFilter)
      : candidates;

    return {
      total: targetCandidates.length,
      novos: targetCandidates.filter(c => c.status === 'Novos').length,
      triagemIa: targetCandidates.filter(c => c.status === 'Triagem IA').length,
      emAnaliseRh: targetCandidates.filter(c => c.status === 'Em Análise RH').length,
      entrevistas: targetCandidates.filter(c => c.status === 'Entrevista Agendada' || c.status === 'Entrevista Realizada').length,
      contratados: targetCandidates.filter(c => c.status === 'Contratado' || c.status === 'Aprovado').length,
      encerrados: targetCandidates.filter(c => c.status === 'Encerrado' || (c.status as string) === 'Vaga Preenchida').length,
      reprovados: targetCandidates.filter(c => c.status === 'Reprovado').length,
    };
  }, [candidates, selectedJobFilter]);

  // Unique Cities list for filter dropdown
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    candidates.forEach(c => {
      if (c.city) set.add(c.city);
    });
    return Array.from(set);
  }, [candidates]);

  // Filtered Candidate List
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      // Job filter
      if (selectedJobFilter !== 'Todas' && c.jobId !== selectedJobFilter) {
        return false;
      }

      // Search term
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term || 
        c.name.toLowerCase().includes(term) ||
        (c.cpf && c.cpf.includes(term)) ||
        c.city.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.education.toLowerCase().includes(term) ||
        (c.course && c.course.toLowerCase().includes(term)) ||
        (c.resumeKeywords && c.resumeKeywords.some(k => k.toLowerCase().includes(term)));

      // Status filter
      const matchesStatus = statusFilter === 'Todos' || c.status === statusFilter || 
        (statusFilter === 'Entrevistas' && (c.status === 'Entrevista Agendada' || c.status === 'Entrevista Realizada')) ||
        (statusFilter === 'Contratados' && (c.status === 'Contratado' || c.status === 'Aprovado')) ||
        (statusFilter === 'Encerrados' && (c.status === 'Encerrado' || (c.status as string) === 'Vaga Preenchida'));

      // City filter
      const matchesCity = cityFilter === 'Todas' || c.city === cityFilter;

      // Education filter
      const matchesEducation = educationFilter === 'Todas' || c.education === educationFilter;

      // Experience filter
      const matchesExp = experienceFilter === 'Todas' || 
        (experienceFilter === '1+' && c.experienceYears >= 1) ||
        (experienceFilter === '3+' && c.experienceYears >= 3) ||
        (experienceFilter === '5+' && c.experienceYears >= 5);

      // PCD filter
      const matchesPcd = pcdFilter === 'Todos' || 
        (pcdFilter === 'Sim' && c.isPCD) || 
        (pcdFilter === 'Não' && !c.isPCD);

      // IA Compatibility filter
      const matchesIa = iaFilter === 'Todas' ||
        (iaFilter === 'Muito' && c.compatibilityScore >= 85) ||
        (iaFilter === 'Compativel' && c.compatibilityScore >= 65 && c.compatibilityScore < 85) ||
        (iaFilter === 'Baixa' && c.compatibilityScore < 65);

      return matchesSearch && matchesStatus && matchesCity && matchesEducation && matchesExp && matchesPcd && matchesIa;
    });
  }, [candidates, selectedJobFilter, searchTerm, statusFilter, cityFilter, educationFilter, experienceFilter, pcdFilter, iaFilter]);

  // Group candidates by Job
  const groupedJobs = useMemo(() => {
    const map = new Map<string, JobCandidateApplication[]>();

    filteredCandidates.forEach(cand => {
      const jId = cand.jobId || 'sem_vaga';
      if (!map.has(jId)) {
        map.set(jId, []);
      }
      map.get(jId)!.push(cand);
    });

    const groups: {
      jobId: string;
      jobData: Job | null;
      jobTitle: string;
      jobCode: string;
      jobStatus: string;
      location: string;
      contractType: string;
      candidates: JobCandidateApplication[];
      counts: {
        total: number;
        novos: number;
        emAnalise: number;
        entrevistas: number;
        contratados: number;
        encerradosReprovados: number;
      };
    }[] = [];

    map.forEach((cands, jId) => {
      const matchedJob = companyJobs.find(j => j.id === jId) || null;
      const firstCand = cands[0];

      const title = matchedJob?.title || (matchedJob as any)?.titulo || firstCand?.role || 'Vaga Sem Título';
      const code = jId;
      const status = matchedJob?.status || (matchedJob as any)?.statusVaga || 'Aberta';
      const loc = matchedJob?.location || (firstCand ? `${firstCand.city}, ${firstCand.state}` : 'Não informado');
      const cType = matchedJob?.type || (matchedJob as any)?.tipoContrato || 'CLT';

      const groupCounts = {
        total: cands.length,
        novos: cands.filter(c => c.status === 'Novos').length,
        emAnalise: cands.filter(c => c.status === 'Em Análise RH' || c.status === 'Triagem IA').length,
        entrevistas: cands.filter(c => c.status === 'Entrevista Agendada' || c.status === 'Entrevista Realizada').length,
        contratados: cands.filter(c => c.status === 'Contratado' || c.status === 'Aprovado').length,
        encerradosReprovados: cands.filter(c => c.status === 'Encerrado' || (c.status as string) === 'Vaga Preenchida' || c.status === 'Reprovado').length,
      };

      groups.push({
        jobId: jId,
        jobData: matchedJob,
        jobTitle: title,
        jobCode: code,
        jobStatus: status,
        location: loc,
        contractType: cType,
        candidates: cands,
        counts: groupCounts
      });
    });

    return groups;
  }, [filteredCandidates, companyJobs]);

  const handleOpenCandidate = (candidate: JobCandidateApplication) => {
    setSelectedCandidate(candidate);
    setIsDrawerOpen(true);
  };

  const getStatusBadgeColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'Novos': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Triagem IA': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Em Análise RH': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Entrevista Agendada': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Entrevista Realizada': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Aprovado': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Contratado': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Reprovado': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200 bar-emerald';
    if (score >= 65) return 'text-indigo-600 bg-indigo-50 border-indigo-200 bar-indigo';
    return 'text-amber-600 bg-amber-50 border-amber-200 bar-amber';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. TOPO DA TELA (Header da Vaga ou Central de Candidatos) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between gap-4">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-3.5 py-2 rounded-xl transition-colors border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para Lista de Vagas
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-extrabold text-slate-700">Central de Candidatos — Empresa</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className={`text-xs font-black px-3 py-1 rounded-full border ${
              job?.status === 'Aberta'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                : (job?.status === 'Arquivada' || (job as any)?.archived || (job as any)?.isArchived)
                ? 'bg-rose-100 text-rose-800 border-rose-200'
                : 'bg-indigo-100 text-indigo-800 border-indigo-200'
            }`}>
              {job ? ((job.status === 'Arquivada' || (job as any).archived || (job as any).isArchived) ? 'Arquivada (Consulta)' : job.status) : 'Todas as Vagas'}
            </span>
            <button
              type="button"
              onClick={handleRefresh}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Atualizar dados do Firestore"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Job Details Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-slate-100 pt-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {job ? job.title : 'Central de Candidatos e Candidaturas'}
              </h1>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                {job ? `#${job.id}` : 'Geral'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-medium text-slate-500 flex-wrap">
              <span className="flex items-center gap-1 font-bold text-slate-700">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                {job ? job.department : 'Todas as Áreas'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {job ? job.location : 'Todos os Locais'}
              </span>
              <span>•</span>
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-indigo-100">
                {job ? job.type : 'Candidaturas Ativas'}
              </span>
              {job && (
                <>
                  <span>•</span>
                  <span>Abertura: {formatFirestoreDate(job.createdAt || (job as any).dataCriacao)}</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 shrink-0 flex items-center gap-4">
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Candidatos</span>
              <span className="text-2xl font-black text-slate-900">{candidates.length}</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* 5 NAVIGATION TABS */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-2xs flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('inscritos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
            activeTab === 'inscritos'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          Candidatos Inscritos
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            activeTab === 'inscritos' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
          }`}>
            {candidates.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('banco_ia')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
            activeTab === 'banco_ia'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
          Banco de Talentos IA
          <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
            Match IA
          </span>
        </button>

        <button
          onClick={() => setActiveTab('entrevistas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
            activeTab === 'entrevistas'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Entrevistas
        </button>

        <button
          onClick={() => setActiveTab('avaliacoes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
            activeTab === 'avaliacoes'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          Avaliações
        </button>

        <button
          onClick={() => setActiveTab('historico')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
            activeTab === 'historico'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          Histórico
        </button>
      </div>

      {/* TAB CONTENT 1: CANDIDATOS INSCRITOS */}
      {activeTab === 'inscritos' && (
        <div className="space-y-6">
          {/* INDICADORES RÁPIDOS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <button
              onClick={() => setStatusFilter('Todos')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                statusFilter === 'Todos'
                  ? 'border-indigo-600 bg-indigo-50/80 shadow-2xs ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
                <Users className="w-4 h-4 text-slate-400" />
              </div>
              <span className="text-xl font-black text-slate-900">{counts.total}</span>
            </button>

            <button
              onClick={() => setStatusFilter('Novos')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                statusFilter === 'Novos'
                  ? 'border-blue-600 bg-blue-50/80 shadow-2xs ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-blue-600">Novos</span>
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <span className="text-xl font-black text-slate-900">{counts.novos}</span>
            </button>

            <button
              onClick={() => setStatusFilter('Triagem IA')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                statusFilter === 'Triagem IA'
                  ? 'border-purple-600 bg-purple-50/80 shadow-2xs ring-2 ring-purple-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-purple-600">Triagem IA</span>
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-xl font-black text-slate-900">{counts.triagemIa}</span>
            </button>

            <button
              onClick={() => setStatusFilter('Em Análise RH')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                statusFilter === 'Em Análise RH'
                  ? 'border-amber-600 bg-amber-50/80 shadow-2xs ring-2 ring-amber-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-amber-600">Análise</span>
                <UserCheck className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-xl font-black text-slate-900">{counts.emAnaliseRh}</span>
            </button>

            <button
              onClick={() => setStatusFilter('Entrevistas')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                statusFilter === 'Entrevistas'
                  ? 'border-indigo-600 bg-indigo-50/80 shadow-2xs ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-indigo-600">Entrevistas</span>
                <Calendar className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-xl font-black text-slate-900">{counts.entrevistas}</span>
            </button>

            <button
              onClick={() => setStatusFilter('Contratados')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                statusFilter === 'Contratados'
                  ? 'border-teal-600 bg-teal-50/80 shadow-2xs ring-2 ring-teal-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-teal-600">Contratados</span>
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
              </div>
              <span className="text-xl font-black text-slate-900">{counts.contratados}</span>
            </button>

            <button
              onClick={() => setStatusFilter('Encerrados')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                statusFilter === 'Encerrados'
                  ? 'border-slate-600 bg-slate-100 shadow-2xs ring-2 ring-slate-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-slate-600">Encerrados</span>
                <Clock className="w-4 h-4 text-slate-600" />
              </div>
              <span className="text-xl font-black text-slate-900">{counts.encerrados}</span>
            </button>

            <button
              onClick={() => setStatusFilter('Reprovado')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                statusFilter === 'Reprovado'
                  ? 'border-rose-600 bg-rose-50/80 shadow-2xs ring-2 ring-rose-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-rose-600">Reprovados</span>
                <XCircle className="w-4 h-4 text-rose-600" />
              </div>
              <span className="text-xl font-black text-slate-900">{counts.reprovados}</span>
            </button>
          </div>

          {/* PESQUISA E FILTROS */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por Nome, CPF, Cidade, Telefone, E-mail, Formação, Curso ou Palavras do currículo..."
                className="w-full text-xs font-semibold pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 pt-2 border-t border-slate-100">
              {!job && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Filtrar por Vaga</label>
                  <select
                    value={selectedJobFilter}
                    onChange={(e) => setSelectedJobFilter(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Todas">Todas as Vagas ({companyJobs.length})</option>
                    {companyJobs.map(j => (
                      <option key={j.id} value={j.id}>
                        {j.title} (#{j.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cidade</label>
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Todas">Todas as Cidades</option>
                  {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Escolaridade</label>
                <select
                  value={educationFilter}
                  onChange={(e) => setEducationFilter(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Todas">Todas</option>
                  <option value="Ensino Médio">Ensino Médio</option>
                  <option value="Superior Incompleto">Superior Incompleto</option>
                  <option value="Superior Completo">Superior Completo</option>
                  <option value="Pós-Graduação">Pós-Graduação</option>
                  <option value="Mestrado">Mestrado</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Experiência</label>
                <select
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Todas">Qualquer</option>
                  <option value="1+">1+ anos</option>
                  <option value="3+">3+ anos</option>
                  <option value="5+">5+ anos</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">PCD</label>
                <select
                  value={pcdFilter}
                  onChange={(e) => setPcdFilter(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Todos">Todos</option>
                  <option value="Sim">Sim (Apenas PCD)</option>
                  <option value="Não">Não</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Match IA</label>
                <select
                  value={iaFilter}
                  onChange={(e) => setIaFilter(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Todas">Todas</option>
                  <option value="Muito">Muito Compatível (&gt;85%)</option>
                  <option value="Compativel">Compatível (65-84%)</option>
                  <option value="Baixa">Baixa Compatibilidade (&lt;65%)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Limpar</label>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-bold"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedJobFilter('Todas');
                    setStatusFilter('Todos');
                    setCityFilter('Todas');
                    setEducationFilter('Todas');
                    setExperienceFilter('Todas');
                    setPcdFilter('Todos');
                    setIaFilter('Todas');
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </div>

          {/* LISTA DE CANDIDATOS AGRUPADOS POR VAGA */}
          {groupedJobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-slate-200 shadow-2xs">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-extrabold text-slate-800">
                Nenhum candidato encontrado para os filtros selecionados
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tente alterar os termos de busca, selecionar outra vaga ou resetar os filtros.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedJobs.map((group) => {
                const isCollapsed = !!collapsedGroups[group.jobId];

                return (
                  <div key={group.jobId} className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
                    {/* CABEÇALHO DA VAGA */}
                    <div 
                      onClick={() => toggleGroup(group.jobId)}
                      className="p-4 bg-slate-50/80 hover:bg-slate-100/80 border-b border-slate-200 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                          <Briefcase className="w-5 h-5" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-base font-black text-slate-900 tracking-tight">
                              {group.jobTitle}
                            </h2>
                            <span className="text-[11px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                              #{group.jobCode}
                            </span>
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                              group.jobStatus === 'Preenchida'
                                ? 'bg-slate-200 text-slate-800 border-slate-300'
                                : group.jobStatus === 'Aberta'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              {group.jobStatus}
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {group.location}
                            </span>
                            <span>•</span>
                            <span className="bg-slate-200/70 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {group.contractType}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CONTADORES DA VAGA E ACOPLAMENTO */}
                      <div className="flex items-center gap-3 shrink-0 flex-wrap">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold flex-wrap">
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-xl">
                            Novos: {group.counts.novos}
                          </span>
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-xl">
                            Análise: {group.counts.emAnalise}
                          </span>
                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-1 rounded-xl">
                            Entrevistas: {group.counts.entrevistas}
                          </span>
                          <span className="bg-teal-50 text-teal-700 border border-teal-200 px-2 py-1 rounded-xl">
                            Contratados: {group.counts.contratados}
                          </span>
                          {group.counts.encerradosReprovados > 0 && (
                            <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded-xl">
                              Encerrados: {group.counts.encerradosReprovados}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                          <span className="text-xs font-black text-slate-800 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
                            {group.candidates.length} candidato(s)
                          </span>
                          <button
                            type="button"
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                          >
                            {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* CORPO DO GRUPO DA VAGA */}
                    {!isCollapsed && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                              <th className="py-3 px-4">Candidato</th>
                              <th className="py-3 px-4">Local</th>
                              <th className="py-3 px-4">Data Aplicação</th>
                              <th className="py-3 px-4">Compatibilidade IA</th>
                              <th className="py-3 px-4">Situação / Etapa</th>
                              <th className="py-3 px-4 text-center">Ações Rápidas</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs font-medium">
                            {group.candidates.map((cand) => {
                              const candJobTitle = group.jobTitle || cand.role || 'Vaga';
                              const cleanPhone = cand.phone.replace(/\D/g, '');
                              const waUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(`Olá ${cand.name}, vi seu perfil no MAIS RH para a vaga de ${candJobTitle}.`)}`;
                              const mailUrl = `mailto:${cand.email}?subject=${encodeURIComponent(`Oportunidade - ${candJobTitle} (MAIS RH)`)}`;

                              const isEncerrado = cand.status === 'Encerrado' || (cand.status as string) === 'Vaga Preenchida';

                              return (
                                <tr 
                                  key={cand.id} 
                                  onClick={() => {
                                    setSelectedCandidate(cand);
                                    setIsDrawerOpen(true);
                                  }}
                                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                                >
                                  <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-3">
                                      {(cand.photo || cand.avatar) ? (
                                        <img
                                          src={cand.photo || cand.avatar}
                                          alt={cand.name}
                                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 group-hover:border-indigo-400 transition-colors"
                                        />
                                      ) : (
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs border border-slate-200 shrink-0 group-hover:border-indigo-400 transition-colors">
                                          {cand.name ? cand.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'C'}
                                        </div>
                                      )}
                                      <div>
                                        <span className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors block">
                                          {cand.name}
                                        </span>
                                        <span className="text-[11px] text-slate-500">{cand.role}</span>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="py-3.5 px-4 text-slate-700">
                                    {cand.city}, {cand.state}
                                  </td>

                                  <td className="py-3.5 px-4 text-slate-500 font-semibold">
                                    {formatFirestoreDate(cand.appliedDate)}
                                  </td>

                                  <td className="py-3.5 px-4">
                                    <div className="space-y-1 max-w-[160px]">
                                      <div className="flex items-center justify-between text-[11px]">
                                        <span className="font-black text-slate-900">{cand.compatibilityScore}%</span>
                                        <span className="text-[10px] font-extrabold text-slate-500">{cand.compatibilityLevel}</span>
                                      </div>
                                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full transition-all duration-300 ${
                                            cand.compatibilityScore >= 85 ? 'bg-emerald-500' :
                                            cand.compatibilityScore >= 65 ? 'bg-indigo-600' : 'bg-amber-500'
                                          }`}
                                          style={{ width: `${cand.compatibilityScore}%` }}
                                        />
                                      </div>
                                    </div>
                                  </td>

                                  <td className="py-3.5 px-4">
                                    <div className="space-y-0.5">
                                      <span className={`text-[11px] font-black px-2.5 py-1 rounded-full border inline-block ${
                                        getStatusBadgeColor(cand.status)
                                      }`}>
                                        {cand.status}
                                      </span>
                                      {isEncerrado && (
                                        <span className="block text-[10px] text-slate-400 font-semibold pl-1">
                                          Etapa: Vaga Preenchida
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-center gap-1.5">
                                      <a
                                        href={waUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                        title="Enviar WhatsApp"
                                      >
                                        <MessageCircle className="w-4 h-4" />
                                      </a>

                                      <a
                                        href={mailUrl}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Enviar E-mail"
                                      >
                                        <Mail className="w-4 h-4" />
                                      </a>

                                      <button
                                        onClick={() => {
                                          setSelectedCandidate(cand);
                                          setIsDrawerOpen(true);
                                        }}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Ver Perfil Completo"
                                      >
                                        <FileText className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: BANCO DE TALENTOS IA */}
      {activeTab === 'banco_ia' && (
        <JobTalentBankAiTab
          job={job}
          onCandidateInvited={handleRefresh}
        />
      )}

      {/* TAB CONTENT 3: ENTREVISTAS */}
      {activeTab === 'entrevistas' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Entrevistas Agendadas {job ? `para ${job.title}` : '— Todas as Vagas'}
              </h3>
              <p className="text-xs text-slate-500">Acompanhe a agenda de entrevistas RH e entrevistas com gestores técnicos.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidates.filter(c => c.interview || c.status === 'Entrevista Agendada').length === 0 ? (
              <div className="col-span-2 p-10 text-center space-y-2 border border-slate-100 rounded-2xl bg-slate-50/50">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">Nenhuma entrevista agendada ainda para esta seleção.</p>
                <p className="text-[11px] text-slate-400">Acesse a aba "Candidatos Inscritos" ou "Banco de Talentos IA" para convidar candidatos para entrevista.</p>
              </div>
            ) : (
              candidates.filter(c => c.interview || c.status === 'Entrevista Agendada').map((cand) => (
                <div key={cand.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center gap-3">
                    {(cand.photo || cand.avatar) ? (
                      <img src={cand.photo || cand.avatar} alt={cand.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                        {cand.name ? cand.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'C'}
                      </div>
                    )}
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900">{cand.name}</h4>
                      <span className="text-[10px] text-slate-500 font-medium">{cand.role}</span>
                    </div>
                  </div>
                  {cand.interview && (
                    <div className="text-xs space-y-1 bg-white p-3 rounded-xl border border-slate-200/60">
                      <div className="font-bold text-slate-800">
                        {cand.interview.type} • {cand.interview.date} às {cand.interview.time}
                      </div>
                      <div className="text-slate-500 text-[11px]">Entrevistador: {cand.interview.interviewer}</div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: AVALIAÇÕES */}
      {activeTab === 'avaliacoes' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Avaliações de Candidatos {job ? `— ${job.title}` : '— Geral'}
              </h3>
              <p className="text-xs text-slate-500">Pareceres técnicos, pontuações de competências e recomendações do time de RH.</p>
            </div>
          </div>

          <div className="space-y-3">
            {candidates.filter(c => c.evaluations && c.evaluations.length > 0).length === 0 ? (
              <div className="p-10 text-center space-y-2 border border-slate-100 rounded-2xl bg-slate-50/50">
                <Award className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">Nenhuma avaliação cadastrada ainda.</p>
                <p className="text-[11px] text-slate-400">As avaliações técnicas são registradas no perfil de cada candidato.</p>
              </div>
            ) : (
              candidates.filter(c => c.evaluations && c.evaluations.length > 0).map((cand) => (
                <div key={cand.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {(cand.photo || cand.avatar) ? (
                        <img src={cand.photo || cand.avatar} alt={cand.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {cand.name ? cand.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'C'}
                        </div>
                      )}
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900">{cand.name}</h4>
                        <span className="text-[10px] text-slate-500">{cand.role}</span>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                      Match IA: {cand.compatibilityScore}%
                    </span>
                  </div>

                  {cand.evaluations?.map((ev) => (
                    <div key={ev.id} className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="font-extrabold text-slate-800">
                        Parecer Final: <span className="text-indigo-600">{ev.finalOpinion}</span> (Avaliador: {ev.evaluatedBy})
                      </div>
                      <p className="text-slate-600 text-[11px]">{ev.notes}</p>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: HISTÓRICO */}
      {activeTab === 'historico' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900">
              Histórico e Linha do Tempo {job ? `da Vaga (${job.title})` : 'Geral'}
            </h3>
            <p className="text-xs text-slate-500">Registro de todas as ações, candidaturas e interações no processo seletivo.</p>
          </div>

          <div className="relative border-l-2 border-indigo-100 pl-6 space-y-6 ml-2 text-xs">
            {job && (
              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white" />
                <div className="font-extrabold text-slate-900">Vaga Criada e Publicada</div>
                <p className="text-slate-500">Abertura da requisição para {job.title} no departamento de {job.department}.</p>
                <span className="text-[10px] text-slate-400 font-semibold">{formatFirestoreDate(job.createdAt)}</span>
              </div>
            )}

            {candidates.map((cand) => (
              cand.timeline?.map((evt) => (
                <div key={evt.id} className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
                  <div className="font-extrabold text-slate-900">{evt.title} — {cand.name}</div>
                  <p className="text-slate-600">{evt.description}</p>
                  <span className="text-[10px] text-slate-400 font-semibold">{evt.date} {evt.by ? `• Por: ${evt.by}` : ''}</span>
                </div>
              ))
            ))}
          </div>
        </div>
      )}

      {/* 6. PAINEL LATERAL (Drawer) */}
      <CandidateDrawerPanel
        candidate={selectedCandidate}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onRefresh={handleRefresh}
        jobTitle={job?.title || selectedCandidate?.role || 'Vaga'}
      />
    </div>
  );
};
