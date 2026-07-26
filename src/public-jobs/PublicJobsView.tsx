import React, { useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Building2, 
  Clock, 
  Search, 
  Filter, 
  CheckCircle2, 
  Send, 
  Upload, 
  Sparkles, 
  ChevronRight, 
  ShieldCheck, 
  LogIn, 
  X,
  FileText,
  DollarSign,
  User,
  Phone,
  Mail,
  Linkedin,
  HeartHandshake
} from 'lucide-react';
import { PublicJob, CandidateApplicationPayload } from './types';
import { MOCK_PUBLIC_JOBS } from './mockData';
import { Job, Candidate } from '../types/rh';

export interface PublicJobsViewProps {
  jobs?: Job[];
  onApplyCandidate?: (candidateData: Omit<Candidate, 'id' | 'appliedDate'>) => void;
  onGoToLogin?: () => void;
  isInternalView?: boolean;
}

export const PublicJobsView: React.FC<PublicJobsViewProps> = ({
  jobs,
  onApplyCandidate,
  onGoToLogin,
  isInternalView = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('Todos');
  const [selectedCity, setSelectedCity] = useState('Todas');
  const [selectedContractType, setSelectedContractType] = useState('Todos');
  const [selectedWorkMode, setSelectedWorkMode] = useState('Todos');
  const [selectedJob, setSelectedJob] = useState<PublicJob | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cityState, setCityState] = useState('');
  const [salaryExpectation, setSalaryExpectation] = useState('');
  const [experienceYears, setExperienceYears] = useState('3');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isPne, setIsPne] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Combine prop jobs with mock jobs if needed
  const activeJobsList: PublicJob[] = React.useMemo(() => {
    if (jobs && jobs.length > 0) {
      return jobs
        .filter(j => j.status === 'Aberta' || !j.status)
        .map(j => ({
          id: j.id,
          code: j.id.substring(0, 8).toUpperCase(),
          title: j.title,
          companyName: 'MAIS RH Brasil',
          department: j.department,
          location: j.location,
          workMode: j.locationType || 'Híbrido',
          contractType: j.type || 'CLT',
          salaryRange: j.salaryRange || 'R$ 5.000 - R$ 7.500',
          description: j.description || 'Oportunidade integrante do time MAIS RH.',
          requirements: j.requirements || ['Superior Completo', 'Experiência prévia na área'],
          benefits: ['Vale Refeição R$ 1.000/mês', 'Plano de Saúde', 'Seguro de Vida', 'Auxílio Home Office'],
          publishedAt: j.createdAt || new Date().toISOString().split('T')[0],
          featured: j.applicantsCount > 3
        }));
    }
    return MOCK_PUBLIC_JOBS;
  }, [jobs]);

  // Extract Departments & Cities dynamically
  const departments = ['Todos', ...Array.from(new Set(activeJobsList.map(j => j.department)))];
  const cities = ['Todas', ...Array.from(new Set(activeJobsList.map(j => j.location)))];

  const filteredJobs = activeJobsList.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'Todos' || job.department === selectedDepartment;
    const matchesCity = selectedCity === 'Todas' || job.location === selectedCity;
    const matchesContract = selectedContractType === 'Todos' || job.contractType === selectedContractType;
    const matchesWorkMode = selectedWorkMode === 'Todos' || job.workMode === selectedWorkMode;

    return matchesSearch && matchesDepartment && matchesCity && matchesContract && matchesWorkMode;
  });

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    // Send to internal Banco de Talentos if handler exists
    if (onApplyCandidate) {
      onApplyCandidate({
        name: fullName,
        email,
        phone,
        role: selectedJob.title,
        location: cityState,
        experienceYears: Number(experienceYears) || 3,
        skills: ['Comunicação', 'Trabalho em Equipe', selectedJob.department],
        status: 'Em Processo',
        currentJobId: selectedJob.id,
        currentStageId: 'inscritos',
        rating: 4,
        notes: coverNote 
          ? `Pretensão Salarial: ${salaryExpectation || 'Não informada'}. ${coverNote}` 
          : `Inscrição pelo Site Público de Vagas MAIS RH. Pretensão: ${salaryExpectation || 'A combinar'}.`,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        source: 'Site Institucional',
        resumeUrl: resumeFile ? resumeFile.name : 'curriculo_candidato.pdf',
        salaryExpectation: salaryExpectation || 'A combinar',
      });
    }

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setIsApplying(false);
      setSelectedJob(null);
      // Reset form
      setFullName('');
      setEmail('');
      setPhone('');
      setCityState('');
      setSalaryExpectation('');
      setLinkedinUrl('');
      setIsPne(false);
      setCoverNote('');
      setResumeFile(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* 🔮 Top Public Header with MAIS RH branding */}
      <header className="bg-white border-b border-purple-100 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo MAIS RH */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 flex items-center justify-center text-white font-black text-2xl shadow-md shadow-purple-500/20">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">MAIS RH</h1>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">
                  VAGAS & CARREIRAS
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Portal Oficial de Oportunidades do Grupo MAIS RH</p>
            </div>
          </div>

          {/* Right Action: Login or Internal Indicator */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {activeJobsList.length} Vagas Abertas
            </div>

            {isInternalView ? (
              <span className="text-xs font-semibold px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl">
                👁️ Pré-visualização Interna
              </span>
            ) : (
              <button
                onClick={onGoToLogin}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-md shadow-purple-500/20 transition-all hover:scale-102 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Acessar Sistema Interno</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 🚀 Hero Banner */}
      <section className="bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-800/60 border border-purple-400/30 text-purple-200 text-xs font-bold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            Construa o seu futuro com o Grupo MAIS RH Brasil
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Encontre sua próxima oportunidade profissional
          </h2>
          <p className="text-purple-200 text-sm sm:text-base max-w-2xl mx-auto font-normal">
            Processo 100% gratuito, transparente e integrado diretamente ao nosso Banco de Talentos nacional.
          </p>

          {/* 🔍 Search & Filters Bar */}
          <div className="mt-8 bg-white/95 backdrop-blur-md p-4 rounded-3xl shadow-2xl text-slate-900 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border border-purple-100">
            {/* Keyword Search */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-purple-500 absolute left-3" />
              <input
                type="text"
                placeholder="Cargo, palavra-chave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>

            {/* Department Filter */}
            <div className="relative flex items-center">
              <Filter className="w-4 h-4 text-purple-500 absolute left-3" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              >
                <option value="Todos">Área: Todas as Áreas</option>
                {departments.filter(d => d !== 'Todos').map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* City Filter */}
            <div className="relative flex items-center">
              <MapPin className="w-4 h-4 text-purple-500 absolute left-3" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              >
                <option value="Todas">Cidade: Todas</option>
                {cities.filter(c => c !== 'Todas').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Work Mode Filter */}
            <div className="relative flex items-center">
              <Briefcase className="w-4 h-4 text-purple-500 absolute left-3" />
              <select
                value={selectedWorkMode}
                onChange={(e) => setSelectedWorkMode(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              >
                <option value="Todos">Modelo: Todos</option>
                <option value="Presencial">Presencial</option>
                <option value="Híbrido">Híbrido</option>
                <option value="Remoto">Remoto</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 💼 Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Jobs List (Left Column) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Vagas Disponíveis ({filteredJobs.length})
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Atualizado em tempo real</span>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-2xs">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">Nenhuma vaga encontrada</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Não foram encontradas vagas com os filtros selecionados. Tente redefinir a busca.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDepartment('Todos');
                    setSelectedCity('Todas');
                    setSelectedWorkMode('Todos');
                    setSelectedContractType('Todos');
                  }}
                  className="mt-4 px-4 py-2 bg-purple-50 text-purple-700 text-xs font-bold rounded-xl hover:bg-purple-100 transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                return (
                  <div
                    key={job.id}
                    onClick={() => {
                      setSelectedJob(job);
                      setIsApplying(false);
                    }}
                    className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-purple-600 ring-2 ring-purple-500/20 shadow-md bg-purple-50/10' 
                        : 'border-slate-200 hover:border-purple-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        {job.featured && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 mb-2">
                            ★ Vaga em Destaque
                          </span>
                        )}
                        <h4 className="text-base font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors">
                          {job.title}
                        </h4>
                        <p className="text-xs font-semibold text-purple-700 flex items-center gap-2 mt-1">
                          <Building2 className="w-3.5 h-3.5 text-purple-600" />
                          {job.companyName}
                          <span>•</span>
                          <span className="text-slate-500">{job.department}</span>
                        </p>
                      </div>
                      <span className="text-xs font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                        {job.code}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md font-semibold text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-purple-600" />
                        {job.location}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md font-semibold text-slate-700">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                        {job.workMode} ({job.contractType})
                      </span>
                      {job.salaryRange && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-md border border-emerald-200">
                          {job.salaryRange}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Publicado em {job.publishedAt}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedJob(job);
                          setIsApplying(true);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                      >
                        Candidatar-se
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Job Details & Application Form Panel (Right Column) */}
          <div className="lg:col-span-5">
            {selectedJob ? (
              <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-md sticky top-24 space-y-5">
                {/* Header of selected job */}
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                        {selectedJob.department}
                      </span>
                      <h3 className="text-xl font-black text-slate-900 mt-2.5">{selectedJob.title}</h3>
                      <p className="text-xs font-semibold text-slate-600 mt-0.5">{selectedJob.companyName}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedJob(null);
                        setIsApplying(false);
                      }}
                      className="text-slate-400 hover:text-slate-600 p-1"
                      title="Fechar detalhes"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[11px] font-medium">Localidade</span>
                      <span className="font-bold text-slate-800">{selectedJob.location}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[11px] font-medium">Regime & Modelo</span>
                      <span className="font-bold text-slate-800">{selectedJob.contractType} ({selectedJob.workMode})</span>
                    </div>
                  </div>
                </div>

                {!isApplying ? (
                  <>
                    <div className="space-y-4 text-xs text-slate-700 leading-relaxed max-h-[380px] overflow-y-auto pr-1">
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1 text-xs uppercase tracking-wider text-purple-800">
                          Sobre a Vaga
                        </h4>
                        <p>{selectedJob.description}</p>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 mb-2 text-xs uppercase tracking-wider text-purple-800">
                          Requisitos e Qualificações
                        </h4>
                        <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                          {selectedJob.requirements.map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 mb-2 text-xs uppercase tracking-wider text-purple-800">
                          Benefícios Oferecidos
                        </h4>
                        <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                          {selectedJob.benefits.map((ben, idx) => (
                            <li key={idx}>{ben}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsApplying(true)}
                      className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      Candidatar-se para esta Vaga
                    </button>
                  </>
                ) : (
                  /* 📋 Formulário / Página de Inscrição Simples */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        Inscrição de Candidato
                      </h4>
                      <button
                        onClick={() => setIsApplying(false)}
                        className="text-xs text-purple-600 hover:underline font-bold"
                      >
                        Ver Detalhes
                      </button>
                    </div>

                    {submittedSuccess ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3 animate-fade-in">
                        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                        <h5 className="font-extrabold text-emerald-950 text-lg">Candidatura Enviada!</h5>
                        <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                          Seu currículo foi cadastrado com sucesso no Banco de Talentos do MAIS RH e associado à vaga <strong className="text-emerald-950">{selectedJob.title}</strong>.
                        </p>
                        <p className="text-[11px] text-emerald-700">
                          Acompanhe as atualizações do processo pelo seu e-mail cadastrado.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleApplySubmit} className="space-y-3">
                        {/* Nome Completo */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Nome Completo *
                          </label>
                          <div className="relative flex items-center">
                            <User className="w-4 h-4 text-slate-400 absolute left-2.5" />
                            <input
                              type="text"
                              required
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="Ex: João Silva Santos"
                              className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium"
                            />
                          </div>
                        </div>

                        {/* Email & Telefone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">E-mail *</label>
                            <div className="relative flex items-center">
                              <Mail className="w-4 h-4 text-slate-400 absolute left-2.5" />
                              <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Telefone / WhatsApp *</label>
                            <div className="relative flex items-center">
                              <Phone className="w-4 h-4 text-slate-400 absolute left-2.5" />
                              <input
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="(11) 99999-9999"
                                className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Cidade/UF & Pretensão Salarial */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Cidade / Estado *</label>
                            <div className="relative flex items-center">
                              <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5" />
                              <input
                                type="text"
                                required
                                value={cityState}
                                onChange={(e) => setCityState(e.target.value)}
                                placeholder="São Paulo, SP"
                                className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Pretensão Salarial</label>
                            <div className="relative flex items-center">
                              <DollarSign className="w-4 h-4 text-slate-400 absolute left-2.5" />
                              <input
                                type="text"
                                value={salaryExpectation}
                                onChange={(e) => setSalaryExpectation(e.target.value)}
                                placeholder="R$ 6.000 / A combinar"
                                className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium"
                              />
                            </div>
                          </div>
                        </div>

                        {/* LinkedIn & PCD */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn (Opcional)</label>
                            <div className="relative flex items-center">
                              <Linkedin className="w-4 h-4 text-slate-400 absolute left-2.5" />
                              <input
                                type="url"
                                value={linkedinUrl}
                                onChange={(e) => setLinkedinUrl(e.target.value)}
                                placeholder="https://linkedin.com/in/..."
                                className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium"
                              />
                            </div>
                          </div>
                          <div className="flex items-center pt-5">
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                              <input
                                type="checkbox"
                                checked={isPne}
                                onChange={(e) => setIsPne(e.target.checked)}
                                className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                              />
                              <HeartHandshake className="w-4 h-4 text-purple-600" />
                              Vaga Inclusiva (PCD / PNE)
                            </label>
                          </div>
                        </div>

                        {/* Upload do Currículo */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Anexar Currículo (PDF, DOC, DOCX) *</label>
                          <div className="border-2 border-dashed border-purple-200 hover:border-purple-400 rounded-2xl p-3.5 text-center transition-colors bg-purple-50/30">
                            <Upload className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                              className="hidden"
                              id="public-resume-file"
                            />
                            <label htmlFor="public-resume-file" className="cursor-pointer text-xs text-purple-700 font-extrabold block">
                              {resumeFile ? resumeFile.name : 'Clique para selecionar seu currículo'}
                            </label>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Formatos aceitos: PDF, DOC, DOCX (até 10MB)</span>
                          </div>
                        </div>

                        {/* Carta de Apresentação / Resumo */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Carta de Apresentação / Resumo Profissional</label>
                          <textarea
                            rows={2}
                            value={coverNote}
                            onChange={(e) => setCoverNote(e.target.value)}
                            placeholder="Resuma brevemente sua trajetória e o que você busca na vaga..."
                            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                          Confirmar Inscrição
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center sticky top-24">
                <Briefcase className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800">Selecione uma vaga</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Clique em qualquer uma das vagas ao lado para conferir os detalhes do cargo e realizar sua candidatura.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* 📌 Rodapé / Footer Corporativo */}
      <footer className="bg-white border-t border-slate-200 py-10 mt-12 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                M
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-sm">Grupo MAIS RH Brasil</span>
                <p className="text-[11px] text-slate-500">Soluções Estratégicas em Gestão de Pessoas & Seleção</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-600 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Processos seletivos em conformidade com a LGPD (Lei nº 13.709/2018)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <p>© 2026 Grupo MAIS RH Brasil. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4">
              <span className="hover:underline cursor-pointer">Política de Privacidade</span>
              <span>•</span>
              <span className="hover:underline cursor-pointer">Termos de Uso</span>
              <span>•</span>
              <span className="hover:underline cursor-pointer">Atendimento ao Candidato</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

