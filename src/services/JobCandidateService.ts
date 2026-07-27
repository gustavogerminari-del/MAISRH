import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { AuditService } from './AuditService';

export interface InterviewData {
  id?: string;
  type: 'Presencial' | 'Online' | 'Telefone';
  date: string;
  time: string;
  interviewer: string;
  location?: string;
  meetingLink?: string;
  notes?: string;
  status?: 'Agendada' | 'Realizada' | 'Cancelada';
}

export interface EvaluationData {
  id: string;
  technicalScore: number; // 1-5
  communicationScore: number; // 1-5
  postureScore: number; // 1-5
  knowledgeScore: number; // 1-5
  notes: string;
  finalOpinion: 'Aprovado' | 'Reprovado' | 'Em Dúvida' | 'Pendente';
  evaluatedBy: string;
  evaluatedAt: string;
}

export interface AIAnalysisData {
  summary: string;
  strengths: string[];
  pointsOfAttention: string[];
  competencies: string[];
  behavioralAnalysis: string;
  interviewSuggestions: string[];
  score: number; // 0-100
  recommendation: 'Altamente Recomendado' | 'Recomendado' | 'Recomendado com Ressalvas' | 'Não Recomendado';
}

export interface HistoryEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  by?: string;
}

export type ApplicationStatus = 
  | 'Novos' 
  | 'Triagem IA' 
  | 'Em Análise RH' 
  | 'Entrevista Agendada' 
  | 'Entrevista Realizada' 
  | 'Aprovado' 
  | 'Contratado' 
  | 'Reprovado';

export interface JobCandidateApplication {
  id: string;
  companyId: string;
  jobId: string;
  candidateId: string;
  name: string;
  cpf?: string;
  photo?: string;
  email: string;
  phone: string;
  role: string;
  city: string;
  state: string;
  appliedDate: string;
  status: ApplicationStatus;
  
  // Filtering fields
  education: string;
  course?: string;
  experienceYears: number;
  salaryExpectation: string;
  availability: string;
  isPCD: boolean;
  resumeUrl?: string;
  resumeKeywords?: string[];

  // IA Compatibility
  compatibilityScore: number;
  compatibilityLevel: 'Muito compatível' | 'Compatível' | 'Baixa compatibilidade';

  // Profile details
  objective?: string;
  experiences?: { company: string; role: string; period: string; description: string }[];
  educationDetails?: { institution: string; degree: string; year: string }[];
  
  // Sub-objects
  aiAnalysis?: AIAnalysisData;
  interview?: InterviewData;
  evaluations?: EvaluationData[];
  timeline?: HistoryEvent[];
  notes?: string[];

  createdAt: string;
  updatedAt: string;
}

const COLLECTION_NAME = 'candidate_applications';

export class JobCandidateService {
  static async listByJob(jobId: string, companyId?: string): Promise<JobCandidateApplication[]> {
    try {
      const q = companyId 
        ? query(collection(db, COLLECTION_NAME), where('jobId', '==', jobId), where('companyId', '==', companyId))
        : query(collection(db, COLLECTION_NAME), where('jobId', '==', jobId));
      
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list: JobCandidateApplication[] = [];
        snap.forEach(d => list.push(d.data() as JobCandidateApplication));
        return list;
      }
    } catch (err) {
      console.warn('Erro ao buscar candidaturas por vaga no Firestore:', err);
    }

