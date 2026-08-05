import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  UserCheck,
  Send,
  FileText,
  Brain,
  MessageCircle,
  Mail,
  Building2,
  MapPin,
  Briefcase,
  GraduationCap,
  DollarSign,
  AlertCircle,
  Award,
  RefreshCw,
  ChevronRight,
  UserPlus,
  Zap,
  X,
  Clock,
  ThumbsUp
} from 'lucide-react';
import { Job } from '../types/job';
import { Candidate } from '../../types/rh';
import { CandidateService } from '../../services/CandidateService';
import { JobCandidateService, JobCandidateApplication } from '../../services/JobCandidateService';
import { useAuth } from '../../auth';
import { Button } from '../../shared';
import { calculateCandidateJobMatch } from '../utils/jobUtils';

export interface TalentBankMatchResult {
  candidateId: string;
  candidateName: string;
  compatibilityScore: number;
  compatibilityLevel: 'Muito compatível' | 'Compatível' | 'Baixa compatibilidade' | string;
  motivos: string[];
  pontosFortes: string[];
  pontosAtencao: string[];
  analiseCurriculo: {
    experienciaProfissional: string;
    empresasAnteriores: string[];
    tempoExperiencia: string;
    formacao: string;
    cursos: string[];
    habilidadesTecnicas: string[];
    competenciasComportamentais: string[];
    localizacao: string;
    pretensaoSalarial: string;
    compatibilidadeComVaga: string;
  };
  recomendacao: string;
  // Attached candidate reference
  candidateRef?: Candidate;
}

interface JobTalentBankAiTabProps {
  job?: Job | null;
  onCandidateInvited?: () => void;
}

