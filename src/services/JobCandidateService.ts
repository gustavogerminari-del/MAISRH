import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc,
  deleteField,
  query, 
  where,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { sanitizeFirestoreData, resolveEmpresaId } from '../lib/firestoreUtils';
import { AuditService } from './AuditService';
import { CandidateService } from './CandidateService';
import { JobService } from './JobService';
import { enviarCandidatoParaAdmissaoDP } from '../departamento-pessoal/services/dpFirestoreService';
import { 
  getCompanyCapabilitiesFromFirestore, 
  resolveJobOriginWithCompany 
} from '../utils/companyModules';

export interface InterviewData {
  id?: string;
  type: 'Presencial' | 'Online' | 'Telefone';
  date: string;
  time: string;
  interviewer: string;
  location?: string;
  meetingLink?: string;
  notes?: string;
  status?: 'Agendada' | 'Reagendada' | 'Realizada' | 'Cancelada' | 'Aprovada' | 'Reprovada' | 'Em Análise' | string;
  parecerFinal?: string;
  feedback?: any;
}

export interface EvaluationData {
  id: string;
  technicalScore: number; // 1-5
  communicationScore: number; // 1-5
  postureScore: number; // 1-5
  knowledgeScore: number; // 1-5
  overallScore?: number; // 1-5
  parecerRH?: string;
  notes: string;
  competencies?: string[];
  strengths?: string[];
  improvements?: string[];
  aiOpinion?: string;
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
  | 'Reprovado'
  | 'Encerrado'
  | 'Vaga Preenchida'
  | 'Em Análise'
  | 'Em Processo';

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
  interviewStatus?: string;
  etapa?: string;
  