    // Seed initial candidate applications for this job into Firestore
    return this.seedApplicationsForJob(jobId, companyId || 'emp-001');
  }

  static async getById(id: string): Promise<JobCandidateApplication | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION_NAME, id));
      if (snap.exists()) {
        return snap.data() as JobCandidateApplication;
      }
    } catch (err) {
      console.warn('Erro ao buscar candidatura por ID no Firestore:', err);
    }
    return null;
  }

  static async create(appData: Partial<JobCandidateApplication> & { jobId: string; companyId?: string }): Promise<JobCandidateApplication> {
    const id = appData.id || `app-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const user = auth.currentUser;
    const now = new Date().toISOString();
    const companyId = appData.companyId || 'emp-001';

    const newApp: JobCandidateApplication = {
      id,
      companyId,
      jobId: appData.jobId,
      candidateId: appData.candidateId || `cand-${Date.now()}`,
      name: appData.name || 'Candidato Sem Nome',
      cpf: appData.cpf || '123.456.789-00',
      photo: appData.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      email: appData.email || 'candidato@email.com',
      phone: appData.phone || '(11) 99888-7766',
      role: appData.role || 'Profissional',
      city: appData.city || 'São Paulo',
      state: appData.state || 'SP',
      appliedDate: appData.appliedDate || new Date().toISOString().split('T')[0],
      status: appData.status || 'Novos',
      education: appData.education || 'Superior Completo',
      course: appData.course || 'Ciência da Computação',
      experienceYears: appData.experienceYears || 3,
      salaryExpectation: appData.salaryExpectation || 'R$ 8.000',
      availability: appData.availability || 'Imediata',
      isPCD: appData.isPCD || false,
      resumeUrl: appData.resumeUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      resumeKeywords: appData.resumeKeywords || ['React', 'TypeScript', 'Node.js'],
      compatibilityScore: appData.compatibilityScore || 85,
      compatibilityLevel: appData.compatibilityLevel || 'Muito compatível',
      objective: appData.objective || 'Atuar no desenvolvimento e arquitetura de sistemas corporativos.',
      experiences: appData.experiences || [
        {
          company: 'Tech Solutions Ltda',
          role: 'Desenvolvedor Pleno',
          period: '2022 - Atual',
          description: 'Desenvolvimento de APIs REST, interfaces React e integrações com banco de dados.'
        }
      ],
      educationDetails: appData.educationDetails || [
        {
          institution: 'Universidade de São Paulo (USP)',
          degree: 'Bacharelado em Engenharia de Software',
          year: '2018 - 2022'
        }
      ],
      aiAnalysis: appData.aiAnalysis || {
        summary: 'Candidato possui excelente bagagem técnica e ótimo alinhamento com os requisitos da vaga.',
        strengths: ['Domínio avançado de React/TypeScript', 'Boa comunicação interpessoal', 'Proatividade em resolução de problemas'],
        pointsOfAttention: ['Necessita de alinhamento sobre pretensão salarial exata'],
        competencies: ['React', 'TypeScript', 'Node.js', 'Clean Architecture', 'Git', 'Agile'],
        behavioralAnalysis: 'Perfil analítico, voltado para resultados, colaborativo em equipe.',
        interviewSuggestions: [
          'Pedir detalhes de arquitetura de software em seu projeto mais recente.',
          'Avaliar experiência prévia com metodologias ágeis em times multinacionais.'
        ],
        score: 88,
        recommendation: 'Altamente Recomendado'
      },
      interview: appData.interview,
      evaluations: appData.evaluations || [],
      timeline: appData.timeline || [
        {
          id: `evt-${Date.now()}`,
          title: 'Candidatura Recebida',
          description: 'Candidato aplicou para a vaga via portal de vagas.',
          date: new Date().toISOString().replace('T', ' ').substring(0, 16)
        }
      ],
      notes: appData.notes || [],
      createdAt: now,
      updatedAt: now
    };

    try {
      await setDoc(doc(db, COLLECTION_NAME, id), newApp, { merge: true });
      await AuditService.log({
        action: 'CREATE',
        description: `Candidatura de ${newApp.name} criada para a vaga ${newApp.jobId}`,
        moduleName: 'Recrutamento',
        targetEntity: 'Candidatura',
        companyId
      });
    } catch (err) {
      console.warn('Erro ao salvar candidatura no Firestore:', err);
    }

    return newApp;
  }

  static async updateStatus(id: string, status: ApplicationStatus, notes?: string): Promise<void> {
    try {
      const existing = await this.getById(id);
      if (!existing) return;

      const now = new Date().toISOString();
      const updatedTimeline = [
        ...(existing.timeline || []),
        {
          id: `evt-${Date.now()}`,
          title: `Status alterado para: ${status}`,
          description: notes || `Mudança de etapa no processo seletivo para ${status}.`,
          date: now.replace('T', ' ').substring(0, 16),
          by: auth.currentUser?.displayName || 'Recrutador RH'
        }
      ];

      await setDoc(doc(db, COLLECTION_NAME, id), {
        status,
        timeline: updatedTimeline,
        updatedAt: now
      }, { merge: true });

      await AuditService.log({
        action: 'UPDATE',
        description: `Status da candidatura ${id} alterado para ${status}`,
        moduleName: 'Recrutamento',
        targetEntity: 'Candidatura'
      });
    } catch (err) {
      console.warn('Erro ao atualizar status da candidatura no Firestore:', err);
    }
  }

  static async scheduleInterview(id: string, interview: InterviewData): Promise<void> {
    try {
      const existing = await this.getById(id);
      if (!existing) return;

      const now = new Date().toISOString();
      const interviewObj: InterviewData = {
        ...interview,
        status: 'Agendada'
      };

      const updatedTimeline = [
        ...(existing.timeline || []),
        {
          id: `evt-${Date.now()}`,
          title: 'Entrevista Agendada',
          description: `Entrevista ${interview.type} agendada para ${interview.date} às ${interview.time} com ${interview.interviewer}.`,
          date: now.replace('T', ' ').substring(0, 16),
          by: auth.currentUser?.displayName || 'Recrutador RH'
        }
      ];

      await setDoc(doc(db, COLLECTION_NAME, id), {
        status: 'Entrevista Agendada',
        interview: interviewObj,
        timeline: updatedTimeline,
        updatedAt: now
      }, { merge: true });

      await AuditService.log({
        action: 'UPDATE',
        description: `Entrevista agendada para o candidato ${existing.name}`,
        moduleName: 'Recrutamento',
        targetEntity: 'Entrevista'
      });
    } catch (err) {
      console.warn('Erro ao agendar entrevista no Firestore:', err);
    }
  }

  static async addEvaluation(id: string, evaluation: Omit<EvaluationData, 'id' | 'evaluatedAt' | 'evaluatedBy'>): Promise<void> {
    try {
      const existing = await this.getById(id);
      if (!existing) return;

      const user = auth.currentUser;
      const now = new Date().toISOString();
      const evalObj: EvaluationData = {
        ...evaluation,
        id: `eval-${Date.now()}`,
        evaluatedBy: user?.displayName || 'Avaliador RH',
        evaluatedAt: now.replace('T', ' ').substring(0, 16)
      };

      const updatedEvaluations = [...(existing.evaluations || []), evalObj];
      const updatedTimeline = [
        ...(existing.timeline || []),
        {
          id: `evt-${Date.now()}`,
          title: 'Avaliação Registrada',
          description: `Parecer final: ${evaluation.finalOpinion}. Obs: ${evaluation.notes || 'Sem observações'}.`,
          date: now.replace('T', ' ').substring(0, 16),
          by: user?.displayName || 'Avaliador RH'
        }
      ];

      await setDoc(doc(db, COLLECTION_NAME, id), {
        evaluations: updatedEvaluations,
        timeline: updatedTimeline,
        updatedAt: now
      }, { merge: true });

      await AuditService.log({
        action: 'UPDATE',
        description: `Nova avaliação adicionada para a candidatura ${id}`,
        moduleName: 'Recrutamento',
        targetEntity: 'Avaliação'
      });
    } catch (err) {
      console.warn('Erro ao adicionar avaliação no Firestore:', err);
    }
  }

  static async addNote(id: string, note: string): Promise<void> {
    try {
      const existing = await this.getById(id);
      if (!existing) return;

      const now = new Date().toISOString();
      const formattedNote = `[${now.replace('T', ' ').substring(0, 16)}] ${auth.currentUser?.displayName || 'RH'}: ${note}`;
      const updatedNotes = [...(existing.notes || []), formattedNote];

      await setDoc(doc(db, COLLECTION_NAME, id), {
        notes: updatedNotes,
        updatedAt: now
      }, { merge: true });
    } catch (err) {
      console.warn('Erro ao adicionar nota no Firestore:', err);
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      await AuditService.log({
        action: 'DELETE',
        description: `Candidatura ${id} excluída do Firestore`,
        moduleName: 'Recrutamento',
        targetEntity: 'Candidatura'
      });
    } catch (err) {
      console.warn('Erro ao excluir candidatura no Firestore:', err);
    }
  }

  private static async seedApplicationsForJob(jobId: string, companyId: string): Promise<JobCandidateApplication[]> {
    const defaultCandidates: Partial<JobCandidateApplication>[] = [
      {
        id: `app-${jobId}-1`,
        jobId,
        companyId,
        candidateId: 'cand-001',
        name: 'Fernanda Oliveira Lima',
        cpf: '342.119.820-41',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        email: 'fernanda.oliveira@email.com',
        phone: '(11) 98765-4321',
        role: 'Desenvolvedora Senior Frontend',
        city: 'São Paulo',
        state: 'SP',
        appliedDate: '2026-07-20',
        status: 'Triagem IA',
        education: 'Pós-Graduação',
        course: 'Engenharia de Software',
        experienceYears: 6,
        salaryExpectation: 'R$ 14.000',
        availability: 'Imediata',
        isPCD: false,
        compatibilityScore: 95,
        compatibilityLevel: 'Muito compatível',
        resumeKeywords: ['React', 'TypeScript', 'Vite', 'Tailwind', 'Clean Architecture', 'Jest', 'GraphQL'],
        objective: 'Atuar no desenvolvimento de sistemas web escaláveis e liderança técnica de projetos frontend.',
        experiences: [
          { company: 'Tech Global Brasil', role: 'Dev Senior React', period: '2022 - Atual', description: 'Arquitetura de micro-frontends em React e TypeScript para plataforma de pagamentos.' },
          { company: 'SoftInova', role: 'Dev Pleno Frontend', period: '2019 - 2022', description: 'Desenvolvimento de componentes reutilizáveis, testes unitários e CI/CD.' }
        ],
        educationDetails: [
          { institution: 'FIAP', degree: 'Pós-Graduação em Arquitetura de Software', year: '2022 - 2023' },
          { institution: 'USP', degree: 'Bacharelado em Ciência da Computação', year: '2015 - 2019' }
        ],
        aiAnalysis: {
          summary: 'Candidata com forte aderência técnica em React e TypeScript, excelente histórico acadêmico e liderança técnica prévia.',
          strengths: ['Domínio de arquiteturas modernas de frontend', 'Pós-graduação na área', 'Disponibilidade de início imediata'],
          pointsOfAttention: ['Pretensão salarial próxima ao teto da vaga, negociável'],
          competencies: ['React 18', 'TypeScript', 'Tailwind CSS', 'GraphQL', 'Jest', 'CI/CD'],
          behavioralAnalysis: 'Comunicação fluida, perfil analítico e facilidade em trabalhar com equipes multidisciplinares.',
          interviewSuggestions: [
            'Avaliar decisões de arquitetura tomada no último projeto.',
            'Perguntar sobre testes automatizados e gestão de estado.'
          ],
          score: 95,
          recommendation: 'Altamente Recomendado'
        }
      },
      {
        id: `app-${jobId}-2`,
        jobId,
        companyId,
        candidateId: 'cand-002',
        name: 'Carlos Eduardo Santos',
        cpf: '219.882.311-90',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        email: 'carlos.santos@email.com',
        phone: '(21) 97123-8899',
        role: 'Desenvolvedor Fullstack',
        city: 'Rio de Janeiro',
        state: 'RJ',
        appliedDate: '2026-07-22',
        status: 'Em Análise RH',
        education: 'Superior Completo',
        course: 'Sistemas de Informação',
        experienceYears: 4,
        salaryExpectation: 'R$ 11.500',
        availability: '15 dias',
        isPCD: false,
        compatibilityScore: 78,
        compatibilityLevel: 'Compatível',
        resumeKeywords: ['React', 'Node.js', 'Express', 'TypeScript', 'PostgreSQL', 'Docker'],
        objective: 'Desenvolver produtos de alto impacto integrando frontend e backend.',
        experiences: [
          { company: 'Nexus Digital', role: 'Desenvolvedor Fullstack', period: '2021 - Atual', description: 'Construção de aplicações Node.js e React para o setor financeiro.' }
        ],
        educationDetails: [
          { institution: 'UFRJ', degree: 'Sistemas de Informação', year: '2017 - 2021' }
        ],
        aiAnalysis: {
          summary: 'Perfil versátil com sólida experiência fullstack e boa base em React e APIs Node.js.',
          strengths: ['Experiência fullstack consistente', 'Boa capacidade de resolução de problemas'],
          pointsOfAttention: ['Atuação mais focada em backend nos últimos meses'],
          competencies: ['React', 'Node.js', 'TypeScript', 'Express', 'Docker'],
          behavioralAnalysis: 'Pragmático, focado em entregas e aprendizado contínuo.',
          interviewSuggestions: ['Avaliar profundidade técnica no ecossistema React/Vite.'],
          score: 78,
          recommendation: 'Recomendado'
        }
      },
      {
        id: `app-${jobId}-3`,
        jobId,
        companyId,
        candidateId: 'cand-003',
        name: 'Juliana Beatriz Mendes',
        cpf: '109.283.744-12',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        email: 'juliana.mendes@email.com',
        phone: '(31) 98822-1100',
        role: 'Engenheira de Frontend',
        city: 'Belo Horizonte',
        state: 'MG',
        appliedDate: '2026-07-18',
        status: 'Entrevista Agendada',
        education: 'Superior Completo',
        course: 'Ciência da Computação',
        experienceYears: 5,
        salaryExpectation: 'R$ 13.000',
        availability: 'Imediata',
        isPCD: false,
        compatibilityScore: 92,
        compatibilityLevel: 'Muito compatível',
        resumeKeywords: ['React', 'TypeScript', 'Redux', 'Performance Web', 'Tailwind'],
        interview: {
          type: 'Online',
          date: '2026-07-29',
          time: '14:30',
          interviewer: 'Carla Dias (RH)',
          meetingLink: 'https://meet.google.com/rh-entrevista-juliana',
          notes: 'Aprofundar em casos de otimização de performance e liderança técnica.',
          status: 'Agendada'
        },
        aiAnalysis: {
          summary: 'Excelente perfil técnico com forte destaque para otimização de performance e testes.',
          strengths: ['Alta pontuação técnica', 'Atuação com times ágeis de grande porte'],
          pointsOfAttention: ['Reside em MG mas está disponível para modelo remoto ou híbrido'],
          competencies: ['React', 'TypeScript', 'Tailwind', 'Next.js', 'Micro-frontends'],
          behavioralAnalysis: 'Excelente articulação verbal e clareza técnica nas explicações.',
          interviewSuggestions: ['Discutir disponibilidade para viagens ocasionais à matriz.'],
          score: 92,
          recommendation: 'Altamente Recomendado'
        }
      },
      {
        id: `app-${jobId}-4`,
        jobId,
        companyId,
        candidateId: 'cand-004',
        name: 'Lucas Gabriel Pereira',
        cpf: '450.192.831-02',
        photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
        email: 'lucas.pereira@email.com',
        phone: '(41) 99111-2233',
        role: 'Desenvolvedor Frontend Pleno',
        city: 'Curitiba',
        state: 'PR',
        appliedDate: '2026-07-25',
        status: 'Novos',
        education: 'Superior Incompleto',
        course: 'Análise e Desenvolvimento de Sistemas',
        experienceYears: 2,
        salaryExpectation: 'R$ 7.500',
        availability: '30 dias',
        isPCD: true,
        compatibilityScore: 58,
        compatibilityLevel: 'Baixa compatibilidade',
        resumeKeywords: ['JavaScript', 'Vue.js', 'HTML/CSS', 'Bootstrap'],
        aiAnalysis: {
          summary: 'Candidato com maior vivência em Vue.js e JavaScript vanilla; pouca vivência declarada em TypeScript avançado.',
          strengths: ['PCD, cumpre cota com excelente vontade de desenvolvimento', 'Boa base visual'],
          pointsOfAttention: ['Requer treinamento complementar em TypeScript e React 18'],
          competencies: ['JavaScript', 'Vue.js', 'CSS3', 'Git'],
          behavioralAnalysis: 'Empolgado, comunicativo e motivado a migrar para o ecossistema React.',
          interviewSuggestions: ['Avaliar curva de aprendizado para migrar de Vue para React.'],
          score: 58,
          recommendation: 'Recomendado com Ressalvas'
        }
      },
      {
        id: `app-${jobId}-5`,
        jobId,
        companyId,
        candidateId: 'cand-005',
        name: 'Aline Barbosa Castro',
        cpf: '512.930.128-66',
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        email: 'aline.castro@email.com',
        phone: '(19) 98122-3344',
        role: 'Líder Técnica Frontend',
        city: 'Campinas',
        state: 'SP',
        appliedDate: '2026-07-15',
        status: 'Contratado',
        education: 'Mestrado',
        course: 'Ciência da Computação',
        experienceYears: 8,
        salaryExpectation: 'R$ 15.000',
        availability: 'Imediata',
        isPCD: false,
        compatibilityScore: 98,
        compatibilityLevel: 'Muito compatível',
        aiAnalysis: {
          summary: 'Perfil brilhante, aprovada por unanimidade na banca técnica e de cultura.',
          strengths: ['Mestrado', '8 anos de bagagem sólida', 'Aprovada no teste de cultura'],
          pointsOfAttention: ['Nenhum ponto crítico de atenção'],
          competencies: ['React', 'TypeScript', 'Node', 'System Design', 'Team Leadership'],
          behavioralAnalysis: 'Liderança natural, empatia e alta capacidade estratégica.',
          interviewSuggestions: ['Encaminhada para Onboarding'],
          score: 98,
          recommendation: 'Altamente Recomendado'
        }
      }
    ];

    const seeded: JobCandidateApplication[] = [];
    for (const item of defaultCandidates) {
      const created = await this.create(item as any);
      seeded.push(created);
    }
    return seeded;
  }
}
