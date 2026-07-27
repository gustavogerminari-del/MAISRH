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
  Plus
} from 'lucide-react';
import { Job } from '../types/job';
import { 
  JobCandidateApplication, 
  JobCandidateService, 
  ApplicationStatus 
} from '../../services/JobCandidateService';
import { CandidateDrawerPanel } from './CandidateDrawerPanel';
import { Button, Card } from '../../shared';
import { useAuth } from '../../auth';

interface JobCandidatesManagementViewProps {
  job: Job;
  onBack: () => void;
}

export const JobCandidatesManagementView: React.FC<JobCandidatesManagementViewProps> = ({
  job,
  onBack,
}) => {
  const { user } = useAuth();
  const companyId = user?.companyId || user?.tenantId || user?.id || 'emp-001';

  const [candidates, setCandidates] = useState<JobCandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected candidate for Drawer
  const [selectedCandidate, setSelectedCandidate] = useState<JobCandidateApplication | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [cityFilter, setCityFilter] = useState<string>('Todas');
  const [educationFilter, setEducationFilter] = useState<string>('Todas');
  const [experienceFilter, setExperienceFilter] = useState<string>('Todas');
  const [salaryFilter, setSalaryFilter] = useState<string>('Todos');
  const [pcdFilter, setPcdFilter] = useState<string>('Todos');
  const [iaFilter, setIaFilter] = useState<string>('Todas');

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const list = await JobCandidateService.listByJob(job.id, companyId);
      setCandidates(list);
      // Keep selectedCandidate synced if drawer is open
      if (selectedCandidate) {
        const updated = list.find(c => c.id === selectedCandidate.id);
        if (updated) setSelectedCandidate(updated);
      }
    } catch (err) {
      console.error('Erro ao carregar candidatos para a vaga:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, [job.id, companyId]);

  // Metric Indicators Counts
  const counts = useMemo(() => {
    return {
      total: candidates.length,
      novos: candidates.filter(c => c.status === 'Novos').length,
      triagemIa: candidates.filter(c => c.status === 'Triagem IA').length,
      emAnaliseRh: candidates.filter(c => c.status === 'Em Análise RH').length,
      entrevistas: candidates.filter(c => c.status === 'Entrevista Agendada' || c.status === 'Entrevista Realizada').length,
      contratados: candidates.filter(c => c.status === 'Contratado' || c.status === 'Aprovado').length,
      reprovados: candidates.filter(c => c.status === 'Reprovado').length,
    };
  }, [candidates]);

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
        (statusFilter === 'Contratados' && (c.status === 'Contratado' || c.status === 'Aprovado'));

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
  }, [candidates, searchTerm, statusFilter, cityFilter, educationFilter, experienceFilter, pcdFilter, iaFilter]);

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
      
      {/* 1. TOPO DA TELA (Header da Vaga) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-3.5 py-2 rounded-xl transition-colors border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Lista de Vagas
          </button>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-black px-3 py-1 rounded-full border ${
              job.status === 'Aberta' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700'
            }`}>
              {job.status}
            </span>
            <button
              onClick={loadCandidates}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
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
                {job.title}
              </h1>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                #{job.id}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-medium text-slate-500 flex-wrap">
              <span className="flex items-center gap-1 font-bold text-slate-700">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                {job.department}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {job.location}
              </span>
              <span>•</span>
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-indigo-100">
                {job.type}
              </span>
              <span>•</span>
              <span>Abertura: {job.createdAt}</span>
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

      {/* 2. INDICADORES RÁPIDOS (Metric Filter Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <button
          onClick={() => setStatusFilter('Todos')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
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
          className={`p-3.5 rounded-2xl border text-left transition-all ${
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
          className={`p-3.5 rounded-2xl border text-left transition-all ${
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
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            statusFilter === 'Em Análise RH'
              ? 'border-amber-600 bg-amber-50/80 shadow-2xs ring-2 ring-amber-500/20'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold text-amber-600">Em Análise</span>
            <UserCheck className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-xl font-black text-slate-900">{counts.emAnaliseRh}</span>
        </button>

        <button
          onClick={() => setStatusFilter('Entrevistas')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
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
          className={`p-3.5 rounded-2xl border text-left transition-all ${
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
          onClick={() => setStatusFilter('Reprovado')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
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

      {/* 3 & 4. PESQUISA E FILTROS */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
        {/* Search Bar Input */}
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

        {/* Dropdown Filters Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-100">
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
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ação Filtros</label>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setSearchTerm('');
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

      {/* 5. LISTA DE CANDIDATOS (Professional Table) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredCandidates.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-extrabold text-slate-800">
              Nenhum candidato encontrado para os filtros selecionados
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tente alterar os termos de busca ou resetar os filtros.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Candidato</th>
                  <th className="py-3.5 px-4">Local</th>
                  <th className="py-3.5 px-4">Data Aplicação</th>
                  <th className="py-3.5 px-4">Compatibilidade IA</th>
                  <th className="py-3.5 px-4">Situação / Etapa</th>
                  <th className="py-3.5 px-4 text-center">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {filteredCandidates.map((cand) => {
                  const cleanPhone = cand.phone.replace(/\D/g, '');
                  const waUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(`Olá ${cand.name}, vi seu perfil no MAIS RH para a vaga de ${job.title}.`)}`;
                  const mailUrl = `mailto:${cand.email}?subject=${encodeURIComponent(`Oportunidade - ${job.title} (MAIS RH)`)}`;

                  return (
                    <tr 
                      key={cand.id} 
                      onClick={() => handleOpenCandidate(cand)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Avatar + Name + Role */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={cand.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={cand.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 group-hover:border-indigo-400 transition-colors"
                          />
                          <div>
                            <span className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors block">
                              {cand.name}
                            </span>
                            <span className="text-[11px] text-slate-500">{cand.role}</span>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-slate-700">
                        {cand.city}, {cand.state}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 font-semibold">
                        {cand.appliedDate}
                      </td>

                      {/* IA Compatibility */}
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

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${getStatusBadgeColor(cand.status)}`}>
                          {cand.status}
                        </span>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                            title="Enviar WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          <a
                            href={mailUrl}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                            title="Enviar E-mail"
                          >
                            <Mail className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => handleOpenCandidate(cand)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-200"
                            title="Ver Perfil Completo & Currículo"
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

      {/* 6. PAINEL LATERAL (Drawer) */}
      <CandidateDrawerPanel
        candidate={selectedCandidate}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onRefresh={loadCandidates}
        jobTitle={job.title}
      />
    </div>
  );
};