  // Rejection & Closing details
  motivoReprovacao?: string;
  observacaoReprovacao?: string;
  motivoEncerramento?: string;
  manterBancoTalentos?: boolean;
  reprovadoEm?: string;
  encerradoEm?: string;

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
  static async listAll(companyId?: string): Promise<JobCandidateApplication[]> {
    if (!companyId) return [];

    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('companyId', '==', companyId)
      );
      
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({
          ...(d.data() as JobCandidateApplication),
          id: d.id
        }));
      }
    } catch (err) {
      console.error('Erro ao buscar candidaturas no Firestore:', err);
      throw err;
    }

    return [];
  }

  static async listByJob(jobId: string, companyId?: string): Promise<JobCandidateApplication[]> {
    if (!jobId || !companyId) return [];

    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('companyId', '==', companyId),
        where('jobId', '==', jobId)
      );
      
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({
          ...(d.data() as JobCandidateApplication),
          id: d.id
        }));
      }
    } catch (err) {
      console.error('Erro ao buscar candidaturas por vaga no Firestore:', err);
      throw err;
    }

    return [];
  }

  static subscribeByCompany(
    companyId: string | undefined,
    onUpdate: (apps: JobCandidateApplication[]) => void,
    onError?: (err: any) => void
  ): () => void {
    if (!companyId) {
      onUpdate([]);
      return () => {};
    }

    const q = query(
      collection(db, COLLECTION_NAME),
      where('companyId', '==', companyId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const list: JobCandidateApplication[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as JobCandidateApplication;
          list.push({
            ...data,
            id: d.id
          });
        });
        onUpdate(list);
      },
      (err) => {
        console.error('Erro na assinatura em tempo real de candidaturas da empresa:', err);
        if (onError) onError(err);
        else onUpdate([]);
      }
    );
  }

  static subscribeByJob(
    jobId: string,
    companyId: string | undefined,
    onUpdate: (apps: JobCandidateApplication[]) => void,
    onError?: (err: any) => void
  ): () => void {
    if (!jobId || !companyId) {
      onUpdate([]);
      return () => {};
    }

    const q = query(
      collection(db, COLLECTION_NAME),
      where('companyId', '==', companyId),
      where('jobId', '==', jobId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const list: JobCandidateApplication[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as JobCandidateApplication;
          list.push({
            ...data,
            id: d.id
          });
        });
        onUpdate(list);
      },
      (err) => {
        console.error('Erro na assinatura em tempo real de candidaturas da vaga:', err);
        if (onError) onError(err);
        else onUpdate([]);
      }
    );
  }

  static async getById(id: string): Promise<JobCandidateApplication | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION_NAME, id));
      if (snap.exists()) {
        return {
          ...(snap.data() as JobCandidateApplication),
          id: snap.id
        };
      }
    } catch (err) {
      console.error('Erro ao buscar candidatura por ID no Firestore:', err);
      throw err;
    }

    return null;
  }

  static async create(appData: Partial<JobCandidateApplication> & { jobId: string; companyId: string }): Promise<JobCandidateApplication> {
    if (!appData.companyId) {
      throw new Error('companyId é obrigatório para registrar uma candidatura.');
    }

    // Verificar se já existe candidatura igual para esta mesma vaga
    if (appData.candidateId && appData.jobId && appData.companyId) {
      try {
        const qDup = query(
          collection(db, COLLECTION_NAME),
          where('companyId', '==', appData.companyId),
          where('jobId', '==', appData.jobId),
          where('candidateId', '==', appData.candidateId)
        );
        const snapDup = await getDocs(qDup);
        if (!snapDup.empty) {
          const existingDoc = snapDup.docs[0];
          return {
            ...(existingDoc.data() as JobCandidateApplication),
            id: existingDoc.id
          };
        }
      } catch (dupErr) {
        console.warn('Aviso ao verificar duplicidade de candidatura:', dupErr);
      }
    }

    const id = appData.id || `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newApp: JobCandidateApplication = {
      id,
      companyId: appData.companyId,
      jobId: appData.jobId,
      candidateId: appData.candidateId || `cand-${Date.now()}`,
      name: appData.name || '',
      cpf: appData.cpf || '',
      photo: appData.photo || '',
      email: appData.email || '',
      phone: appData.phone || '',
      role: appData.role || '',
      city: appData.city || '',
      state: appData.state || '',
      appliedDate: appData.appliedDate || new Date().toISOString().split('T')[0],
      status: appData.status || 'Novos',
      education: appData.education || '',
      course: appData.course || '',
      experienceYears: appData.experienceYears || 0,
      salaryExpectation: appData.salaryExpectation || '',
      availability: appData.availability || '',
      isPCD: appData.isPCD || false,
      resumeUrl: appData.resumeUrl || '',
      resumeKeywords: appData.resumeKeywords || [],
      compatibilityScore: appData.compatibilityScore || 85,
      compatibilityLevel: appData.compatibilityLevel || 'Compatível',
      objective: appData.objective || '',
      experiences: appData.experiences || [],
      educationDetails: appData.educationDetails || [],
      aiAnalysis: appData.aiAnalysis,
      interview: appData.interview,
      evaluations: appData.evaluations || [],
      timeline: appData.timeline || [
        {
          id: `evt-${Date.now()}`,
          title: 'Candidatura Recebida',
          description: 'Candidatura registrada.',
          date: new Date().toISOString().replace('T', ' ').substring(0, 16)
        }
      ],
      notes: appData.notes || [],
      createdAt: now,
      updatedAt: now
    };

    try {
      await setDoc(doc(db, COLLECTION_NAME, id), sanitizeFirestoreData(newApp), { merge: true });
      await AuditService.log({
        action: 'CREATE',
        description: `Candidatura de ${newApp.name} criada para a vaga ${newApp.jobId}`,
        moduleName: 'Recrutamento',
        targetEntity: 'Candidatura',
        companyId: appData.companyId
      });
    } catch (err) {
      console.error('Erro ao salvar candidatura no Firestore:', err);
      throw err;
    }

    return newApp;
  }

  static async updateStatus(id: string, status: ApplicationStatus, notes?: string): Promise<void> {
    try {
      const existing = await this.getById(id);
      if (!existing) throw new Error('Candidatura não encontrada.');

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

      const updatedApp: JobCandidateApplication = {
        ...existing,
        status,
        timeline: updatedTimeline,
        updatedAt: now
      };

      await setDoc(doc(db, COLLECTION_NAME, id), sanitizeFirestoreData(updatedApp), { merge: true });

      // Sincronizar com Banco de Talentos
      if (existing.candidateId) {
        let candStatus: 'Ativo' | 'Em Processo' | 'Contratado' | 'Indisponível' = 'Em Processo';
        if (status === 'Contratado' || status === 'Aprovado') candStatus = 'Contratado';
        else if (status === 'Reprovado') candStatus = 'Indisponível';

        await CandidateService.update(existing.candidateId, {
          status: candStatus,
          currentJobId: existing.jobId
        });
      }

      await AuditService.log({
        action: 'UPDATE',
        description: `Status da candidatura ${id} alterado para ${status}`,
        moduleName: 'Recrutamento',
        targetEntity: 'Candidatura',
        companyId: existing.companyId
      });
    } catch (err) {
      console.error('Erro ao atualizar status da candidatura no Firestore:', err);
      throw err;
    }
  }

  static async hireCandidate(
    candidate: JobCandidateApplication, 
    jobTitle?: string,
    options: { closeOtherCandidates?: boolean } = { closeOtherCandidates: true }
  ): Promise<{
    success: boolean;
    admissionSent: boolean;
    profileUpdated: boolean;
    othersClosedCount?: number;
    warnings: string[];
  }> {
    console.log("[HIRE] Iniciando contratação");
    console.log("[HIRE] Dados do candidato recebidos:", {
      id: candidate?.id,
      candidateId: candidate?.candidateId,
      companyId: candidate?.companyId,
      jobId: candidate?.jobId,
      name: candidate?.name,
      status: candidate?.status,
      authenticatedUid: auth.currentUser?.uid
    });

    if (!candidate || !candidate.id) {
      const err = new Error('ID real da candidatura não informado.');
      console.error("[HIRE] Falha de validação prévia:", err);
      throw err;
    }
    if (!candidate.companyId) {
      const err = new Error('Empresa da candidatura não identificada.');
      console.error("[HIRE] Falha de validação prévia:", err);
      throw err;
    }
    if (!candidate.jobId) {
      const err = new Error('Vaga da candidatura não identificada.');
      console.error("[HIRE] Falha de validação prévia:", err);
      throw err;
    }
    if (!candidate.name) {
      const err = new Error('Nome do candidato não informado.');
      console.error("[HIRE] Falha de validação prévia:", err);
      throw err;
    }

    if (candidate.status === 'Contratado') {
      const err = new Error('Candidato já contratado.');
      console.error("[HIRE] Falha de validação prévia:", err);
      throw err;
    }

    try {
      const now = new Date().toISOString();
      const titleToUse = jobTitle || candidate.role || 'Vaga Corporativa';

      let jobData: any = null;
      try {
        jobData = await JobService.getById(candidate.jobId);
      } catch (e) {
        console.warn('[HIRE] Não foi possível buscar dados da vaga:', e);
      }

      const companyIdToUse = resolveEmpresaId(candidate.companyId || jobData?.companyId || jobData?.empresaId);
      const capabilities = await getCompanyCapabilitiesFromFirestore(companyIdToUse);

      const resolvedOrigin = resolveJobOriginWithCompany(jobData || candidate, capabilities);

      if (resolvedOrigin === 'REQUIRES_CHOICE') {
        const err = new Error('Esta vaga ainda não possui uma origem definida. Escolha se ela é uma vaga interna ou de cliente do Headhunter.');
        console.error('[HIRE] Origem indefinida:', err);
        throw err;
      }

      if (resolvedOrigin === 'HEADHUNTER' && !capabilities.hasHeadhunter) {
        const err = new Error('Esta empresa não possui o módulo Headhunter.');
        console.error('[HIRE] Módulo não liberado:', err);
        throw err;
      }

      if (resolvedOrigin === 'RH_INTERNO' && !capabilities.hasDP) {
        const err = new Error('Esta empresa não possui o módulo de Admissão.');
        console.error('[HIRE] Módulo não liberado:', err);
        throw err;
      }

      const isHeadhunter = resolvedOrigin === 'HEADHUNTER';

      const origProc = isHeadhunter ? 'HEADHUNTER' : 'RH_INTERNO';
      const destContr = isHeadhunter ? 'FINANCEIRO_HEADHUNTER' : 'DP';
      const initialStatusForward = isHeadhunter ? 'Aguardando Cobrança' : 'Aguardando Admissão';

      // 1. Prepare timeline
      const updatedTimeline = [
        ...(candidate.timeline || []),
        {
          id: `evt-${Date.now()}`,
          title: 'Candidato Contratado',
          description: `Candidato(a) aprovado(a) e contratado(a) para a vaga ${titleToUse}.`,
          date: now.replace('T', ' ').substring(0, 16),
          by: auth.currentUser?.displayName || 'Recrutador RH'
        },
        {
          id: `evt-${Date.now()}-fwd`,
          title: isHeadhunter ? 'Encaminhado para Financeiro' : 'Encaminhado para DP',
          description: isHeadhunter ? 'Encaminhado automaticamente para o módulo Financeiro (Aguardando Cobrança)' : 'Encaminhado automaticamente para o Departamento Pessoal (Aguardando Admissão)',
          date: now.replace('T', ' ').substring(0, 16),
          by: 'Sistema ATS'
        }
      ];

      // Primary document updates
      const appUpdateDoc = sanitizeFirestoreData({
        companyId: candidate.companyId,
        empresaId: candidate.companyId,
        status: 'Contratado',
        etapa: 'Contratado',
        timeline: updatedTimeline,
        contratadoEm: now,
        updatedAt: now
      });

      const contratacaoId = `${candidate.jobId}_${candidate.candidateId || candidate.id}`;
      const contratacaoDoc = sanitizeFirestoreData({
        id: contratacaoId,
        companyId: candidate.companyId,
        empresaId: candidate.companyId,
        applicationId: candidate.id,
        candidaturaId: candidate.id,
        candidateId: candidate.candidateId || candidate.id,
        candidatoId: candidate.candidateId || candidate.id,
        candidateName: candidate.name,
        candidatoNome: candidate.name,
        jobId: candidate.jobId,
        vagaId: candidate.jobId,
        jobTitle: titleToUse,
        vagaTitulo: titleToUse,
        origemProcesso: origProc,
        destinoContratacao: destContr,
        encaminhadoPara: destContr,
        destino: isHeadhunter ? 'Financeiro' : 'DP',
        admissaoId: isHeadhunter ? null : `adm_${contratacaoId}`,
        statusAdmissao: isHeadhunter ? null : 'Aguardando Admissão',
        encaminhadoAdmissao: !isHeadhunter,
        encaminhadoAdmissaoEm: isHeadhunter ? null : now,
        status: 'Contratado',
        statusEncaminhamento: initialStatusForward,
        contratadoEm: now,
        createdAt: now,
        updatedAt: now,
        email: candidate.email || '',
        phone: candidate.phone || '',
        cpf: candidate.cpf || '',
        department: (candidate as any).department || jobData?.department || 'Não informado',
        city: candidate.city || '',
        state: candidate.state || '',
        salaryExpectation: candidate.salaryExpectation || jobData?.salary || 0,
        salarioContratado: candidate.salaryExpectation || jobData?.salary || 0,
        salarioFinal: candidate.salaryExpectation || jobData?.salary || 0,
        responsavelNome: auth.currentUser?.displayName || 'Recrutador RH',
        clienteId: (candidate as any).clienteId || (candidate as any).clientId || jobData?.clientId || jobData?.clienteId || null,
        clienteNome: (candidate as any).clienteNome || jobData?.clienteNome || null,
        consultorResponsavel: (candidate as any).consultorResponsavel || auth.currentUser?.displayName || 'Recrutador RH',
        observacoes: (candidate as any).observacoes || '',
        timeline: updatedTimeline
      });

      // 1. Etapa 1: Atualizar candidate_applications, criar contratacoes e criar documento de destino (DP ou Financeiro)
      console.log("[HIRE] Etapa 1: Atualizar candidate_applications, criar contratacoes e documento de destino");

      const batch = writeBatch(db);
      batch.set(doc(db, COLLECTION_NAME, candidate.id), appUpdateDoc, { merge: true });
      batch.set(doc(db, 'contratacoes', contratacaoId), contratacaoDoc, { merge: true });

      if (isHeadhunter) {
        const cobrancaId = `cob_${contratacaoId}`;
        const resolvedEmpId = resolveEmpresaId(candidate.companyId);
        const cobrancaDoc = sanitizeFirestoreData({
          id: cobrancaId,
          companyId: resolvedEmpId,
          empresaId: resolvedEmpId,
          clientId: (candidate as any).clienteId || (candidate as any).clientId || jobData?.clientId || jobData?.clienteId || 'cli-001',
          clienteId: (candidate as any).clienteId || (candidate as any).clientId || jobData?.clientId || jobData?.clienteId || 'cli-001',
          clienteNome: (candidate as any).clienteNome || jobData?.clienteNome || 'Cliente Headhunter',
          candidateId: candidate.candidateId || candidate.id,
          candidatoId: candidate.candidateId || candidate.id,
          applicationId: candidate.id,
          candidaturaId: candidate.id,
          jobId: candidate.jobId,
          vagaId: candidate.jobId,
          vagaTitulo: titleToUse,
          candidatoNome: candidate.name,
          contratacaoId: contratacaoId,
          valor: candidate.salaryExpectation || jobData?.salary || 0,
          percentual: jobData?.feePercentual || 15,
          comissao: (candidate.salaryExpectation || jobData?.salary || 0) * ((jobData?.feePercentual || 15) / 100),
          dataContratacao: now,
          vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'Aguardando Cobrança',
          historicoStatus: [
            {
              id: `hist-${Date.now()}`,
              dataHora: now,
              statusAnterior: 'Contratado',
              novoStatus: 'Aguardando Cobrança',
              origem: 'Headhunter',
              destino: 'Financeiro',
              usuario: auth.currentUser?.displayName || 'Recrutador RH',
              descricao: 'Encaminhado automaticamente para o módulo Financeiro (Aguardando Cobrança)'
            }
          ],
          createdAt: now,
          updatedAt: now
        });
        batch.set(doc(db, 'financeiro_cobrancas', cobrancaId), cobrancaDoc, { merge: true });
      } else {
        const admissaoId = `adm_${contratacaoId}`;
        const resolvedEmpId = resolveEmpresaId(candidate.companyId);
        const admissaoDoc = sanitizeFirestoreData({
          id: admissaoId,
          companyId: resolvedEmpId,
          empresaId: resolvedEmpId,
          candidateId: candidate.candidateId || candidate.id,
          candidatoId: candidate.candidateId || candidate.id,
          applicationId: candidate.id,
          candidaturaId: candidate.id,
          jobId: candidate.jobId,
          vagaId: candidate.jobId,
          vagaTitulo: titleToUse,
          contratacaoId: contratacaoId,
          nome: candidate.name,
          nomeCompleto: candidate.name,
          email: candidate.email || '',
          telefone: candidate.phone || '',
          cpf: candidate.cpf || '',
          cargo: titleToUse,
          departamento: (candidate as any).department || jobData?.department || 'Operações',
          tipoContrato: jobData?.tipoContrato || 'CLT',
          salario: candidate.salaryExpectation || jobData?.salary || 0,
          salarioCombinado: candidate.salaryExpectation || jobData?.salary || 0,
          beneficios: jobData?.beneficios || 'Nenhum informado',
          empresa: (candidate as any).companyName || 'Empresa',
          status: 'Aguardando Admissão',
          checklist: [
            { item: 'RG', obrigatorio: true, concluido: !!(candidate as any).rg },
            { item: 'CPF', obrigatorio: true, concluido: !!candidate.cpf },
            { item: 'Carteira de Trabalho (CTPS)', obrigatorio: true, concluido: false },
            { item: 'Comprovante de Residência', obrigatorio: true, concluido: false },
            { item: 'Exame Admissional (ASO)', obrigatorio: true, concluido: false }
          ],
          historicoEtapas: [
            {
              dataHora: now,
              usuario: auth.currentUser?.displayName || 'Recrutador RH',
              acao: 'Solicitação de Admissão Criada',
              descricao: 'Encaminhado automaticamente para o Departamento Pessoal (Aguardando Admissão)',
              origem: 'RH Interno',
              destino: 'Departamento Pessoal',
              statusAnterior: 'Contratado',
              novoStatus: 'Aguardando Admissão'
            }
          ],
          createdAt: now,
          updatedAt: now
        });
        batch.set(doc(db, 'solicitacoes_admissao', admissaoId), admissaoDoc, { merge: true });
      }

      await batch.commit();
      console.log("[HIRE] Etapa 1 CONCLUÍDA com sucesso!");

      let profileUpdated = false;
      let admissionSent = false;
      let othersClosedCount = 0;
      const warnings: string[] = [];

      // 2. Etapa 2: Encerrar outros candidatos da vaga
      if (options.closeOtherCandidates !== false) {
        console.log("[HIRE] Etapa 2: Encerrar outros candidatos da vaga");
        try {
          const qOther = query(
            collection(db, COLLECTION_NAME),
            where('companyId', '==', candidate.companyId),
            where('jobId', '==', candidate.jobId)
          );
          const snapOther = await getDocs(qOther);

          const closeBatch = writeBatch(db);
          let pendingCloseOps = 0;

          for (const docItem of snapOther.docs) {
            if (docItem.id === candidate.id) continue;
            const data = docItem.data() as JobCandidateApplication;

            if (
              data.status === 'Contratado' ||
              data.status === 'Encerrado' ||
              data.status === 'Reprovado' ||
              (data.status as string) === 'Vaga Preenchida'
            ) {
              continue;
            }

            const closeTimeline = [
              ...(data.timeline || []),
              {
                id: `evt-${Date.now()}-${docItem.id}`,
                title: 'Processo encerrado',
                description: 'A vaga foi preenchida por outro candidato. Perfil mantido no Banco de Talentos.',
                date: now.replace('T', ' ').substring(0, 16),
                by: auth.currentUser?.displayName || 'Recrutador RH'
              }
            ];

            const closePayload = sanitizeFirestoreData({
              status: 'Encerrado',
              etapa: 'Vaga Preenchida',
              motivoEncerramento: 'Outro candidato contratado',
              manterBancoTalentos: true,
              encerradoEm: now,
              updatedAt: now,
              timeline: closeTimeline
            });

            closeBatch.set(doc(db, COLLECTION_NAME, docItem.id), closePayload, { merge: true });
            pendingCloseOps++;
            othersClosedCount++;

            if (data.candidateId) {
              try {
                await CandidateService.update(data.candidateId, {
                  status: 'Ativo',
                  notes: `Participou da vaga ${candidate.jobId} (Vaga Preenchida por outro candidato). Perfil mantido no Banco de Talentos.`
                });
              } catch (pErr) {
                console.warn(`[HIRE] Aviso ao atualizar Banco de Talentos do candidato ${data.candidateId}:`, pErr);
              }
            }
          }

          if (pendingCloseOps > 0) {
            await closeBatch.commit();
          }
          console.log(`[HIRE] Etapa 2 CONCLUÍDA! (${othersClosedCount} outros candidatos encerrados)`);
        } catch (closeErr: any) {
          console.error('[HIRE] Erro na Etapa 2 ao encerrar outros candidatos:', closeErr);
          warnings.push(`Candidato contratado, mas alguns participantes da vaga ainda precisam ser encerrados: ${closeErr?.message || 'Erro de sincronização'}`);
        }
      }

      // 3. Etapa 3: Atualizar status da vaga
      console.log("[HIRE] Etapa 3: Atualizar status da vaga no JobService");
      try {
        const job = await JobService.getById(candidate.jobId);
        if (job) {
          const jobOpenings = Number(job.openings || (job as any).vagasCount || (job as any).totalVagas || 1);
          
          const qHired = query(
            collection(db, COLLECTION_NAME),
            where('companyId', '==', candidate.companyId),
            where('jobId', '==', candidate.jobId),
            where('status', '==', 'Contratado')
          );
          const snapHired = await getDocs(qHired);
          const totalHired = snapHired.size;

          if (totalHired >= jobOpenings || options.closeOtherCandidates) {
            await JobService.update(candidate.jobId, {
              status: 'Preenchida',
              statusVaga: 'Preenchida',
              preenchidaEm: now
            });
            console.log("[HIRE] Etapa 3 CONCLUÍDA! Vaga marcada como Preenchida.");
          } else {
            console.log(`[HIRE] Etapa 3 CONCLUÍDA! Vaga mantida em aberto (${totalHired}/${jobOpenings} contratados).`);
          }
        }
      } catch (jobErr: any) {
        console.warn('[HIRE] Aviso ao verificar/atualizar status da vaga:', jobErr);
      }

      // 4. Etapa 4: Atualizar perfil do candidato no Banco de Talentos
      if (candidate.candidateId) {
        console.log("[HIRE] Etapa 4: Atualizar perfil do candidato no Banco de Talentos");
        try {
          await CandidateService.update(candidate.candidateId, {
            status: 'Contratado',
            currentJobId: candidate.jobId,
            currentStageId: 'contratado'
          });
          profileUpdated = true;
          console.log("[HIRE] Etapa 4 CONCLUÍDA com sucesso!");
        } catch (e: any) {
          console.warn('[HIRE] Aviso ao atualizar perfil no Banco de Talentos:', e);
          warnings.push('Perfil do candidato no Banco de Talentos não pôde ser sincronizado.');
        }
      }

      // 5. Etapa 5: Log de Auditoria
      console.log("[HIRE] Etapa 5: Registrar log de auditoria no AuditService");
      try {
        await AuditService.log({
          action: 'UPDATE',
          description: `Candidato ${candidate.name} contratado para a vaga ${titleToUse}`,
          moduleName: 'Recrutamento',
          targetEntity: 'Contratação',
          companyId: candidate.companyId
        });
        console.log("[HIRE] Etapa 5 CONCLUÍDA com sucesso!");
      } catch (e: any) {
        console.warn('[HIRE] Aviso ao registrar auditoria:', e);
      }

      console.log("[HIRE] Processo de contratação finalizado com sucesso!");

      return {
        success: true,
        admissionSent: false,
        profileUpdated,
        othersClosedCount,
        warnings
      };
    } catch (error: any) {
      console.error("[HIRE] Erro completo:", error);
      console.error("[HIRE] Stack trace completo:", error?.stack);
      throw error;
    }
  }

  /**
   * Forward a hiring record to DP admission after hiring
   */
  static async forwardHiring(
    hiring: any,
    targetDestination: 'departamento_pessoal' | 'headhunter' = 'departamento_pessoal'
  ): Promise<{ success: boolean; message: string }> {
    if (!hiring || !hiring.id) throw new Error('ID da contratação inválido.');

    const now = new Date().toISOString();
    const contratacaoId = hiring.id;

    try {
      const isHeadhunter = targetDestination === 'headhunter' || hiring.origemProcesso === 'headhunter' || hiring.destinoContratacao === 'headhunter';

      if (isHeadhunter) {
        const cobrancaId = `cob_${contratacaoId}`;
        const cobrancaDoc = sanitizeFirestoreData({
          id: cobrancaId,
          companyId: hiring.companyId || hiring.empresaId || 'emp-001',
          empresaId: hiring.companyId || hiring.empresaId || 'emp-001',
          clientId: hiring.clienteId || hiring.clientId || 'cli-001',
          clienteId: hiring.clienteId || hiring.clientId || 'cli-001',
          clienteNome: hiring.clienteNome || 'Cliente Headhunter',
          candidateId: hiring.candidateId || hiring.candidatoId,
          candidatoId: hiring.candidateId || hiring.candidatoId,
          applicationId: hiring.applicationId || hiring.candidaturaId || hiring.id,
          candidaturaId: hiring.applicationId || hiring.candidaturaId || hiring.id,
          jobId: hiring.jobId || hiring.vagaId,
          vagaId: hiring.jobId || hiring.vagaId,
          vagaTitulo: hiring.jobTitle || hiring.vagaTitulo || 'Cargo não informado',
          candidatoNome: hiring.candidateName || hiring.candidatoNome,
          contratacaoId: contratacaoId,
          valor: hiring.salarioContratado || hiring.salaryExpectation || 0,
          percentual: hiring.feePercentual || 15,
          comissao: (hiring.salarioContratado || hiring.salaryExpectation || 0) * ((hiring.feePercentual || 15) / 100),
          dataContratacao: hiring.contratadoEm || now,
          vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'Aguardando Cobrança',
          historicoStatus: [
            {
              id: `hist-${Date.now()}`,
              dataHora: now,
              statusAnterior: hiring.statusEncaminhamento || 'Contratado',
              novoStatus: 'Aguardando Cobrança',
              origem: 'Headhunter',
              destino: 'Financeiro',
              usuario: auth.currentUser?.displayName || 'Recrutador RH',
              descricao: 'Processo encaminhado para o módulo Financeiro (Aguardando Cobrança)'
            }
          ],
          createdAt: now,
          updatedAt: now
        });

        await setDoc(doc(db, 'financeiro_cobrancas', cobrancaId), cobrancaDoc, { merge: true });

        await setDoc(doc(db, 'contratacoes', contratacaoId), sanitizeFirestoreData({
          statusEncaminhamento: 'Aguardando Cobrança',
          encaminhadoPara: 'financeiro',
          destinoContratacao: 'financeiro',
          encaminhadoEm: now,
          updatedAt: now
        }), { merge: true });

        return {
          success: true,
          message: 'Processo encaminhado para o módulo Financeiro com sucesso!'
        };
      } else {
        await enviarCandidatoParaAdmissaoDP({
          id: hiring.candidaturaId || hiring.applicationId || hiring.id,
          candidateId: hiring.candidateId || hiring.candidatoId,
          jobId: hiring.jobId || hiring.vagaId,
          companyId: hiring.companyId || hiring.empresaId,
          name: hiring.candidateName || hiring.candidatoNome,
          email: hiring.email || '',
          phone: hiring.phone || '',
          cpf: hiring.cpf || '',
          role: hiring.jobTitle || hiring.vagaTitulo || 'Cargo não informado',
          vagaTitulo: hiring.jobTitle || hiring.vagaTitulo || 'Cargo não informado',
          department: hiring.department || 'Não informado',
          salaryExpectation: hiring.salarioContratado || hiring.salaryExpectation || 0,
          city: hiring.city || '',
          state: hiring.state || ''
        });

        await setDoc(doc(db, 'contratacoes', contratacaoId), sanitizeFirestoreData({
          statusEncaminhamento: 'Aguardando Admissão',
          encaminhadoPara: 'departamento_pessoal',
          destinoContratacao: 'departamento_pessoal',
          destino: 'DP',
          admissaoId: `adm_${contratacaoId}`,
          statusAdmissao: 'Aguardando Admissão',
          encaminhadoAdmissao: true,
          encaminhadoAdmissaoEm: now,
          encaminhadoEm: now,
          updatedAt: now
        }), { merge: true });

        return {
          success: true,
          message: 'Candidato enviado para Admissão no Departamento Pessoal com sucesso!'
        };
      }
    } catch (err: any) {
      console.error('Erro ao encaminhar processo:', err);
      throw new Error(`Falha ao encaminhar processo: ${err?.message || 'Erro de salvamento no Firestore'}`);
    }
  }

  static async rejectCandidate(
    candidateId: string, 
    data: {
      motivoReprovacao: string;
      observacaoReprovacao?: string;
      manterBancoTalentos: boolean;
    }
  ): Promise<void> {
    if (!candidateId) throw new Error('ID do candidato inválido.');

    try {
      const existing = await this.getById(candidateId);
      if (!existing) throw new Error('Candidatura não encontrada.');

      const now = new Date().toISOString();
      const updatedTimeline = [
        ...(existing.timeline || []),
        {
          id: `evt-${Date.now()}`,
          title: 'Candidatura Reprovada',
          description: `Motivo: ${data.motivoReprovacao}.${data.observacaoReprovacao ? ` Obs: ${data.observacaoReprovacao}` : ''}`,
          date: now.replace('T', ' ').substring(0, 16),
          by: auth.currentUser?.displayName || 'Recrutador RH'
        }
      ];

      const updatedApp = {
        ...existing,
        status: 'Reprovado' as ApplicationStatus,
        motivoReprovacao: data.motivoReprovacao,
        observacaoReprovacao: data.observacaoReprovacao || '',
        manterBancoTalentos: data.manterBancoTalentos,
        reprovadoEm: now,
        timeline: updatedTimeline,
        updatedAt: now
      };

      await setDoc(doc(db, COLLECTION_NAME, candidateId), sanitizeFirestoreData(updatedApp), { merge: true });

      // Atualizar no Banco de Talentos
      if (existing.candidateId) {
        try {
          await CandidateService.update(existing.candidateId, {
            status: data.manterBancoTalentos ? 'Ativo' : 'Indisponível'
          });
        } catch (e) {
          console.warn('Aviso ao atualizar perfil no Banco de Talentos:', e);
        }
      }

      await AuditService.log({
        action: 'UPDATE',
        description: `Candidato ${existing.name} reprovado na vaga ${existing.jobId}. Motivo: ${data.motivoReprovacao}`,
        moduleName: 'Recrutamento',
        targetEntity: 'Candidatura',
        companyId: existing.companyId
      });
    } catch (err) {
      console.error('Erro ao reprovar candidato:', err);
      throw err;
    }
  }

  static async updateInterview(id: string, interview: InterviewData, jobTitle?: string): Promise<void> {
    try {
      const existing = await this.getById(id);
      if (!existing) throw new Error('Candidatura não encontrada.');

      const now = new Date().toISOString();
      const titleToUse = jobTitle || existing.role || 'Vaga Corporativa';
      
      const isNew = !existing.interview;
      const statusToSet = interview.status || (isNew ? 'Agendada' : 'Reagendada');

      const interviewObj: InterviewData = {
        ...interview,
        id: interview.id || existing.interview?.id || `int-${id}`,
        status: statusToSet
      };

      const timelineTitle = isNew 
        ? 'Entrevista Agendada' 
        : statusToSet === 'Reagendada' 
          ? 'Entrevista Reagendada' 
          : statusToSet === 'Cancelada' 
            ? 'Entrevista Cancelada' 
            : statusToSet === 'Realizada' 
              ? 'Entrevista Realizada' 
              : 'Entrevista Atualizada';

      const updatedTimeline = [
        ...(existing.timeline || []),
        {
          id: `evt-${Date.now()}`,
          title: timelineTitle,
          description: `Entrevista ${interview.type} ${isNew ? 'agendada' : 'atualizada'} para ${interview.date} às ${interview.time} com ${interview.interviewer}. Status: ${statusToSet}.`,
          date: now.replace('T', ' ').substring(0, 16),
          by: auth.currentUser?.displayName || 'Recrutador RH'
        }
      ];

      let appStatus: ApplicationStatus = existing.status;
      if (statusToSet === 'Realizada') {
        appStatus = 'Entrevista Realizada';
      } else if (statusToSet === 'Agendada' || statusToSet === 'Reagendada') {
        appStatus = 'Entrevista Agendada';
      }

      const updatedApp: JobCandidateApplication = {
        ...existing,
        status: appStatus,
        interview: interviewObj,
        timeline: updatedTimeline,
        updatedAt: now
      };

      await setDoc(doc(db, COLLECTION_NAME, id), sanitizeFirestoreData(updatedApp), { merge: true });

      // 1. Atualizar ou criar documento na coleção 'entrevistas'
      let interviewDocId = interview.id || existing.interview?.id;

      if (!interviewDocId) {
        try {
          const qInt = query(
            collection(db, 'entrevistas'),
            where('jobId', '==', existing.jobId),
            where('candidateId', '==', existing.candidateId || existing.id)
          );
          const snap = await getDocs(qInt);
          if (!snap.empty) {
            interviewDocId = snap.docs[0].id;
          }
        } catch (e) {
          console.warn('Busca de entrevista existente no Firestore falhou:', e);
        }
      }

      if (!interviewDocId) {
        interviewDocId = `int-${id}-${Date.now()}`;
      }

      const interviewDoc = {
        id: interviewDocId,
        companyId: existing.companyId,
        empresaId: existing.companyId,
        candidateId: existing.candidateId || existing.id,
        candidatoId: existing.candidateId || existing.id,
        applicationId: existing.id,
        candidateName: existing.name,
        candidatoNome: existing.name,
        jobId: existing.jobId,
        vagaId: existing.jobId,
        jobTitle: titleToUse,
        vagaTitulo: titleToUse,
        date: interview.date,
        time: interview.time,
        interviewer: interview.interviewer,
        modalidade: interview.type,
        location: interview.location || '',
        meetingLink: interview.meetingLink || '',
        notes: interview.notes || '',
        status: statusToSet,
        createdAt: now,
        updatedAt: now
      };
      await setDoc(doc(db, 'entrevistas', interviewDocId), sanitizeFirestoreData(interviewDoc), { merge: true });

      // 2. Atualizar ou criar documento na coleção 'agenda'
      let agendaDocId = `age-${id}`;
      try {
        const qAge = query(
          collection(db, 'agenda'),
          where('jobId', '==', existing.jobId),
          where('candidateId', '==', existing.candidateId || existing.id)
        );
        const snapAge = await getDocs(qAge);
        if (!snapAge.empty) {
          agendaDocId = snapAge.docs[0].id;
        }
      } catch (e) {
        console.warn('Busca na agenda no Firestore falhou:', e);
      }

      const agendaDoc = {
        id: agendaDocId,
        companyId: existing.companyId,
        empresaId: existing.companyId,
        title: `Entrevista (${statusToSet}): ${existing.name} - ${titleToUse}`,
        date: interview.date,
        time: interview.time,
        type: 'Entrevista',
        candidateId: existing.candidateId || existing.id,
        jobId: existing.jobId,
        applicationId: existing.id,
        interviewer: interview.interviewer,
        notes: interview.notes || '',
        status: statusToSet,
        updatedAt: now
      };
      await setDoc(doc(db, 'agenda', agendaDocId), sanitizeFirestoreData(agendaDoc), { merge: true });

      // 3. Atualizar perfil do candidato
      if (existing.candidateId) {
        try {
          await CandidateService.update(existing.candidateId, {
            status: 'Em Processo',
            currentStageId: 'entrevista_rh'
          });
        } catch (e) {
          console.warn('Aviso ao atualizar perfil no Banco de Talentos:', e);
        }
      }

      await AuditService.log({
        action: 'UPDATE',
        description: `Entrevista ${isNew ? 'agendada' : 'atualizada'} para o candidato ${existing.name}`,
        moduleName: 'Recrutamento',
        targetEntity: 'Entrevista',
        companyId: existing.companyId
      });
    } catch (err) {
      console.error('Erro ao agendar/editar entrevista no Firestore:', err);
      throw err;
    }
  }

  static async scheduleInterview(id: string, interview: InterviewData, jobTitle?: string): Promise<void> {
    return this.updateInterview(id, interview, jobTitle);
  }

  static async saveInterviewFeedback(
    interviewId: string,
    feedback: {
      rating: number;
      strengths: string;
      weaknesses?: string;
      recommendation: string;
      evaluatedBy?: string;
      evaluatedAt?: string;
      internalNotes?: string;
    },
    statusOverride?: string
  ): Promise<{ status: string; candidateStatus: string; candidateStage: string }> {
    try {
      const now = new Date().toISOString();
      const user = auth.currentUser;
      const evaluator = feedback.evaluatedBy || user?.displayName || 'Recrutador RH';
      const evalDate = feedback.evaluatedAt || now.replace('T', ' ').substring(0, 16);

      const rec = (feedback.recommendation || statusOverride || '').trim().toLowerCase();
      const st = (statusOverride || '').trim().toLowerCase();

      let normalizedStatus: 'Agendada' | 'Realizada' | 'Aprovada' | 'Reprovada' | 'Em Análise' | 'Cancelada' = 'Agendada';
      let appStatus: ApplicationStatus = 'Em Processo';
      let appEtapa = 'Etapa de Entrevista';
      let timelineTipo = 'entrevista';
      let timelineTitle = 'Entrevista';
      let timelineDesc = '';

      if (st.includes('aprovad') || rec.includes('aprov') || rec.includes('avançar') || rec.includes('avancar')) {
        normalizedStatus = 'Aprovada';
        appStatus = 'Aprovado';
        appEtapa = 'Aprovado na Entrevista';
        timelineTipo = 'entrevista_aprovada';
        timelineTitle = 'Entrevista aprovada';
        timelineDesc = `Candidato aprovado na etapa de entrevista. Recomendação: ${feedback.recommendation || 'Aprovar'}.`;
      } else if (st.includes('reprovad') || rec.includes('reprov')) {
        normalizedStatus = 'Reprovada';
        appStatus = 'Reprovado';
        appEtapa = 'Reprovado na Entrevista';
        timelineTipo = 'entrevista_reprovada';
        timelineTitle = 'Entrevista reprovada';
        timelineDesc = `Candidato reprovado na etapa de entrevista. Motivo: ${feedback.strengths || feedback.weaknesses || 'Avaliador recomendou reprovação'}.`;
      } else if (st.includes('análise') || st.includes('analise') || rec.includes('dúvida') || rec.includes('duvida') || rec.includes('pendente') || rec.includes('manter')) {
        normalizedStatus = 'Em Análise';
        appStatus = 'Em Análise';
        appEtapa = 'Avaliação de Entrevista';
        timelineTipo = 'entrevista_em_analise';
        timelineTitle = 'Entrevista em análise';
        timelineDesc = 'Avaliação de entrevista pendente de parecer final.';
      } else if (st.includes('realizad') || st.includes('concluíd') || st.includes('concluid')) {
        normalizedStatus = 'Realizada';
        appStatus = 'Em Análise';
        appEtapa = 'Aguardando Avaliação';
        timelineTipo = 'entrevista_realizada';
        timelineTitle = 'Entrevista realizada';
        timelineDesc = 'Entrevista realizada. Aguardando avaliação do entrevistador.';
      } else {
        normalizedStatus = 'Aprovada';
        appStatus = 'Aprovado';
        appEtapa = 'Aprovado na Entrevista';
        timelineTipo = 'entrevista_aprovada';
        timelineTitle = 'Entrevista aprovada';
        timelineDesc = 'Candidato aprovado na etapa de entrevista.';
      }

      const parecerFinalValue = normalizedStatus === 'Aprovada' ? 'Aprovado' : normalizedStatus === 'Reprovada' ? 'Reprovado' : 'Em Análise';

      const feedbackObj = {
        rating: feedback.rating || 5,
        strengths: feedback.strengths || '',
        weaknesses: feedback.weaknesses || '',
        recommendation: feedback.recommendation || (normalizedStatus === 'Aprovada' ? 'Aprovar' : 'Reprovar'),
        evaluatedBy: evaluator,
        evaluatedAt: evalDate,
        internalNotes: feedback.internalNotes || ''
      };

      // Find Application
      let targetAppId = interviewId.startsWith('int-app-') ? interviewId.replace('int-app-', '') : interviewId;
      let existingApp: JobCandidateApplication | null = await this.getById(targetAppId);

      if (!existingApp) {
        const q = query(collection(db, COLLECTION_NAME), where('interview.id', '==', interviewId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          targetAppId = snap.docs[0].id;
          existingApp = { id: snap.docs[0].id, ...snap.docs[0].data() } as JobCandidateApplication;
        }
      }

      if (existingApp) {
        const updatedTimeline = [
          ...(existingApp.timeline || []),
          {
            id: `evt-${Date.now()}`,
            tipo: timelineTipo,
            title: timelineTitle,
            description: timelineDesc,
            date: evalDate,
            by: evaluator
          }
        ];

        const updatedApp = {
          ...existingApp,
          status: appStatus,
          etapa: appEtapa,
          interviewStatus: normalizedStatus,
          interview: {
            ...(existingApp.interview || {
              type: 'Online',
              date: now.split('T')[0],
              time: '10:00',
              interviewer: evaluator
            }),
            status: normalizedStatus,
            parecerFinal: parecerFinalValue,
            feedback: feedbackObj
          },
          timeline: updatedTimeline,
          updatedAt: now
        };

        await setDoc(doc(db, COLLECTION_NAME, targetAppId), sanitizeFirestoreData(updatedApp), { merge: true });

        if (existingApp.candidateId) {
          try {
            await CandidateService.update(existingApp.candidateId, {
              status: appStatus === 'Aprovado' ? 'Ativo' : appStatus === 'Reprovado' ? 'Indisponível' : 'Em Processo',
              currentStageId: normalizedStatus === 'Aprovada' ? 'entrevista_gestor' : 'entrevista_rh'
            });
          } catch (e) {
            console.warn('Aviso ao atualizar perfil no Banco de Talentos:', e);
          }
        }
      }

      // Find and update document in 'entrevistas'
      let intDocId = interviewId;
      let intSnap = await getDoc(doc(db, 'entrevistas', intDocId));
      if (!intSnap.exists() && existingApp) {
        const qInt = query(collection(db, 'entrevistas'), where('applicationId', '==', targetAppId));
        const snapInt = await getDocs(qInt);
        if (!snapInt.empty) {
          intDocId = snapInt.docs[0].id;
          intSnap = snapInt.docs[0];
        }
      }

      const intData = {
        id: intDocId,
        status: normalizedStatus,
        parecerFinal: parecerFinalValue,
        feedback: feedbackObj,
        realizadaEm: now,
        avaliadaEm: now,
        updatedAt: now
      };

      await setDoc(doc(db, 'entrevistas', intDocId), sanitizeFirestoreData(intData), { merge: true });

      // Update agenda
      if (existingApp) {
        try {
          const qAge = query(collection(db, 'agenda'), where('applicationId', '==', targetAppId));
          const snapAge = await getDocs(qAge);
          if (!snapAge.empty) {
            await setDoc(doc(db, 'agenda', snapAge.docs[0].id), sanitizeFirestoreData({
              status: normalizedStatus,
              updatedAt: now
            }), { merge: true });
          }
        } catch (e) {
          console.warn('Aviso ao atualizar agenda:', e);
        }
      }

      await AuditService.log({
        action: 'UPDATE',
        description: `Feedback de entrevista registrado (${normalizedStatus}) para ${interviewId}`,
        moduleName: 'Recrutamento',
        targetEntity: 'Entrevista',
        companyId: existingApp?.companyId || 'emp-001'
      });

      return { status: normalizedStatus, candidateStatus: appStatus, candidateStage: appEtapa };
    } catch (err) {
      console.error('Erro ao salvar feedback da entrevista:', err);
      throw err;
    }
  }

  static async addEvaluation(id: string, evaluation: Omit<EvaluationData, 'id' | 'evaluatedAt' | 'evaluatedBy'>): Promise<void> {
    try {
      const existing = await this.getById(id);
      if (!existing) throw new Error('Candidatura não encontrada.');

      const user = auth.currentUser;
      const now = new Date().toISOString();
      const evalObj: EvaluationData = {
        ...evaluation,
        id: `eval-${Date.now()}`,
        evaluatedBy: user?.displayName || 'Avaliador RH',
        evaluatedAt: now.replace('T', ' ').substring(0, 16)
      };

      const finalOp = evaluation.finalOpinion || 'Aprovado';
      let appStatus: ApplicationStatus = 'Em Processo';
      let appEtapa = 'Avaliação de Entrevista';
      let normStatus: 'Aprovada' | 'Reprovada' | 'Em Análise' = 'Em Análise';

      if (finalOp === 'Aprovado') {
        appStatus = 'Aprovado';
        appEtapa = 'Aprovado na Entrevista';
        normStatus = 'Aprovada';
      } else if (finalOp === 'Reprovado') {
        appStatus = 'Reprovado';
        appEtapa = 'Reprovado na Entrevista';
        normStatus = 'Reprovada';
      } else {
        appStatus = 'Em Análise';
        appEtapa = 'Avaliação de Entrevista';
        normStatus = 'Em Análise';
      }

      const updatedEvaluations = [...(existing.evaluations || []), evalObj];
      const updatedTimeline = [
        ...(existing.timeline || []),
        {
          id: `evt-${Date.now()}`,
          tipo: normStatus === 'Aprovada' ? 'entrevista_aprovada' : normStatus === 'Reprovada' ? 'entrevista_reprovada' : 'entrevista_em_analise',
          title: `Entrevista ${normStatus.toLowerCase()}`,
          description: `Parecer final: ${evaluation.finalOpinion}. Obs: ${evaluation.notes || 'Sem observações'}.`,
          date: now.replace('T', ' ').substring(0, 16),
          by: user?.displayName || 'Avaliador RH'
        }
      ];

      const feedbackObj = {
        rating: evaluation.overallScore || 5,
        strengths: evaluation.parecerRH || '',
        weaknesses: evaluation.notes || '',
        recommendation: finalOp === 'Aprovado' ? 'Aprovar' : finalOp === 'Reprovado' ? 'Reprovar' : 'Em Dúvida',
        evaluatedBy: user?.displayName || 'Avaliador RH',
        evaluatedAt: now.replace('T', ' ').substring(0, 16)
      };

      const updatedApp: JobCandidateApplication = {
        ...existing,
        status: appStatus,
        etapa: appEtapa,
        interviewStatus: normStatus,
        interview: {
          ...(existing.interview || {
            type: 'Online',
            date: now.split('T')[0],
            time: '10:00',
            interviewer: user?.displayName || 'Avaliador RH'
          }),
          status: normStatus,
          parecerFinal: finalOp,
          feedback: feedbackObj
        },
        evaluations: updatedEvaluations,
        timeline: updatedTimeline,
        updatedAt: now
      };

      await setDoc(doc(db, COLLECTION_NAME, id), sanitizeFirestoreData(updatedApp), { merge: true });

      // Update 'entrevistas' collection
      try {
        const qInt = query(collection(db, 'entrevistas'), where('applicationId', '==', id));
        const snapInt = await getDocs(qInt);
        if (!snapInt.empty) {
          await setDoc(doc(db, 'entrevistas', snapInt.docs[0].id), sanitizeFirestoreData({
            status: normStatus,
            parecerFinal: finalOp,
            feedback: feedbackObj,
            avaliadaEm: now,
            updatedAt: now
          }), { merge: true });
        }
      } catch (e) {
        console.warn('Erro ao atualizar entrevistas no addEvaluation:', e);
      }

      await AuditService.log({
        action: 'UPDATE',
        description: `Nova avaliação registrada para a candidatura ${id}`,
        moduleName: 'Recrutamento',
        targetEntity: 'Avaliação',
        companyId: existing.companyId
      });
    } catch (err) {
      console.error('Erro ao adicionar avaliação no Firestore:', err);
      throw err;
    }
  }

  static async addNote(id: string, note: string): Promise<void> {
    try {
      const existing = await this.getById(id);
      if (!existing) throw new Error('Candidatura não encontrada.');

      const now = new Date().toISOString();
      const formattedNote = `[${now.replace('T', ' ').substring(0, 16)}] ${auth.currentUser?.displayName || 'RH'}: ${note}`;
      const updatedNotes = [...(existing.notes || []), formattedNote];

      const updatedApp: JobCandidateApplication = {
        ...existing,
        notes: updatedNotes,
        updatedAt: now
      };

      await setDoc(doc(db, COLLECTION_NAME, id), sanitizeFirestoreData(updatedApp), { merge: true });
    } catch (err) {
      console.error('Erro ao adicionar nota no Firestore:', err);
      throw err;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const existing = await this.getById(id);
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      await AuditService.log({
        action: 'DELETE',
        description: `Candidatura ${id} excluída do Firestore`,
        moduleName: 'Recrutamento',
        targetEntity: 'Candidatura',
        companyId: existing?.companyId
      });
    } catch (err) {
      console.error('Erro ao excluir candidatura no Firestore:', err);
      throw err;
    }
  }

  static async migrateIncompatibleHirings(companyId: string): Promise<{
    migratedCount: number;
    migratedIds: string[];
    canceledAdmissionsCount: number;
    financialLinkedCount: number;
    details: Array<{
      hiringId: string;
      candidatoNome: string;
      oldDestino: string;
      newDestino: string;
      existedAdmissionId?: string;
      wasAdmissionCanceled?: boolean;
      financialId?: string;
    }>;
  }> {
    if (!companyId) return { migratedCount: 0, migratedIds: [], canceledAdmissionsCount: 0, financialLinkedCount: 0, details: [] };

    try {
      const capabilities = await getCompanyCapabilitiesFromFirestore(companyId);
      if (!capabilities.hasHeadhunter || capabilities.hasDP) {
        // Migration only applies to companies with Headhunter active AND DP inactive
        return { migratedCount: 0, migratedIds: [], canceledAdmissionsCount: 0, financialLinkedCount: 0, details: [] };
      }

      const q = query(collection(db, 'contratacoes'), where('companyId', '==', companyId));
      const snapshot = await getDocs(q);

      const migratedIds: string[] = [];
      let canceledAdmissionsCount = 0;
      let financialLinkedCount = 0;
      const details: Array<any> = [];

      for (const docSnap of snapshot.docs) {
        const h = { id: docSnap.id, ...docSnap.data() } as any;

        const destUpper = String(h.destinoContratacao || h.destino || h.destinoProcesso || '').toUpperCase();
        const isIncompatible = 
          destUpper.includes('DP') ||
          destUpper.includes('ADMISSAO') ||
          destUpper.includes('DEPARTAMENTO PESSOAL') ||
          Boolean(h.statusAdmissao) ||
          Boolean(h.admissaoId) ||
          h.destinoContratacao === 'DP' ||
          h.destino === 'DP' ||
          h.destino === 'Departamento Pessoal';

        if (!isIncompatible) continue;

        const now = new Date().toISOString();
        const oldDestino = h.destinoProcesso || h.destinoContratacao || h.destino || 'Departamento Pessoal';
        const existingAdmissionId = h.admissaoId || `adm_${h.id}`;

        // 1. Locate or create financial billing document
        let targetFinancialId = h.financeiroId || h.cobrancaId;
        if (!targetFinancialId) {
          const qCob = query(collection(db, 'financeiro_cobrancas'), where('contratacaoId', '==', h.id));
          const snapCob = await getDocs(qCob);
          if (!snapCob.empty) {
            targetFinancialId = snapCob.docs[0].id;
          } else {
            const directRef = doc(db, 'financeiro_cobrancas', `cob_${h.id}`);
            const directSnap = await getDoc(directRef);
            if (directSnap.exists()) {
              targetFinancialId = directSnap.id;
            } else {
              const qRec = query(collection(db, 'receitas'), where('contratacaoId', '==', h.id));
              const snapRec = await getDocs(qRec);
              if (!snapRec.empty) {
                targetFinancialId = snapRec.docs[0].id;
              }
            }
          }
        }

        // If still not found, create a single billing record
        if (!targetFinancialId) {
          targetFinancialId = `cob_${h.id}`;
          const clientId = h.clientId || h.clienteId || '';
          const clientName = h.clienteNome || h.clientName || 'Cliente Headhunter';
          const candidateName = h.candidatoNome || h.candidateName || 'Candidato';
          const jobTitle = h.vagaTitulo || h.jobTitle || 'Vaga Corporativa';
          const isClientProvided = Boolean(clientId && clientId !== 'cli-001' && clientName !== 'Cliente Headhunter');

          const billingDoc = sanitizeFirestoreData({
            id: targetFinancialId,
            companyId: companyId,
            empresaId: companyId,
            contratacaoId: h.id,
            candidateId: h.candidateId || h.candidatoId || '',
            candidatoId: h.candidateId || h.candidatoId || '',
            applicationId: h.applicationId || h.candidaturaId || h.id,
            candidaturaId: h.applicationId || h.candidaturaId || h.id,
            jobId: h.jobId || h.vagaId || '',
            vagaId: h.jobId || h.vagaId || '',
            clientId: clientId || 'cli-001',
            clienteId: clientId || 'cli-001',
            clienteNome: clientName,
            candidatoNome: candidateName,
            vagaTitulo: jobTitle,
            status: isClientProvided ? "Aguardando Cobrança" : "Pendente de Dados Comerciais",
            valor: h.salarioContratado || h.salarioFinal || h.salario || 0,
            dataContratacao: h.contratadoEm || h.dataContratacao || now,
            createdAt: h.createdAt || now,
            updatedAt: now
          });

          await setDoc(doc(db, 'financeiro_cobrancas', targetFinancialId), billingDoc, { merge: true });
        }

        financialLinkedCount++;

        // 2. Check if solicitacoes_admissao doc exists and cancel if needed
        let wasAdmissionCanceled = false;
        try {
          let admDocRef = doc(db, 'solicitacoes_admissao', existingAdmissionId);
          let admSnap = await getDoc(admDocRef);
          if (!admSnap.exists()) {
            const qAdm = query(collection(db, 'solicitacoes_admissao'), where('contratacaoId', '==', h.id));
            const snapAdm = await getDocs(qAdm);
            if (!snapAdm.empty) {
              admDocRef = doc(db, 'solicitacoes_admissao', snapAdm.docs[0].id);
              admSnap = snapAdm.docs[0];
            }
          }

          if (admSnap.exists()) {
            const admData = admSnap.data();
            if (admData?.status !== 'Cancelada') {
              await setDoc(admDocRef, sanitizeFirestoreData({
                status: "Cancelada",
                motivoCancelamento: "Contratação pertence ao fluxo Headhunter",
                updatedAt: now
              }), { merge: true });
              wasAdmissionCanceled = true;
              canceledAdmissionsCount++;
            }
          }
        } catch (errAdm) {
          console.warn('Aviso ao verificar/cancelar admissão incorreta:', errAdm);
        }

        // 3. Update hiring doc in contratacoes with merge
        const updatedTimeline = [
          ...(h.timeline || []),
          {
            id: `evt-${Date.now()}-mig`,
            title: 'Migrado para Fluxo Headhunter',
            description: 'Ajuste de módulo: contratação redirecionada para Financeiro / Headhunter.',
            date: now.replace('T', ' ').substring(0, 16),
            by: 'Sistema ATS'
          }
        ];

        const updatePayload = sanitizeFirestoreData({
          origemProcesso: "HEADHUNTER",
          destinoContratacao: "FINANCEIRO_HEADHUNTER",
          destinoProcesso: "Financeiro / Headhunter",
          destino: "Financeiro",
          statusProcesso: "Aguardando Cobrança",
          statusFinanceiro: "Aguardando Cobrança",
          statusEncaminhamento: "Aguardando Cobrança",
          encaminhadoPara: "financeiro",
          encaminhadoFinanceiro: true,
          cobrancaId: targetFinancialId,
          financeiroId: targetFinancialId,
          isHeadhunter: true,
          timeline: updatedTimeline,
          updatedAt: now
        });

        // Use updateDoc to also remove DP navigation fields cleanly
        await updateDoc(doc(db, 'contratacoes', h.id), {
          ...updatePayload,
          admissaoId: deleteField(),
          statusAdmissao: deleteField(),
          encaminhadoAdmissao: deleteField(),
          encaminhadoAdmissaoEm: deleteField()
        });

        migratedIds.push(h.id);
        details.push({
          hiringId: h.id,
          candidatoNome: h.candidatoNome || h.candidateName || 'Candidato',
          oldDestino,
          newDestino: 'Financeiro / Headhunter',
          existedAdmissionId: existingAdmissionId,
          wasAdmissionCanceled,
          financialId: targetFinancialId
        });
      }

      return {
        migratedCount: migratedIds.length,
        migratedIds,
        canceledAdmissionsCount,
        financialLinkedCount,
        details
      };
    } catch (err) {
      console.error('Erro na migração de contratações incompatíveis:', err);
      return { migratedCount: 0, migratedIds: [], canceledAdmissionsCount: 0, financialLinkedCount: 0, details: [] };
    }
  }
}

