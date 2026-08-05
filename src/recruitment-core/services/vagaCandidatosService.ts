import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { sanitizeFirestoreData } from '../../lib/firestoreUtils';
import { UnifiedCandidate, ProcessStage, UnifiedInterview } from '../types/recruitment';

export interface CandidaturaDoc {
  id: string; // `${vagaId}_${candidateId}` or auto ID
  empresaId: string;
  vagaId: string;
  candidateId: string;
  status: 'Inscrito' | 'Em Análise' | 'Entrevista' | 'Aprovado' | 'Contratado' | 'Reprovado' | 'Desistiu';
  etapa: ProcessStage;
  matchIa?: number;
  triagemIaParecer?: string;
  origem?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateWithProcess extends UnifiedCandidate {
  candidaturaId?: string;
  etapaAtual: ProcessStage;
  dataCandidatura: string;
  dataAtualizacao?: string;
  origemCandidatura?: string;
  matchIaPercent?: number;
  cpf?: string;
  curso?: string;
  escolaridade?: string;
  empresaAnterior?: string;
  palavrasChaveCurriculo?: string[];
  pcd?: boolean;
  documentos?: Array<{ id: string; nome: string; tipo: string; url: string; dataUpload: string; status: 'Pendente' | 'Verificado' | 'Rejeitado' }>;
  anotacoes?: Array<{ id: string; autor: string; data: string; texto: string }>;
  avaliacoesRh?: Array<{ id: string; avaliador: string; data: string; notaGeral: number; notaTecnica: number; notaComportamental: number; parecer: string }>;
}

// Sample fallback candidates bound to a job ID for rich demo/first render
export function getSampleJobCandidates(vagaId: string, empresaId: string = 'emp-001'): CandidateWithProcess[] {
  return [
    {
      id: `cand-${vagaId}-1`,
      candidaturaId: `candproc-${vagaId}-1`,
      empresaId,
      nome: 'Ana Carolina Mendes',
      email: 'ana.mendes@email.com',
      telefone: '(11) 98765-4321',
      cpf: '321.654.987-00',
      fotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      cidade: 'São Paulo - SP',
      cargoAtual: 'Desenvolvedora Frontend Senior',
      cargoPretendido: 'Desenvolvedora Full Stack React',
      escolaridade: 'Superior Completo (Ciência da Computação)',
      curso: 'Ciência da Computação - USP',
      empresaAnterior: 'TechCorp Brasil',
      experienciaAnos: 6,
      pretensaoSalarial: 12500,
      competencias: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'GraphQL', 'Jest'],
      status: 'Em Processo',
      etapaAtual: 'Triagem',
      dataCandidatura: '2026-08-01 14:30',
      matchIaPercent: 94,
      triagemIaScore: 94,
      triagemIaParecer: 'Excelente aderência aos requisitos da vaga. Forte domínio de TypeScript e arquitetura React.',
      source: 'LinkedIn',
      origemCandidatura: 'LinkedIn Jobs',
      curriculoUrl: '#',
      curriculoTexto: 'Profissional com 6 anos de experiência em desenvolvimento web de alta escala com React e TypeScript...',
      pcd: false,
      rating: 5,
      anotacoes: [
        { id: 'n1', autor: 'Carolina RH', data: '2026-08-01 15:00', texto: 'Perfil muito forte. Agendar triagem técnica inicial.' }
      ],
      linhaDoTempo: [
        { data: '2026-08-01 14:30', titulo: 'Candidatou-se', detalhe: 'Inscrição realizada via LinkedIn Jobs' },
        { data: '2026-08-01 14:31', titulo: 'Currículo Enviado', detalhe: 'PDF processado no banco de talentos' },
        { data: '2026-08-01 14:35', titulo: 'Triagem IA Concluída', detalhe: 'Score de compatibilidade calculado: 94%' }
      ],
      documentos: [
        { id: 'doc-1', nome: 'Currículo_Ana_Mendes.pdf', tipo: 'Currículo', url: '#', dataUpload: '2026-08-01', status: 'Verificado' },
        { id: 'doc-2', nome: 'Diploma_USP_Ciencia_Computacao.pdf', tipo: 'Certificado', url: '#', dataUpload: '2026-08-01', status: 'Verificado' }
      ]
    },
    {
      id: `cand-${vagaId}-2`,
      candidaturaId: `candproc-${vagaId}-2`,
      empresaId,
      nome: 'Lucas Gabriel Oliveira',
      email: 'lucas.oliveira@techsolutions.com',
      telefone: '(11) 97123-8899',
      cpf: '456.789.123-11',
      fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      cidade: 'Campinas - SP',
      cargoAtual: 'Engenheiro de Software Pleno',
      cargoPretendido: 'Desenvolvedor Frontend / Full Stack',
      escolaridade: 'Pós-Graduação / MBA',
      curso: 'Engenharia de Software - UNICAMP',
      empresaAnterior: 'InovaSoft Sistemas',
      experienciaAnos: 4,
      pretensaoSalarial: 9800,
      competencias: ['React', 'JavaScript', 'Next.js', 'Express', 'PostgreSQL', 'Docker'],
      status: 'Em Processo',
      etapaAtual: 'Entrevista RH',
      dataCandidatura: '2026-07-30 09:15',
      matchIaPercent: 88,
      triagemIaScore: 88,
      triagemIaParecer: 'Boa bagagem em frameworks modernos. Boa fluência em testes automatizados.',
      source: 'Site Institucional',
      origemCandidatura: 'Portal de Vagas RL Connect',
      curriculoUrl: '#',
      pcd: false,
      rating: 4,
      anotacoes: [
        { id: 'n2', autor: 'Gestor Técnico', data: '2026-07-31 10:20', texto: 'Entrevista agendada para 03/08 às 14:00.' }
      ],
      linhaDoTempo: [
        { data: '2026-07-30 09:15', titulo: 'Candidatou-se', detalhe: 'Via Portal de Vagas' },
        { data: '2026-07-30 09:20', titulo: 'Triagem IA', detalhe: 'Score de compatibilidade: 88%' },
        { data: '2026-07-31 10:00', titulo: 'Mudança de Etapa', detalhe: 'Avançou para Entrevista RH' }
      ]
    },
    {
      id: `cand-${vagaId}-3`,
      candidaturaId: `candproc-${vagaId}-3`,
      empresaId,
      nome: 'Mariana Costa Rocha',
      email: 'mariana.rocha@designminds.com',
      telefone: '(21) 99876-1122',
      cpf: '123.456.789-22',
      fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      cidade: 'Rio de Janeiro - RJ',
      cargoAtual: 'UI/UX Designer & Frontend Specialist',
      cargoPretendido: 'UI/UX Developer',
      escolaridade: 'Superior Completo (Design Digital)',
      curso: 'Design Digital - PUC Rio',
      empresaAnterior: 'Minds Creative Studio',
      experienciaAnos: 5,
      pretensaoSalarial: 10500,
      competencias: ['Figma', 'UI/UX', 'Design System', 'HTML5', 'Tailwind', 'React UI'],
      status: 'Em Processo',
      etapaAtual: 'Inscrito',
      dataCandidatura: '2026-08-02 11:00',
      matchIaPercent: 82,
      triagemIaScore: 82,
      triagemIaParecer: 'Foco excelente em Design System e interfaces reativas.',
      source: 'Indicação',
      origemCandidatura: 'Indicação Interna',
      pcd: false,
      rating: 4,
      linhaDoTempo: [
        { data: '2026-08-02 11:00', titulo: 'Candidatou-se', detalhe: 'Indicação de funcionário interno' }
      ]
    },
    {
      id: `cand-${vagaId}-4`,
      candidaturaId: `candproc-${vagaId}-4`,
      empresaId,
      nome: 'Roberto Alves Santos',
      email: 'roberto.santos@devs.io',
      telefone: '(31) 98444-5566',
      cpf: '789.123.456-33',
      fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      cidade: 'Belo Horizonte - MG',
      cargoAtual: 'Desenvolvedor Full Stack',
      cargoPretendido: 'Tech Lead / Desenvolvedor Sênior',
      escolaridade: 'Mestrado',
      curso: 'Engenharia de Computação - UFMG',
      empresaAnterior: 'Sistemas Inteligentes SA',
      experienciaAnos: 8,
      pretensaoSalarial: 15000,
      competencias: ['Node.js', 'React', 'TypeScript', 'AWS', 'Microservices', 'Kubernetes'],
      status: 'Contratado',
      etapaAtual: 'Contratado',
      dataCandidatura: '2026-07-20 16:45',
      matchIaPercent: 97,
      triagemIaScore: 97,
      triagemIaParecer: 'Candidato de topo de funil com vasta vivência de liderança técnica.',
      source: 'Headhunter',
      origemCandidatura: 'Headhunter Exclusivo',
      pcd: false,
      rating: 5,
      linhaDoTempo: [
        { data: '2026-07-20 16:45', titulo: 'Candidatou-se', detalhe: 'Mapeado por Headhunter' },
        { data: '2026-07-22 14:00', titulo: 'Entrevista Realizada', detalhe: 'Aprovado pelo Gestor' },
        { data: '2026-07-28 11:30', titulo: 'Proposta Aceita', detalhe: 'Início programado para próxima segunda' },
        { data: '2026-08-01 09:00', titulo: 'Contratação Concluída', detalhe: 'Encaminhado para admissão DP' }
      ]
    },
    {
      id: `cand-${vagaId}-5`,
      candidaturaId: `candproc-${vagaId}-5`,
      empresaId,
      nome: 'Beatriz Lima Souza',
      email: 'beatriz.souza@email.com',
      telefone: '(41) 99111-2233',
      cpf: '234.567.890-44',
      fotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      cidade: 'Curitiba - PR',
      cargoAtual: 'Analista de QA / Testes',
      cargoPretendido: 'QA Engineer Automation',
      escolaridade: 'Superior Completo',
      curso: 'Sistemas de Informação - PUCPR',
      empresaAnterior: 'Quality Softwares',
      experienciaAnos: 3,
      pretensaoSalarial: 7200,
      competencias: ['Cypress', 'Playwright', 'Jest', 'Selenium', 'JavaScript', 'CI/CD'],
      status: 'Indisponível',
      etapaAtual: 'Reprovado',
      dataCandidatura: '2026-07-25 08:30',
      matchIaPercent: 62,
      triagemIaScore: 62,
      triagemIaParecer: 'Foco técnico em testes automatizados, porém com menos experiência em desenvolvimento frontend React puro.',
      source: 'LinkedIn',
      origemCandidatura: 'LinkedIn',
      pcd: true,
      rating: 3,
      linhaDoTempo: [
        { data: '2026-07-25 08:30', titulo: 'Candidatou-se', detalhe: 'Via LinkedIn' },
        { data: '2026-07-27 15:00', titulo: 'Feedback Enviado', detalhe: 'Perfil não atende requisito de senioridade em React' }
      ]
    }
  ];
}

