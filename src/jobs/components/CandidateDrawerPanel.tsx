import React, { useState } from 'react';
import { 
  X, 
  User, 
  FileText, 
  Sparkles, 
  Calendar, 
  Award, 
  History, 
  Phone, 
  Mail, 
  MessageCircle, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Share2, 
  ThumbsUp, 
  ThumbsDown, 
  Star, 
  Video, 
  Plus,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { 
  JobCandidateApplication, 
  ApplicationStatus, 
  JobCandidateService, 
  EvaluationData 
} from '../../services/JobCandidateService';
import { Button } from '../../shared';
import { ScheduleInterviewModal } from './ScheduleInterviewModal';
import { enviarCandidatoParaAdmissaoDP } from '../../departamento-pessoal/services/dpFirestoreService';

interface CandidateDrawerPanelProps {
  candidate: JobCandidateApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => Promise<void>;
  jobTitle?: string;
}

export const CandidateDrawerPanel: React.FC<CandidateDrawerPanelProps> = ({
  candidate,
  isOpen,
  onClose,
  onRefresh,
  jobTitle,
}) => {
  if (!isOpen || !candidate) return null;

  const [activeTab, setActiveTab] = useState<'perfil' | 'curriculo' | 'ia' | 'entrevistas' | 'avaliacoes' | 'historico'>('perfil');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // New evaluation form state
  const [techScore, setTechScore] = useState(4);
  const [commScore, setCommScore] = useState(4);
  const [postureScore, setPostureScore] = useState(4);
  const [knowScore, setKnowScore] = useState(4);
  const [evalNotes, setEvalNotes] = useState('');
  const [finalOpinion, setFinalOpinion] = useState<'Aprovado' | 'Reprovado' | 'Em Dúvida'>('Aprovado');
  const [savingEval, setSavingEval] = useState(false);

  const cleanPhone = candidate.phone.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(`Olá ${candidate.name}, vi seu perfil no MAIS RH para a vaga de ${jobTitle || candidate.role}.`)}`;
  const emailUrl = `mailto:${candidate.email}?subject=${encodeURIComponent(`Oportunidade - ${jobTitle || candidate.role} (MAIS RH)`)}`;

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    await JobCandidateService.updateStatus(candidate.id, newStatus);
    if (newStatus === 'Contratado') {
      try {
        await enviarCandidatoParaAdmissaoDP({
          id: candidate.id,
          candidateId: candidate.candidateId || candidate.id,
          jobId: candidate.jobId,
          companyId: candidate.companyId,
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          cpf: candidate.cpf,
          role: jobTitle || candidate.role,
          vagaTitulo: jobTitle || candidate.role,
          department: candidate.department,
          salaryExpectation: candidate.salaryExpectation,
          city: candidate.city,
          state: candidate.state
        });
        alert(`🎉 Candidato(a) ${candidate.name} contratado(a) com sucesso! Enviado para a Fila de Admissão do DP.`);
      } catch (err) {
        console.error('Erro ao enviar para admissão DP:', err);
      }
    }
    await onRefresh();
  };

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEval(true);
    try {
      await JobCandidateService.addEvaluation(candidate.id, {
        technicalScore: techScore,
        communicationScore: commScore,
        postureScore: postureScore,
        knowledgeScore: knowScore,
        notes: evalNotes,
        finalOpinion
      });
      setEvalNotes('');
      await onRefresh();
    } catch (err) {
      console.error('Erro ao salvar avaliação:', err);
    } finally {
      setSavingEval(false);
    }
  };

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    setAddingNote(true);
    try {
      await JobCandidateService.addNote(candidate.id, newNoteText.trim());
      setNewNoteText('');
      await onRefresh();
    } catch (err) {
      console.error('Erro ao adicionar nota:', err);
    } finally {
      setAddingNote(false);
    }
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-2xs flex justify-end">
      <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/80 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pr-10">
            <div className="flex items-center gap-4">
              {(candidate.photo || candidate.avatar) ? (
                <img
                  src={candidate.photo || candidate.avatar}
                  alt={candidate.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-lg border-2 border-white shadow-md shrink-0">
                  {candidate.name ? candidate.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'C'}
                </div>
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900">{candidate.name}</h2>
                  <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${getStatusBadgeColor(candidate.status)}`}>
                    {candidate.status}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                  <span>{candidate.role}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5" />
                    {candidate.city}, {candidate.state}
                  </span>
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                  <span className="font-medium">Compatibilidade IA:</span>
                  <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    {candidate.compatibilityScore}% {candidate.compatibilityLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons in Drawer Header */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>

              <a
                href={emailUrl}
                className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                E-mail
              </a>

              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Calendar className="w-3.5 h-3.5" />
                Agendar Entrevista
              </button>

              <button
                onClick={() => handleStatusChange('Contratado')}
                className="px-3 py-1.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                Contratar
              </button>

              <button
                onClick={() => handleStatusChange('Reprovado')}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                Reprovar
              </button>
            </div>
          </div>

          {/* Drawer Navigation Tabs */}
          <div className="flex items-center gap-1 mt-6 border-b border-slate-200 -mb-6 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('perfil')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'perfil'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              Perfil
            </button>

            <button
              onClick={() => setActiveTab('curriculo')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'curriculo'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              Currículo
            </button>

            <button
              onClick={() => setActiveTab('ia')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'ia'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              Análise IA
            </button>

            <button
              onClick={() => setActiveTab('entrevistas')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'entrevistas'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Entrevistas
            </button>

            <button
              onClick={() => setActiveTab('avaliacoes')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'avaliacoes'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Award className="w-4 h-4" />
              Avaliações
            </button>

            <button
              onClick={() => setActiveTab('historico')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'historico'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              Histórico
            </button>
          </div>
        </div>

        {/* Drawer Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          
          {/* TAB 1: PERFIL */}
          {activeTab === 'perfil' && (
            <div className="space-y-6">
              {/* Contact & Personal Info Grid */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Dados de Contato & Informações Pessoais
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">E-mail</span>
                    <span className="font-bold text-slate-800">{candidate.email}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Telefone / WhatsApp</span>
                    <span className="font-bold text-slate-800">{candidate.phone}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Localização</span>
                    <span className="font-bold text-slate-800">{candidate.city}, {candidate.state}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">CPF</span>
                    <span className="font-bold text-slate-800">{candidate.cpf || '123.456.789-00'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Pretensão Salarial</span>
                    <span className="font-bold text-slate-800">{candidate.salaryExpectation}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Disponibilidade</span>
                    <span className="font-bold text-slate-800">{candidate.availability}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Escolaridade</span>
                    <span className="font-bold text-slate-800">{candidate.education} ({candidate.course || 'Geral'})</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Experiência</span>
                    <span className="font-bold text-slate-800">{candidate.experienceYears} anos na área</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">PCD (Pessoa c/ Deficiência)</span>
                    <span className="font-bold text-slate-800">{candidate.isPCD ? 'Sim' : 'Não'}</span>
                  </div>
                </div>
              </div>

              {/* Objetivo Profissional */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Objetivo Profissional
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {candidate.objective || 'Atuar no desenvolvimento de projetos estratégicos na área de atuação.'}
                </p>
              </div>

              {/* Experiências Profissionais */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Experiências Profissionais
                </h3>
                <div className="space-y-3">
                  {(candidate.experiences || []).map((exp, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-slate-900">{exp.role}</span>
                        <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {exp.period}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-indigo-600">{exp.company}</p>
                      <p className="text-xs text-slate-600 mt-1">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formação Acadêmica */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Formação Acadêmica
                </h3>
                <div className="space-y-3">
                  {(candidate.educationDetails || []).map((edu, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-slate-900">{edu.degree}</span>
                        <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {edu.year}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-600">{edu.institution}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CURRÍCULO */}
          {activeTab === 'curriculo' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Currículo Anexado</h3>
                  <p className="text-xs text-slate-500 font-medium">Documento oficial fornecido pelo candidato</p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={candidate.resumeUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Baixar PDF
                  </a>

                  <button
                    onClick={() => navigator.clipboard.writeText(candidate.resumeUrl || window.location.href)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Compartilhar
                  </button>
                </div>
              </div>

              {/* Styled Resume Preview */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-2xl font-black text-slate-900">{candidate.name}</h2>
                  <p className="text-xs font-bold text-indigo-600 mt-1">{candidate.role}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {candidate.city}, {candidate.state} • {candidate.phone} • {candidate.email}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Resumo Profissional</h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {candidate.objective} Profissional altamente qualificado com {candidate.experienceYears} anos de experiência sólida em projetos desafiadores e com forte foco em qualidade e entregas.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Histórico de Atuação</h4>
                  {(candidate.experiences || []).map((exp, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-900">
                        <span>{exp.role} — <span className="text-slate-600 font-semibold">{exp.company}</span></span>
                        <span className="text-slate-400 font-normal">{exp.period}</span>
                      </div>
                      <p className="text-xs text-slate-600">{exp.description}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Palavras-Chave do Currículo</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(candidate.resumeKeywords || ['React', 'TypeScript', 'Node.js', 'Clean Architecture']).map((kw, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-extrabold px-2.5 py-1 rounded-lg">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANÁLISE IA */}
          {activeTab === 'ia' && candidate.aiAnalysis && (
            <div className="space-y-6">
              {/* IA Score Banner */}
              <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-200 border border-purple-400/30 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-purple-300" /> Triagem & Matching Preditivo IA
                    </div>
                    <h3 className="text-xl font-black">{candidate.aiAnalysis.recommendation}</h3>
                    <p className="text-xs text-purple-200 max-w-md font-medium">
                      Análise gerada com base na compatibilidade entre os requisitos da vaga e o perfil do candidato.
                    </p>
                  </div>

                  <div className="text-center bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shrink-0">
                    <span className="text-3xl font-black tracking-tight">{candidate.aiAnalysis.score}%</span>
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-purple-200">
                      Score de Match
                    </span>
                  </div>
                </div>
              </div>

              {/* Resumo executivo da IA */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Resumo Executivo da IA</h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {candidate.aiAnalysis.summary}
                </p>
              </div>

              {/* Pontos Fortes e Pontos de Atenção Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Pontos Fortes
                  </h4>
                  <ul className="space-y-2">
                    {candidate.aiAnalysis.strengths.map((st, idx) => (
                      <li key={idx} className="text-xs text-emerald-900 font-medium flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        {st}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-100 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Pontos de Atenção
                  </h4>
                  <ul className="space-y-2">
                    {candidate.aiAnalysis.pointsOfAttention.map((pa, idx) => (
                      <li key={idx} className="text-xs text-amber-900 font-medium flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        {pa}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Competências Mapeadas */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Competências Mapeadas</h4>
                <div className="flex flex-wrap gap-2">
                  {candidate.aiAnalysis.competencies.map((comp, idx) => (
                    <span key={idx} className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-extrabold px-3 py-1 rounded-xl">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Análise Comportamental & Sugestões para Entrevista */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1">Análise Comportamental Preditiva</h4>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{candidate.aiAnalysis.behavioralAnalysis}</p>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">Perguntas Sugeridas para a Entrevista</h4>
                  <ul className="space-y-2">
                    {candidate.aiAnalysis.interviewSuggestions.map((sug, idx) => (
                      <li key={idx} className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-semibold flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        {sug}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Decision Buttons */}
              <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 flex items-center justify-between gap-2">
                <span className="text-xs font-black text-slate-700">Ação do Recrutador com base na Análise:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusChange('Em Análise RH')}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-extrabold shadow-2xs"
                  >
                    Aprovar Triagem
                  </button>
                  <button
                    onClick={() => handleStatusChange('Reprovado')}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-extrabold shadow-2xs"
                  >
                    Reprovar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ENTREVISTAS */}
          {activeTab === 'entrevistas' && (
            <div className="space-y-6">
              {candidate.interview ? (
                <div className="bg-white rounded-2xl p-6 border border-indigo-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                      <h3 className="text-sm font-black text-slate-900">Próxima Entrevista Agendada</h3>
                    </div>
                    <span className="text-xs font-extrabold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
                      {candidate.interview.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Data</span>
                      <span className="font-extrabold text-slate-800">{candidate.interview.date}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Horário</span>
                      <span className="font-extrabold text-slate-800">{candidate.interview.time}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Entrevistador</span>
                      <span className="font-extrabold text-slate-800">{candidate.interview.interviewer}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                      <span className="font-extrabold text-emerald-600">{candidate.interview.status || 'Agendada'}</span>
                    </div>
                  </div>

                  {candidate.interview.meetingLink && (
                    <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-bold text-indigo-900">
                        <Video className="w-4 h-4 text-indigo-600" />
                        <span>Link da Reunião:</span>
                        <a href={candidate.interview.meetingLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-700 truncate max-w-xs">
                          {candidate.interview.meetingLink}
                        </a>
                      </div>
                      <a href={candidate.interview.meetingLink} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 text-[11px] shrink-0">
                        Acessar Reunião
                      </a>
                    </div>
                  )}

                  {candidate.interview.notes && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-800 block mb-0.5">Pauta & Observações:</span>
                      {candidate.interview.notes}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => setIsScheduleModalOpen(true)}>
                      Reagendar Entrevista
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleStatusChange('Entrevista Realizada')}>
                      Finalizar Entrevista
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="text-sm font-extrabold text-slate-800">Nenhuma entrevista agendada ainda</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Agende uma reunião presencial, online ou por telefone com o candidato.
                  </p>
                  <Button variant="primary" size="sm" onClick={() => setIsScheduleModalOpen(true)}>
                    Agendar Entrevista Agora
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AVALIAÇÕES */}
          {activeTab === 'avaliacoes' && (
            <div className="space-y-6">
              {/* Avaliações registradas */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Avaliações Registradas ({candidate.evaluations?.length || 0})
                </h3>

                {(candidate.evaluations && candidate.evaluations.length > 0) ? (
                  candidate.evaluations.map((ev) => (
                    <div key={ev.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                        <span className="font-black text-slate-900">{ev.evaluatedBy}</span>
                        <span className="text-slate-400 text-[10px]">{ev.evaluatedAt}</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-2 bg-slate-50 rounded-xl text-center">
                          <span className="text-[10px] text-slate-400 block font-bold">Técnica</span>
                          <span className="font-black text-indigo-600">{ev.technicalScore}/5</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl text-center">
                          <span className="text-[10px] text-slate-400 block font-bold">Comunicação</span>
                          <span className="font-black text-indigo-600">{ev.communicationScore}/5</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl text-center">
                          <span className="text-[10px] text-slate-400 block font-bold">Postura</span>
                          <span className="font-black text-indigo-600">{ev.postureScore}/5</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl text-center">
                          <span className="text-[10px] text-slate-400 block font-bold">Conhecimento</span>
                          <span className="font-black text-indigo-600">{ev.knowledgeScore}/5</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">{ev.notes}</p>
                      
                      <div className="flex justify-end">
                        <span className={`text-xs font-black px-3 py-1 rounded-full ${
                          ev.finalOpinion === 'Aprovado' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          Parecer: {ev.finalOpinion}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Nenhuma avaliação cadastrada ainda.</p>
                )}
              </div>

              {/* Form de Nova Avaliação */}
              <form onSubmit={handleSaveEvaluation} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600" />
                  Nova Avaliação de Entrevista
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Nota Técnica (1-5)</label>
                    <select
                      value={techScore}
                      onChange={(e) => setTechScore(Number(e.target.value))}
                      className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200"
                    >
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Estrela(s)</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Comunicação (1-5)</label>
                    <select
                      value={commScore}
                      onChange={(e) => setCommScore(Number(e.target.value))}
                      className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200"
                    >
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Estrela(s)</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Postura (1-5)</label>
                    <select
                      value={postureScore}
                      onChange={(e) => setPostureScore(Number(e.target.value))}
                      className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200"
                    >
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Estrela(s)</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Conhecimento (1-5)</label>
                    <select
                      value={knowScore}
                      onChange={(e) => setKnowScore(Number(e.target.value))}
                      className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200"
                    >
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Estrela(s)</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Observações Gerais</label>
                  <textarea
                    value={evalNotes}
                    onChange={(e) => setEvalNotes(e.target.value)}
                    rows={3}
                    placeholder="Escriba os detalhes e impressões do candidato..."
                    className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">Parecer Final:</span>
                    <select
                      value={finalOpinion}
                      onChange={(e) => setFinalOpinion(e.target.value as any)}
                      className="text-xs font-bold p-2 rounded-xl border border-slate-200"
                    >
                      <option value="Aprovado">Aprovado</option>
                      <option value="Reprovado">Reprovado</option>
                      <option value="Em Dúvida">Em Dúvida</option>
                    </select>
                  </div>

                  <Button type="submit" variant="primary" size="sm" disabled={savingEval}>
                    {savingEval ? 'Salvando...' : 'Salvar Avaliação'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: HISTÓRICO */}
          {activeTab === 'historico' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Linha do Tempo da Candidatura
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {(candidate.timeline || []).map((evt) => (
                  <div key={evt.id} className="relative">
                    <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-100" />
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-900">{evt.title}</span>
                        <span className="text-[10px] font-bold text-slate-400">{evt.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{evt.description}</p>
                      {evt.by && <p className="text-[10px] text-slate-400 font-bold">Por: {evt.by}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Interview Scheduling Modal */}
      <ScheduleInterviewModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        candidateName={candidate.name}
        onSave={async (data) => {
          await JobCandidateService.scheduleInterview(candidate.id, data);
          await onRefresh();
        }}
        initialData={candidate.interview}
      />
    </div>
  );
};