export const JobTalentBankAiTab: React.FC<JobTalentBankAiTabProps> = ({
  job,
  onCandidateInvited,
}) => {
  const { user } = useAuth();
  const companyId = user?.companyId || 'emp-001';

  // Loading & state
  const [loading, setLoading] = useState(false);
  const [analyzingProgress, setAnalyzingProgress] = useState(0);
  const [talentCandidates, setTalentCandidates] = useState<Candidate[]>([]);
  const [existingApplications, setExistingApplications] = useState<JobCandidateApplication[]>([]);
  const [matchResults, setMatchResults] = useState<TalentBankMatchResult[]>([]);
  const [invitedCandidateIds, setInvitedCandidateIds] = useState<Set<string>>(new Set());

  // Modals & Panels
  const [selectedMatchForAnalysis, setSelectedMatchForAnalysis] = useState<TalentBankMatchResult | null>(null);
  const [selectedCandidateForCv, setSelectedCandidateForCv] = useState<Candidate | null>(null);
  const [sendMessageModal, setSendMessageModal] = useState<{ isOpen: boolean; candidate: Candidate | null; match: TalentBankMatchResult | null }>({
    isOpen: false,
    candidate: null,
    match: null,
  });

  // Action status message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [compatFilter, setCompatFilter] = useState<string>('Todas');
  const [roleFilter, setRoleFilter] = useState<string>('Todos');
  const [expFilter, setExpFilter] = useState<string>('Todas');
  const [locationFilter, setLocationFilter] = useState<string>('Todas');
  const [educationFilter, setEducationFilter] = useState<string>('Todas');

  // Load candidates and existing job applications
  const loadTalentData = async () => {
    setLoading(true);
    try {
      const candidatesList = await CandidateService.list(companyId);
      const applicationsList = job?.id
        ? await JobCandidateService.listByJob(job.id, companyId)
        : await JobCandidateService.listAll(companyId);
      
      setTalentCandidates(candidatesList);
      setExistingApplications(applicationsList);

      const invitedIds = new Set(applicationsList.map((app) => app.candidateId));
      setInvitedCandidateIds(invitedIds);

      // Run AI matching if job is available
      if (job) {
        await runAiMatching(candidatesList, job);
      } else {
        const fallbackMatches: TalentBankMatchResult[] = candidatesList.map(cand => ({
          candidateId: cand.id,
          candidateName: cand.name,
          compatibilityScore: (cand as any).matchScore || 85,
          compatibilityLevel: 'Compatível',
          motivos: ['Perfil cadastrado no Banco de Talentos'],
          pontosFortes: cand.skills || [],
          pontosAtencao: [],
          analiseCurriculo: {
            experienciaProfissional: `${cand.experienceYears || 0} anos de experiência`,
            empresasAnteriores: [],
            tempoExperiencia: `${cand.experienceYears || 0} anos`,
            formacao: (cand as any).education || 'Ensino Superior',
            cursos: [],
            habilidadesTecnicas: cand.skills || [],
            competenciasComportamentais: [],
            localizacao: cand.location || '',
            pretensaoSalarial: cand.salaryExpectation || 'A combinar',
            compatibilidadeComVaga: 'Compatibilidade disponível para vagas ativas'
          },
          recomendacao: 'Disponível no Banco de Talentos',
          candidateRef: cand
        }));
        setMatchResults(fallbackMatches);
      }
    } catch (err) {
      console.error('Erro ao carregar banco de talentos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTalentData();
  }, [job?.id, companyId]);

  // Execute AI Matching call with deterministic local fallback
  const runAiMatching = async (candidates: Candidate[], currentJob: Job) => {
    setLoading(true);
    setAnalyzingProgress(15);
    const interval = setInterval(() => {
      setAnalyzingProgress((prev) => (prev < 90 ? prev + 15 : prev));
    }, 250);

    let fetchedMatches: TalentBankMatchResult[] = [];

    try {
      const response = await fetch('/api/ai/talent-bank-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job: currentJob,
          candidates,
          companyId,
        }),
      });

      const resData = await response.json();
      if (resData.success && resData.data?.matches) {
        fetchedMatches = resData.data.matches.map((m: any) => {
          const matchedCand = candidates.find((c) => c.id === m.candidateId || c.name === m.candidateName);
          return {
            ...m,
            candidateRef: matchedCand || {
              id: m.candidateId || `cand-${Date.now()}`,
              name: m.candidateName,
              email: 'candidato@email.com',
              phone: '(11) 99999-8888',
              role: m.analiseCurriculo?.experienciaProfissional || 'Profissional',
              location: m.analiseCurriculo?.localizacao || 'São Paulo, SP',
              experienceYears: parseInt(m.analiseCurriculo?.tempoExperiencia) || 3,
              skills: m.analiseCurriculo?.habilidadesTecnicas || [],
              status: 'Ativo',
              rating: 5,
              notes: m.analiseCurriculo?.compatibilidadeComVaga || '',
              avatar: '',
              appliedDate: new Date().toISOString().split('T')[0],
              source: 'LinkedIn',
            },
          };
        });
      }
    } catch (err) {
      console.warn('IA indisponível. Executando cálculo de compatibilidade determinístico local:', err);
    } finally {
      clearInterval(interval);
      setAnalyzingProgress(100);

      // Deterministic fallback if API produced no matches
      if (fetchedMatches.length === 0 && candidates.length > 0) {
        fetchedMatches = candidates.map((cand) => {
          const match = calculateCandidateJobMatch(currentJob, cand);
          const isHigh = match.score >= 80;
          const isMed = match.score >= 60;
          return {
            candidateId: cand.id,
            candidateName: cand.name,
            compatibilityScore: match.score,
            compatibilityLevel: isHigh ? 'Muito compatível' : isMed ? 'Compatível' : 'Baixa compatibilidade',
            motivos: [match.summary],
            pontosFortes: match.matchedSkills.length > 0 ? match.matchedSkills : (cand.skills || []),
            pontosAtencao: match.missingSkills,
            analiseCurriculo: {
              experienciaProfissional: `${cand.experienceYears || 0} anos de experiência`,
              empresasAnteriores: [],
              tempoExperiencia: `${cand.experienceYears || 0} anos`,
              formacao: (cand as any).education || 'Ensino Superior',
              cursos: [],
              habilidadesTecnicas: cand.skills || [],
              competenciasComportamentais: [],
              localizacao: cand.location || '',
              pretensaoSalarial: cand.salaryExpectation || 'A combinar',
              compatibilidadeComVaga: match.summary
            },
            recomendacao: isHigh ? 'Recomendado para Triagem' : 'Perfil em Análise (Cálculo Básico)',
            candidateRef: cand
          };
        });
      }

      fetchedMatches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
      setMatchResults(fetchedMatches);

      setLoading(false);
      setTimeout(() => setAnalyzingProgress(0), 500);
    }
  };

  // Toast handler
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Action: Invite candidate to job
  const handleInviteCandidate = async (match: TalentBankMatchResult) => {
    const candidate = match.candidateRef;
    if (!candidate) return;

    try {
      const newApp = await JobCandidateService.create({
        companyId,
        jobId: job.id,
        candidateId: candidate.id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        role: candidate.role,
        city: candidate.location.split(',')[0] || 'São Paulo',
        state: candidate.location.split(',')[1]?.trim() || 'SP',
        appliedDate: new Date().toISOString().split('T')[0],
        status: 'Novos',
        compatibilityScore: match.compatibilityScore,
        compatibilityLevel: match.compatibilityScore >= 85 ? 'Muito compatível' : match.compatibilityScore >= 70 ? 'Compatível' : 'Baixa compatibilidade',
        experienceYears: candidate.experienceYears,
        salaryExpectation: candidate.salaryExpectation || job.salaryRange,
        resumeKeywords: candidate.skills,
        photo: candidate.avatar,
        aiAnalysis: {
          summary: match.analiseCurriculo.compatibilidadeComVaga,
          strengths: match.pontosFortes,
          pointsOfAttention: match.pontosAtencao,
          competencies: match.analiseCurriculo.habilidadesTecnicas,
          behavioralAnalysis: match.analiseCurriculo.competenciasComportamentais.join(', '),
          interviewSuggestions: [
            `Aprofundar nos pontos fortes de ${match.pontosFortes[0] || 'experiência'}.`,
            'Validar expectativas de modelo de trabalho e pretensão salarial.'
          ],
          score: match.compatibilityScore,
          recommendation: match.recomendacao as any || 'Recomendado'
        },
        timeline: [
          {
            id: `evt-${Date.now()}`,
            title: 'Convite Enviado via IA',
            description: `Recrutador convidou o candidato do Banco de Talentos para a vaga "${job.title}". Match IA: ${match.compatibilityScore}%.`,
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            by: user?.name || 'Recrutador RH'
          }
        ]
      });

      // Update local state
      setInvitedCandidateIds((prev) => new Set(prev).add(candidate.id));
      showToast(`Convite enviado com sucesso para ${candidate.name}! O candidato foi vinculado à vaga.`);

      if (onCandidateInvited) {
        onCandidateInvited();
      }
    } catch (err) {
      console.error('Erro ao convidar candidato:', err);
      showToast('Erro ao enviar convite. Tente novamente.');
    }
  };

  // Action: Direct Add to Selection Process
  const handleAddToSelectionProcess = async (match: TalentBankMatchResult) => {
    const candidate = match.candidateRef;
    if (!candidate) return;

    try {
      await JobCandidateService.create({
        companyId,
        jobId: job.id,
        candidateId: candidate.id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        role: candidate.role,
        city: candidate.location.split(',')[0] || 'São Paulo',
        state: candidate.location.split(',')[1]?.trim() || 'SP',
        appliedDate: new Date().toISOString().split('T')[0],
        status: 'Em Análise RH',
        compatibilityScore: match.compatibilityScore,
        compatibilityLevel: match.compatibilityScore >= 85 ? 'Muito compatível' : match.compatibilityScore >= 70 ? 'Compatível' : 'Baixa compatibilidade',
        experienceYears: candidate.experienceYears,
        salaryExpectation: candidate.salaryExpectation || job.salaryRange,
        photo: candidate.avatar,
        timeline: [
          {
            id: `evt-${Date.now()}`,
            title: 'Adicionado ao Processo Seletivo',
            description: `Incluso diretamente no processo seletivo pela equipe de RH a partir do Banco de Talentos IA.`,
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            by: user?.name || 'Recrutador RH'
          }
        ]
      });

      setInvitedCandidateIds((prev) => new Set(prev).add(candidate.id));
      showToast(`${candidate.name} adicionado(a) diretamente à etapa "Em Análise RH"!`);

      if (onCandidateInvited) {
        onCandidateInvited();
      }
    } catch (err) {
      console.error('Erro ao adicionar ao processo:', err);
      showToast('Erro ao adicionar candidato ao processo.');
    }
  };

  // Unique roles, locations, educations for filters
  const availableRoles = useMemo(() => {
    const set = new Set<string>();
    talentCandidates.forEach((c) => c.role && set.add(c.role));
    return Array.from(set);
  }, [talentCandidates]);

  const availableLocations = useMemo(() => {
    const set = new Set<string>();
    talentCandidates.forEach((c) => c.location && set.add(c.location));
    return Array.from(set);
  }, [talentCandidates]);

  // Filtered Match Results
  const filteredMatches = useMemo(() => {
    return matchResults.filter((match) => {
      const candidate = match.candidateRef;
      if (!candidate) return true;

      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        candidate.name.toLowerCase().includes(term) ||
        candidate.role.toLowerCase().includes(term) ||
        candidate.skills.some((s) => s.toLowerCase().includes(term)) ||
        match.motivos.some((m) => m.toLowerCase().includes(term));

      const matchesCompat =
        compatFilter === 'Todas' ||
        (compatFilter === 'Excelente' && match.compatibilityScore >= 90) ||
        (compatFilter === 'Alta' && match.compatibilityScore >= 75 && match.compatibilityScore < 90) ||
        (compatFilter === 'Media' && match.compatibilityScore < 75);

      const matchesRole = roleFilter === 'Todos' || candidate.role === roleFilter;

      const matchesExp =
        expFilter === 'Todas' ||
        (expFilter === '1+' && candidate.experienceYears >= 1) ||
        (expFilter === '3+' && candidate.experienceYears >= 3) ||
        (expFilter === '5+' && candidate.experienceYears >= 5);

      const matchesLoc = locationFilter === 'Todas' || candidate.location === locationFilter;

      return matchesSearch && matchesCompat && matchesRole && matchesExp && matchesLoc;
    });
  }, [matchResults, searchTerm, compatFilter, roleFilter, expFilter, locationFilter]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* AI BANNER & SEARCH TRIGGER */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              Recrutamento Preditivo com Inteligência Artificial
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Cruzamento Automático com o Banco de Talentos
            </h2>
            <p className="text-xs text-indigo-100/80 leading-relaxed">
              Nossa IA analisa requisitos de <strong className="text-white">{job.title}</strong> (cargo, competências, localização, remuneração) e encontra instantaneamente os candidatos com maior afinidade cadastrados no sistema.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => runAiMatching(talentCandidates, job)}
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black shadow-lg shadow-emerald-500/20 border-0"
            >
              <Zap className="w-4 h-4 mr-2" />
              {loading ? 'Analisando Banco...' : 'Encontrar candidatos no Banco de Talentos'}
            </Button>
          </div>
        </div>

        {/* Progress indicator */}
        {analyzingProgress > 0 && (
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold text-indigo-200">
              <span>Cruzando currículos e competências...</span>
              <span>{analyzingProgress}%</span>
            </div>
            <div className="w-full bg-indigo-950/60 h-2 rounded-full overflow-hidden border border-indigo-700/40">
              <div
                className="bg-gradient-to-r from-emerald-400 to-indigo-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${analyzingProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* INTELLIGENT FILTERS */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Filtros Inteligentes de Talentos
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            {filteredMatches.length} candidatos compatíveis encontrados
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Term */}
          <div className="lg:col-span-1">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Buscar Candidato / Skill</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Nome, cargo ou habilidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Compatibility Filter */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Compatibilidade IA</label>
            <select
              value={compatFilter}
              onChange={(e) => setCompatFilter(e.target.value)}
              className="w-full text-xs font-bold p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            >
              <option value="Todas">Todas as notas</option>
              <option value="Excelente">Excelente (&gt;= 90%)</option>
              <option value="Alta">Alta (75% - 89%)</option>
              <option value="Media">Média (&lt; 75%)</option>
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Cargo Atual / Função</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full text-xs font-bold p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            >
              <option value="Todos">Todos os cargos</option>
              {availableRoles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Experience Filter */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Experiência Mínima</label>
            <select
              value={expFilter}
              onChange={(e) => setExpFilter(e.target.value)}
              className="w-full text-xs font-bold p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            >
              <option value="Todas">Qualquer tempo</option>
              <option value="1+">A partir de 1 ano</option>
              <option value="3+">A partir de 3 anos</option>
              <option value="5+">A partir de 5 anos</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setCompatFilter('Todas');
                setRoleFilter('Todos');
                setExpFilter('Todas');
                setLocationFilter('Todas');
              }}
              className="w-full text-xs font-bold rounded-xl"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* SMART LIST (NO KANBAN) */}
      <div className="space-y-4">
        {loading && matchResults.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs font-extrabold text-slate-700">
              Mapeando candidatos do Banco de Talentos com a vaga...
            </p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-extrabold text-slate-800">
              Nenhum candidato encontrado no Banco de Talentos para os critérios atuais
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Tente redefinir os filtros ou clique em "Encontrar candidatos no Banco de Talentos" para reprocessar a busca com IA.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredMatches.map((match, index) => {
              const candidate = match.candidateRef!;
              const isInvited = invitedCandidateIds.has(candidate.id);

              return (
                <div
                  key={candidate.id || index}
                  className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-indigo-300 shadow-2xs hover:shadow-md transition-all duration-200 space-y-5"
                >
                  {/* TOP CANDIDATE ROW */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Candidate Identity */}
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        {candidate.avatar ? (
                          <img
                            src={candidate.avatar}
                            alt={candidate.name}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-2xs"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-base border-2 border-slate-100 shadow-2xs">
                            {candidate.name ? candidate.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'C'}
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border border-white">
                          #{index + 1}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-black text-slate-900 tracking-tight">
                            {candidate.name}
                          </h3>
                          {isInvited && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Convite enviado / No Processo
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium flex-wrap">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            {candidate.role}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {candidate.location}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {candidate.experienceYears} anos exp.
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-700 font-bold">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            {candidate.salaryExpectation || 'Pretensão não especificada'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* IA Match Badge */}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center gap-4 min-w-[200px] justify-between">
                      <div>
                        <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                          Compatibilidade IA
                        </div>
                        <div className="text-lg font-black text-slate-900 flex items-center gap-1">
                          {match.compatibilityScore}%
                          <span className="text-[11px] font-extrabold text-slate-500">
                            ({match.compatibilityLevel})
                          </span>
                        </div>
                      </div>

                      <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                        <Sparkles className="w-6 h-6 text-indigo-600" />
                      </div>
                    </div>
                  </div>

                  {/* REASONS & STRENGTHS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 text-xs">
                    {/* Motivos de Aderência */}
                    <div className="space-y-2">
                      <div className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                        Motivos de Sinergia com a Vaga:
                      </div>
                      <ul className="space-y-1">
                        {match.motivos.map((motivo, idx) => (
                          <li key={idx} className="text-slate-700 font-semibold flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold shrink-0">{motivo.startsWith('✓') ? '' : '✓'}</span>
                            <span>{motivo}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Resumo do Perfil & Competências */}
                    <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-200/80 pt-3 md:pt-0 md:pl-4">
                      <div className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5 text-indigo-600" />
                        Resumo do Perfil & Habilidades:
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                        {match.analiseCurriculo.experienciaProfissional}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {match.analiseCurriculo.habilidadesTecnicas.slice(0, 5).map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="bg-white text-slate-700 font-bold text-[10px] px-2 py-0.5 rounded-md border border-slate-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* RH QUICK ACTIONS (REQUIREMENT #5) */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Visualizar Currículo */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCandidateForCv(candidate)}
                        className="text-xs font-bold rounded-xl text-slate-700"
                      >
                        <FileText className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                        Visualizar currículo
                      </Button>

                      {/* Analisar com IA */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMatchForAnalysis(match)}
                        className="text-xs font-bold rounded-xl text-indigo-700 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100"
                      >
                        <Brain className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                        Analisar com IA
                      </Button>

                      {/* Enviar Mensagem */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSendMessageModal({ isOpen: true, candidate, match })}
                        className="text-xs font-bold rounded-xl text-emerald-700 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100"
                      >
                        <MessageCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                        Enviar mensagem
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Adicionar ao Processo Seletivo */}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isInvited}
                        onClick={() => handleAddToSelectionProcess(match)}
                        className="text-xs font-bold rounded-xl border-slate-300 text-slate-800"
                      >
                        <UserPlus className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
                        Adicionar ao processo seletivo
                      </Button>

                      {/* Convidar para Vaga */}
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isInvited}
                        onClick={() => handleInviteCandidate(match)}
                        className={`text-xs font-extrabold rounded-xl ${
                          isInvited
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                        {isInvited ? 'Convite Enviado' : 'Convidar para vaga'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: DETAILED AI ANALYSIS MODAL */}
      {selectedMatchForAnalysis && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <Brain className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Análise Aprofundada da IA — {selectedMatchForAnalysis.candidateName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Vaga: {job.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMatchForAnalysis(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-indigo-200 tracking-wider">
                  Sinergia Geral
                </span>
                <div className="text-2xl font-black text-white">
                  {selectedMatchForAnalysis.compatibilityScore}%
                </div>
              </div>
              <span className="bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full">
                {selectedMatchForAnalysis.recomendacao}
              </span>
            </div>

            {/* Curriculum Breakdown */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Mapeamento do Currículo
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-bold block text-[10px]">Tempo de Experiência</span>
                  <span className="text-slate-900 font-extrabold">
                    {selectedMatchForAnalysis.analiseCurriculo.tempoExperiencia}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-bold block text-[10px]">Formação</span>
                  <span className="text-slate-900 font-extrabold">
                    {selectedMatchForAnalysis.analiseCurriculo.formacao}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-bold block text-[10px]">Empresas Anteriores</span>
                  <span className="text-slate-900 font-extrabold">
                    {selectedMatchForAnalysis.analiseCurriculo.empresasAnteriores?.join(', ') || 'Não especificado'}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-bold block text-[10px]">Pretensão Salarial</span>
                  <span className="text-slate-900 font-extrabold">
                    {selectedMatchForAnalysis.analiseCurriculo.pretensaoSalarial}
                  </span>
                </div>
              </div>

              {/* Strengths & Attention Points */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-2xl p-4 space-y-2">
                  <h5 className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                    Pontos Fortes
                  </h5>
                  <ul className="space-y-1 text-xs text-emerald-950 font-medium">
                    {selectedMatchForAnalysis.pontosFortes.map((p, i) => (
                      <li key={i}>• {p}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-4 space-y-2">
                  <h5 className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Pontos de Atenção
                  </h5>
                  <ul className="space-y-1 text-xs text-amber-950 font-medium">
                    {selectedMatchForAnalysis.pontosAtencao.map((p, i) => (
                      <li key={i}>• {p}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMatchForAnalysis(null)}
              >
                Fechar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleInviteCandidate(selectedMatchForAnalysis);
                  setSelectedMatchForAnalysis(null);
                }}
              >
                Convidar Candidato Agora
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CV / RESUME MODAL */}
      {selectedCandidateForCv && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCandidateForCv.avatar}
                  alt={selectedCandidateForCv.name}
                  className="w-12 h-12 rounded-2xl object-cover"
                />
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {selectedCandidateForCv.name}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedCandidateForCv.role} • {selectedCandidateForCv.location}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidateForCv(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <span className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px] block">
                  Resumo e Observações
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {selectedCandidateForCv.notes || 'Candidato atuante no mercado com perfil atualizado no Banco de Talentos.'}
                </p>
              </div>

              <div>
                <span className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px] block mb-2">
                  Competências & Habilidades
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidateForCv.skills.map((s, idx) => (
                    <span key={idx} className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-lg border border-indigo-100">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="border border-slate-100 p-3 rounded-xl">
                  <span className="text-slate-400 text-[10px] block font-bold">E-mail</span>
                  <span className="font-bold text-slate-800">{selectedCandidateForCv.email}</span>
                </div>
                <div className="border border-slate-100 p-3 rounded-xl">
                  <span className="text-slate-400 text-[10px] block font-bold">Telefone</span>
                  <span className="font-bold text-slate-800">{selectedCandidateForCv.phone}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedCandidateForCv(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SEND MESSAGE MODAL */}
      {sendMessageModal.isOpen && sendMessageModal.candidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-black text-slate-900">
                  Enviar Mensagem para {sendMessageModal.candidate.name}
                </h3>
              </div>
              <button
                onClick={() => setSendMessageModal({ isOpen: false, candidate: null, match: null })}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Escolha o canal para entrar em contato com o candidato sobre a oportunidade para <strong className="text-slate-900">{job.title}</strong>:
            </p>

            <div className="space-y-3">
              <a
                href={`https://wa.me/55${sendMessageModal.candidate.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Olá ${sendMessageModal.candidate.name}, vimos o seu perfil no Banco de Talentos da MAIS RH e identificamos excelente afinidade com nossa vaga aberta de ${job.title}! Teria interesse em conversar sobre esta oportunidade?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 rounded-2xl border border-emerald-200 transition-colors font-extrabold text-xs"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div>Enviar via WhatsApp</div>
                    <div className="text-[10px] font-medium text-emerald-700">{sendMessageModal.candidate.phone}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-600" />
              </a>

              <a
                href={`mailto:${sendMessageModal.candidate.email}?subject=${encodeURIComponent(
                  `Convite de Oportunidade - ${job.title} (MAIS RH)`
                )}&body=${encodeURIComponent(
                  `Olá ${sendMessageModal.candidate.name},\n\nIdentificamos que seu perfil profissional possui forte aderência com nossa vaga de ${job.title}.\n\nGostaria de convidá-lo(a) a participar do nosso processo seletivo.\n\nAtenciosamente,\nEquipe de Recrutamento MAIS RH`
                )}`}
                className="flex items-center justify-between p-3.5 bg-blue-50 hover:bg-blue-100 text-blue-950 rounded-2xl border border-blue-200 transition-colors font-extrabold text-xs"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <div>Enviar via E-mail</div>
                    <div className="text-[10px] font-medium text-blue-700">{sendMessageModal.candidate.email}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-600" />
              </a>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSendMessageModal({ isOpen: false, candidate: null, match: null })}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