export class VagaCandidatosService {
  /**
   * Realtime Listener for candidates subscribed to a specific job (`vagaId`).
   * Queries Firestore `candidaturas` where `vagaId == vagaId`.
   */
  static subscribeToVagaCandidates(
    vagaId: string, 
    empresaId: string, 
    callback: (candidates: CandidateWithProcess[]) => void
  ): () => void {
    const q = query(
      collection(db, 'candidaturas'),
      where('vagaId', '==', vagaId)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        callback([]);
        return;
      }

      const list: CandidateWithProcess[] = [];
      for (const docSnap of snapshot.docs) {
        const candData = docSnap.data() as CandidaturaDoc;
        const candidateId = candData.candidateId;

        // Fetch corresponding Candidate detail profile doc
        let candidateProfile: UnifiedCandidate | null = null;
        try {
          if (candidateId) {
            const profileRef = doc(db, 'candidatos', candidateId);
            const profileSnap = await getDoc(profileRef);
            if (profileSnap.exists()) {
              candidateProfile = profileSnap.data() as UnifiedCandidate;
            }
          }
        } catch (e) {
          console.warn('Erro ao carregar perfil do candidato:', e);
        }

        const combined: CandidateWithProcess = {
          id: candidateId || docSnap.id,
          candidaturaId: docSnap.id,
          empresaId: candData.empresaId || empresaId,
          nome: candidateProfile?.nome || (candidateProfile as any)?.name || (candData as any).name || (candData as any).nome || 'Candidato Sem Nome',
          email: candidateProfile?.email || (candData as any).email || 'email@exemplo.com',
          telefone: candidateProfile?.telefone || (candidateProfile as any)?.phone || (candData as any).phone || (candData as any).telefone || '(00) 00000-0000',
          fotoUrl: candidateProfile?.fotoUrl || candidateProfile?.avatar || (candData as any).photo || (candData as any).avatar,
          cidade: candidateProfile?.cidade || candidateProfile?.location || (candData as any).city || (candData as any).cidade || 'Não informada',
          cargoAtual: candidateProfile?.cargoAtual || candidateProfile?.role || (candData as any).role || 'Profissional',
          cargoPretendido: candidateProfile?.cargoPretendido || (candData as any).role || 'Vaga Aberta',
          escolaridade: candidateProfile?.escolaridade || (candData as any).education || 'Superior Completo',
          experienciaAnos: candidateProfile?.experienciaAnos || (candData as any).experienceYears || 3,
          pretensaoSalarial: candidateProfile?.pretensaoSalarial || (candData as any).salaryExpectation,
          competencias: candidateProfile?.competencias || [],
          status: candData.status === 'Contratado' ? 'Contratado' : candData.status === 'Reprovado' ? 'Indisponível' : 'Em Processo',
          etapaAtual: candData.etapa || (candData as any).status || 'Inscrito',
          dataCandidatura: candData.createdAt || (candData as any).appliedDate || new Date().toISOString(),
          matchIaPercent: candData.matchIa || candidateProfile?.matchIaPercent || (candData as any).compatibilityScore || 85,
          triagemIaScore: candData.matchIa || candidateProfile?.triagemIaScore || (candData as any).compatibilityScore || 85,
          triagemIaParecer: candData.triagemIaParecer || candidateProfile?.triagemIaParecer || 'Candidato qualificado.',
          source: (candData.origem as any) || candidateProfile?.source || 'Portal de Vagas',
          curriculoUrl: candidateProfile?.curriculoUrl || candidateProfile?.resumeUrl || (candData as any).resumeUrl || (candData as any).curriculoUrl,
          curriculoTexto: candidateProfile?.curriculoTexto,
          linhaDoTempo: candidateProfile?.linhaDoTempo || [
            { data: candData.createdAt || new Date().toISOString(), titulo: 'Candidatou-se', detalhe: 'Inscrição efetuada na vaga' }
          ],
          anotacoes: candidateProfile?.anotacoes || [],
          documentos: candidateProfile?.documentos || []
        };

        list.push(combined);
      }

      callback(list);
    }, (err) => {
      console.error('Firestore Snapshot error for vaga candidatos:', err);
      callback([]);
    });

    return unsubscribe;
  }

  /**
   * Save or Update Candidacy (Deduplication requirement: 1 candidacy per vagaId + candidateId)
   */
  static async saveOrUpdateCandidatura(data: {
    empresaId: string;
    vagaId: string;
    candidateId: string;
    etapa?: ProcessStage;
    status?: 'Inscrito' | 'Em Análise' | 'Entrevista' | 'Aprovado' | 'Contratado' | 'Reprovado' | 'Desistiu';
    matchIa?: number;
    triagemIaParecer?: string;
    origem?: string;
  }): Promise<string> {
    const docId = `${data.vagaId}_${data.candidateId}`;
    const docRef = doc(db, 'candidaturas', docId);

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const candidaturaObj: CandidaturaDoc = {
      id: docId,
      empresaId: data.empresaId,
      vagaId: data.vagaId,
      candidateId: data.candidateId,
      status: data.status || 'Inscrito',
      etapa: data.etapa || 'Inscrito',
      matchIa: data.matchIa || 85,
      triagemIaParecer: data.triagemIaParecer || 'Triagem efetuada.',
      origem: data.origem || 'Portal de Vagas',
      createdAt: now,
      updatedAt: now
    };

    try {
      await setDoc(docRef, sanitizeFirestoreData(candidaturaObj), { merge: true });
    } catch (err) {
      console.error('Erro ao salvar candidatura no Firestore:', err);
    }

    return docId;
  }

  /**
   * Move stage of a candidate
   */
  static async moveStage(candidaturaId: string, candidateId: string, newStage: ProcessStage): Promise<void> {
    try {
      if (candidaturaId && !candidaturaId.startsWith('candproc-')) {
        const docRef = doc(db, 'candidaturas', candidaturaId);
        await updateDoc(docRef, {
          etapa: newStage,
          status: newStage === 'Contratado' ? 'Contratado' : newStage === 'Reprovado' ? 'Reprovado' : 'Em Análise',
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn('Firestore update stage note:', err);
    }
  }

  /**
   * Add team annotation/note to a candidate profile
   */
  static async addAnnotation(candidateId: string, autor: string, texto: string): Promise<void> {
    try {
      if (!candidateId.startsWith('cand-')) {
        const candRef = doc(db, 'candidatos', candidateId);
        const candSnap = await getDoc(candRef);
        if (candSnap.exists()) {
          const existingNotes = candSnap.data().anotacoes || [];
          const newNote = {
            id: `note-${Date.now()}`,
            autor,
            data: new Date().toISOString().replace('T', ' ').substring(0, 16),
            texto
          };
          await updateDoc(candRef, {
            anotacoes: [newNote, ...existingNotes]
          });
        }
      }
    } catch (err) {
      console.warn('Erro ao salvar anotação:', err);
    }
  }
}
